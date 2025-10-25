// src/admin/admin.controller.ts
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { logInfo, logError } from '../utils/logger';

const adminService = new AdminService();

export const getDashboard = async (req: Request, res: Response) => {
  try {
    logInfo('Admin dashboard accessed', 'AdminController');
    
    const analytics = await adminService.getDashboardAnalytics();
    
    res.json({
      success: true,
      ...analytics
    });
  } catch (error) {
    logError(`Get dashboard failed: ${error}`, 'AdminController');
    res.status(500).json({ success: false, error: 'Failed to get dashboard data' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userStats = await adminService.getUserStats();
    
    res.json({
      success: true,
      users: userStats,
      total: userStats.length
    });
  } catch (error) {
    logError(`Get user stats failed: ${error}`, 'AdminController');
    res.status(500).json({ success: false, error: 'Failed to get user stats' });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const health = await adminService.getSystemHealth();
    
    res.json({
      success: true,
      ...health
    });
  } catch (error) {
    logError(`Get system health failed: ${error}`, 'AdminController');
    res.status(500).json({ success: false, error: 'Failed to get system health' });
  }
};

export const getFeatureUsage = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    
    const featureUsage = await adminService.getFeatureUsageByTime(parseInt(days as string));
    
    res.json({
      success: true,
      featureUsage,
      period: `${days} days`
    });
  } catch (error) {
    logError(`Get feature usage failed: ${error}`, 'AdminController');
    res.status(500).json({ success: false, error: 'Failed to get feature usage' });
  }
};
