// src/admin/admin.service.ts
import { User } from '../models/User.model';
import { History } from '../models/History.model';
import { logInfo, logError } from '../utils/logger';

export class AdminService {
  async getDashboardAnalytics() {
    try {
      const [
        totalUsers,
        activeToday,
        totalHistoryEntries,
        featureUsage,
        popularErrors,
        apiPerformance
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveToday(),
        this.getTotalHistoryEntries(),
        this.getFeatureUsage(),
        this.getPopularErrors(),
        this.getAPIPerformance()
      ]);

      return {
        totalUsers,
        activeToday,
        totalHistoryEntries,
        featureUsage,
        popularErrors,
        apiPerformance,
        successRate: await this.calculateSuccessRate(),
        averageResponseTime: await this.getAverageResponseTime()
      };
    } catch (error) {
      logError(`Error getting dashboard analytics: ${error}`, 'AdminService');
      throw error;
    }
  }

  private async getTotalUsers(): Promise<number> {
    return await User.countDocuments();
  }

  private async getActiveToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    return await History.distinct('userId', {
      timestamp: { $gte: startOfDay }
    }).then(users => users.length);
  }

  private async getTotalHistoryEntries(): Promise<number> {
    return await History.countDocuments();
  }

  private async getFeatureUsage() {
    const result = await History.aggregate([
      {
        $group: {
          _id: '$feature',
          count: { $sum: 1 },
          percentage: { $avg: 1 }
        }
      },
      {
        $project: {
          feature: '$_id',
          count: 1,
          percentage: { $multiply: ['$percentage', 100] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  }

  private async getPopularErrors() {
    const result = await History.aggregate([
      {
        $match: {
          feature: 'debug',
          'metadata.errorType': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$metadata.errorType',
          count: { $sum: 1 },
          percentage: { $avg: 1 }
        }
      },
      {
        $project: {
          errorType: '$_id',
          count: 1,
          percentage: { $multiply: ['$percentage', 100] },
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return result;
  }

  private async getAPIPerformance() {
    const result = await History.aggregate([
      {
        $match: {
          'metadata.responseTime': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$source',
          avgResponseTime: { $avg: '$metadata.responseTime' },
          totalRequests: { $sum: 1 },
          maxResponseTime: { $max: '$metadata.responseTime' },
          minResponseTime: { $min: '$metadata.responseTime' }
        }
      },
      {
        $project: {
          source: '$_id',
          avgResponseTime: 1,
          totalRequests: 1,
          maxResponseTime: 1,
          minResponseTime: 1,
          _id: 0
        }
      }
    ]);

    return result;
  }

  private async calculateSuccessRate(): Promise<number> {
    // For now, we'll assume all saved responses are successful
    // You can enhance this by tracking failures separately
    const totalRequests = await History.countDocuments();
    const failedRequests = await History.countDocuments({
      'metadata.error': { $exists: true }
    });
    
    return totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 100;
  }

  private async getAverageResponseTime(): Promise<number> {
    const result = await History.aggregate([
      {
        $match: {
          'metadata.responseTime': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$metadata.responseTime' }
        }
      }
    ]);

    return result[0]?.avgResponseTime || 0;
  }

  async getUserStats() {
    try {
      const userStats = await History.aggregate([
        {
          $group: {
            _id: '$userId',
            totalRequests: { $sum: 1 },
            lastActivity: { $max: '$timestamp' },
            favoriteFeature: { 
              $first: {
                $arrayElemAt: [
                  {
                    $objectToArray: {
                      $arrayToObject: [
                        [
                          { k: 'debug', v: { $sum: { $cond: [{ $eq: ['$feature', 'debug'] }, 1, 0] } } },
                          { k: 'review', v: { $sum: { $cond: [{ $eq: ['$feature', 'review'] }, 1, 0] } } },
                          { k: 'rewrite', v: { $sum: { $cond: [{ $eq: ['$feature', 'rewrite'] }, 1, 0] } } },
                          { k: 'explain', v: { $sum: { $cond: [{ $eq: ['$feature', 'explain'] }, 1, 0] } } },
                          { k: 'snipe', v: { $sum: { $cond: [{ $eq: ['$feature', 'snipe'] }, 1, 0] } } }
                        ]
                      ]
                    }
                  },
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'uid',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            userId: '$_id',
            email: '$user.email',
            displayName: '$user.displayName',
            totalRequests: 1,
            lastActivity: 1,
            favoriteFeature: { 
              $arrayElemAt: [
                { $objectToArray: '$favoriteFeature' },
                { $indexOfArray: [{ $objectToArray: '$favoriteFeature' }, { $max: { $objectToArray: '$favoriteFeature' } }] }
              ]
            },
            _id: 0
          }
        },
        { $sort: { totalRequests: -1 } },
        { $limit: 100 }
      ]);

      return userStats.map(stat => ({
        ...stat,
        favoriteFeature: stat.favoriteFeature ? stat.favoriteFeature.k : 'unknown'
      }));
    } catch (error) {
      logError(`Error getting user stats: ${error}`, 'AdminService');
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const dbStatus = await this.checkDatabaseHealth();
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      return {
        database: dbStatus,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        uptime: this.formatUptime(uptime),
        nodeVersion: process.version,
        timestamp: new Date()
      };
    } catch (error) {
      logError(`Error getting system health: ${error}`, 'AdminService');
      throw error;
    }
  }

  private async checkDatabaseHealth() {
    try {
      // Simple database health check
      await User.findOne().limit(1);
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }
}
