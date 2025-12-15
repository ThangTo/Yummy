/**
 * Authentication Routes
 *
 * Routes:
 * - POST /api/auth/register - Đăng ký
 * - POST /api/auth/login - Đăng nhập
 * - GET /api/auth/me - Lấy thông tin user hiện tại (cần auth)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { getCurrentUser, login, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Validation rules cho register
 * - username: 3-30 ký tự (không giới hạn loại ký tự, cho phép đặt tự do)
 * - email: phải là email hợp lệ
 * - password: tối thiểu 6 ký tự
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên đăng nhập phải có từ 3-30 ký tự'),
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
];

/**
 * Validation rules cho login
 * - emailOrUsername: bắt buộc
 * - password: bắt buộc
 */
const loginValidation = [
  body('emailOrUsername').trim().notEmpty().withMessage('Email hoặc tên đăng nhập là bắt buộc'),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

// Public routes (không cần auth)
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected route (cần auth)
router.get('/me', authMiddleware, getCurrentUser);

export default router;
