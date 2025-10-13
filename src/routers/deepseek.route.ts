import { Router } from 'express';
import { debugController, reviewController, rewriteController } from '../controllers/aiController.js';

const router = Router();

router.get('/debug', debugController);
router.get('/review', reviewController);
router.get('/rewrite', rewriteController);

export default router;
