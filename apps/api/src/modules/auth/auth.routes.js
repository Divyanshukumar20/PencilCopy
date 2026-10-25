import express from 'express';
import { Router } from 'express';
import * as authController from './auth.contilroller.js';

const router = express.Router();

router.post('/auth/signup',authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.me);

export default router;