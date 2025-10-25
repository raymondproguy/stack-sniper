// src/admin/admin.routes.ts
import { Router } from 'express';
import {
  getDashboard,
  getUserStats,
  getSystemHealth,
  getFeatureUsage
} from './admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin); // All admin routes require admin privileges

router.get('/dashboard', getDashboard);
router.get('/users', getUserStats);
router.get('/system-health', getSystemHealth);
router.get('/feature-usage', getFeatureUsage);

export default router;
