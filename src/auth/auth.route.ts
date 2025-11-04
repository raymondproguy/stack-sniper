// src/auth/auth.routes.ts
import { Router } from 'express';
import { authCallback, login, getProfile } from './auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/callback', authCallback);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
