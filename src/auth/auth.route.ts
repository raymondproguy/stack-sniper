// src/auth/auth.routes.ts
import { Router } from 'express';
import { authCallback, getProfile } from './auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/callback', authCallback);
router.get('/profile', authenticate, getProfile);

export default router;
