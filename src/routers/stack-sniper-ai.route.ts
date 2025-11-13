// routes/stack-sniper-ai.routes.ts
import { Router } from 'express';
import { aiChatController, quickHelpController } from '../controller/stack-sniper-ai.controller';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// AI Chat endpoint (requires auth for history saving)
router.post('/chat', authenticate, aiChatController);

// Quick help endpoint (no auth required)
router.get('/quick-help', quickHelpController);

export default router;
