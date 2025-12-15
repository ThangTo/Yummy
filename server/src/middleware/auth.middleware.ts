/**
 * Authentication Middleware
 * Xác thực JWT token từ Authorization header
 * 
 * BẢO MẬT:
 * - Token được gửi qua header: Authorization: Bearer <token>
 * - Verify token signature và expiration
 * - Attach user info vào request để các route khác sử dụng
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request type để thêm user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware để xác thực JWT token
 * 
 * Cách sử dụng:
 * - Thêm vào route cần bảo vệ: router.get('/protected', authMiddleware, handler)
 * - Token được lấy từ header: Authorization: Bearer <token>
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Lấy token từ Authorization header
    // Format: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Không có token xác thực. Vui lòng đăng nhập lại.',
      });
      return;
    }

    // 2. Extract token (bỏ phần "Bearer ")
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.',
      });
      return;
    }

    // 3. Verify token signature và expiration
    // jwt.verify sẽ throw error nếu token invalid hoặc expired
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 4. Kiểm tra user còn tồn tại trong database
    const user = await User.findById(decoded.userId).select('username email');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại.',
      });
      return;
    }

    // 5. Attach user info vào request để các route khác sử dụng
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    // 6. Cho phép request tiếp tục
    next();
  } catch (error) {
    // Xử lý các lỗi từ jwt.verify
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
      });
      return;
    }

    // Lỗi khác
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực.',
    });
  }
};






