// src/auth/auth.routes.ts
import { Router } from 'express';
import { registerController, loginController, verifyEmailController, forgotPasswordController, resetPasswordController, getProfileController, updateProfileController, changePasswordController } from './auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post("/signup", registerController);
router.post("/signin", loginController);


export default router;
