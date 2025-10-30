// src/history/history.routes.ts
import { Router } from 'express';
import {
  saveHistory,
  getHistory,
  toggleFavorite,
  deleteHistory,
  searchHistory
} from './history.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // All routes require authentication

router.post('/', saveHistory);
router.get('/', getHistory);
router.get('/search', searchHistory);
router.patch('/:historyId/favorite', toggleFavorite);
router.delete('/:historyId', deleteHistory);

export default router;
