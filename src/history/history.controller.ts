// src/history/history.controller.ts
import { Request, Response } from 'express';
import { HistoryService } from './history.service';
import { logInfo, logError } from '../utils/logger';

const historyService = new HistoryService();

export const saveHistory = async (req: Request, res: Response) => {
  try {
    const { feature, query, response, source, metadata } = req.body;
    
    if (!feature || !query || !response || !source) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: feature, query, response, source'
      });
    }
    
    const history = await historyService.saveHistory({
      userId: req.user.uid,
      feature,
      query,
      response,
      source,
      metadata: metadata || {}
    });
    
    res.json({
      success: true,
      history: {
        id: history._id,
        feature: history.feature,
        query: history.query,
        timestamp: history.timestamp,
        metadata: history.metadata
      }
    });
  } catch (error) {
    logError(`Save history failed: ${error}`, 'HistoryController');
    res.status(500).json({ success: false, error: 'Failed to save history' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    
    const result = await historyService.getUserHistory(req.user.uid, limit, page);
    
    res.json({
      success: true,
      history: result.history.map(item => ({
        id: item._id,
        feature: item.feature,
        query: item.query,
        response: item.response,
        source: item.source,
        timestamp: item.timestamp,
        metadata: item.metadata
      })),
      pagination: result.pagination
    });
  } catch (error) {
    logError(`Get history failed: ${error}`, 'HistoryController');
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;
    
    const history = await historyService.toggleFavorite(historyId, req.user.uid);
    
    res.json({
      success: true,
      history: {
        id: history._id,
        isFavorite: history.metadata.isFavorite
      }
    });
  } catch (error) {
    logError(`Toggle favorite failed: ${error}`, 'HistoryController');
    res.status(500).json({ success: false, error: 'Failed to toggle favorite' });
  }
};

export const deleteHistory = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;
    
    await historyService.deleteHistory(historyId, req.user.uid);
    
    res.json({
      success: true,
      message: 'History deleted successfully'
    });
  } catch (error) {
    logError(`Delete history failed: ${error}`, 'HistoryController');
    res.status(500).json({ success: false, error: 'Failed to delete history' });
  }
};

export const searchHistory = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      });
    }
    
    const history = await historyService.searchHistory(req.user.uid, q as string);
    
    res.json({
      success: true,
      history: history.map(item => ({
        id: item._id,
        feature: item.feature,
        query: item.query,
        response: item.response.substring(0, 200) + '...', // Preview
        source: item.source,
        timestamp: item.timestamp,
        metadata: item.metadata
      }))
    });
  } catch (error) {
    logError(`Search history failed: ${error}`, 'HistoryController');
    res.status(500).json({ success: false, error: 'Failed to search history' });
  }
};
