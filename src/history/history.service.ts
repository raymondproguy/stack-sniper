// src/history/history.service.ts
import { History, IHistory } from '../models/History.model';
import { logInfo, logError } from '../utils/logger';

export class HistoryService {
  async saveHistory(historyData: Omit<IHistory, 'timestamp'>) {
    try {
      const history = new History(historyData);
      await history.save();

      logInfo(`History saved for user: ${historyData.userId}`, 'HistoryService');
      return history;
    } catch (error) {
      logError(`Error saving history: ${error}`, 'HistoryService');
      throw error;
    }
  }

  async saveHistoryWithPerformance(historyData: Omit<IHistory, 'timestamp'>, responseTime: number) {
    try {
      const history = new History({
        ...historyData,
        metadata: {
          ...historyData.metadata,
          responseTime
        }
      });

      await history.save();
      logInfo(`History saved with performance data for user: ${historyData.userId}`, 'HistoryService');
      return history;
    } catch (error) {
      logError(`Error saving history with performance: ${error}`, 'HistoryService');
      throw error;
    }
  }

  async getUserHistory(userId: string, limit: number = 50, page: number = 1) {
    try {
      const skip = (page - 1) * limit;

      const history = await History.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await History.countDocuments({ userId });

      return {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logError(`Error getting user history: ${error}`, 'HistoryService');
      throw error;
    }
  }

  async toggleFavorite(historyId: string, userId: string) {
    try {
      const history = await History.findOne({ _id: historyId, userId });

      if (!history) {
        throw new Error('History not found');
      }

      history.metadata.isFavorite = !history.metadata.isFavorite;
      await history.save();

      return history;
    } catch (error) {
      logError(`Error toggling favorite: ${error}`, 'HistoryService');
      throw error;
    }
  }

  async deleteHistory(historyId: string, userId: string) {
    try {
      const result = await History.deleteOne({ _id: historyId, userId });

      if (result.deletedCount === 0) {
        throw new Error('History not found');
      }

      logInfo(`History deleted: ${historyId}`, 'HistoryService');
      return true;
    } catch (error) {
      logError(`Error deleting history: ${error}`, 'HistoryService');
      throw error;
    }
  }

  async searchHistory(userId: string, query: string, limit: number = 20) {
    try {
      const history = await History.find({
        userId,
        $or: [
          { query: { $regex: query, $options: 'i' } },
          { response: { $regex: query, $options: 'i' } },
          { 'metadata.errorType': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(limit);

      return history;
    } catch (error) {
      logError(`Error searching history: ${error}`, 'HistoryService');
      throw error;
    }
  }
}
