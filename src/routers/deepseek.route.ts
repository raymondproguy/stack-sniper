import { Router } from 'express';
import { debugController, reviewController, rewriteController, explainController } from '../controller/deepseek.controller';

const router = Router();

router.get('/debug', debugController);
router.get('/review', reviewController);
router.get('/rewrite', rewriteController);
router.get('/explain', explainController);

export default router;
