import { Router } from 'express';
import { snipeController } from '../controllers/snipe.js';

const router = Router();
router.get('/snipe', snipeController);

export default router;
