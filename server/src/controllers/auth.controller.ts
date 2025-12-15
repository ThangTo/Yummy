/**
 * Authentication Controller
 * Xử lý đăng ký và đăng nhập
 *
 * BẢO MẬT:
 * - Validate input với express-validator
 * - Hash password với bcryptjs (salt rounds: 10)
 * - Tạo JWT token với expiration 7 ngày
 * - Trả về token trong JSON body (KHÔNG dùng cookie)
 */

import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

// Lưu ý:
// - Trong production, NHẤT ĐỊNH phải cấu hình process.env.JWT_SECRET
// - Ở đây cast sang jwt.Secret để tránh lỗi type khi dùng jwt.sign
const JWT_SECRET: Secret =
  (process.env.JWT_SECRET as string) || 'your-secret-key-change-in-production';
// Kiểu expiresIn trong jsonwebtoken khá phức tạp, nên cast về SignOptions để TS không bắt lỗi
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as any) || '7d'; // 7 ngày

const signJwt = (payload: object): string => {
  // Wrapper nhỏ để tránh lặp lại logic và gom type-casting vào một chỗ
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
};

/**
 * Register - Đăng ký tài khoản mới
 *
 * POST /api/auth/register
 * Body: { username, email, password }
 *
 * BẢO MẬT:
 * 1. Validate input (email format, password min 6 chars)
 * 2. Kiểm tra email/username đã tồn tại
 * 3. Hash password với bcryptjs (salt rounds: 10)
 * 4. Lưu user vào database
 * 5. Tạo JWT token
 * 6. Trả về token trong JSON response
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Kiểm tra validation errors từ express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array(),
      });
      return;
    }

    const { username, email, password } = req.body;

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng.',
      });
      return;
    }

    // 3. Kiểm tra username đã tồn tại chưa
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      res.status(400).json({
        success: false,
        message: 'Tên đăng nhập này đã được sử dụng.',
      });
      return;
    }

    // 4. Hash password với bcryptjs
    // Salt rounds: 10 (cân bằng giữa bảo mật và performance)
    // BẢO MẬT: Không bao giờ lưu plain text password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Tạo user mới
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword, // Lưu hashed password, không lưu plain text
      current_rank: 'Khách vãng lai',
      food_passport: [],
      unlocked_provinces: [],
    });

    await user.save();

    // 6. Tạo JWT token
    // Payload chỉ chứa userId để giảm kích thước token
    const token = signJwt({ userId: user._id.toString() });

    // 7. Trả về success response với token
    // QUAN TRỌNG: Token trong JSON body, KHÔNG set cookie
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        current_rank: user.current_rank,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
    });
  }
};

/**
 * Login - Đăng nhập
 *
 * POST /api/auth/login
 * Body: { email hoặc username, password }
 *
 * BẢO MẬT:
 * 1. Validate input
 * 2. Tìm user theo email hoặc username
 * 3. So sánh password với bcrypt.compare
 * 4. Tạo JWT token
 * 5. Trả về token trong JSON response
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array(),
      });
      return;
    }

    const { emailOrUsername, password } = req.body;

    // 2. Tìm user theo email hoặc username
    // Cho phép đăng nhập bằng email hoặc username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!user) {
      // BẢO MẬT: Không tiết lộ user có tồn tại hay không
      // Trả về cùng một message để tránh user enumeration attack
      res.status(401).json({
        success: false,
        message: 'Email/tên đăng nhập hoặc mật khẩu không đúng.',
      });
      return;
    }

    // 3. So sánh password với bcrypt.compare
    // BẢO MẬT: Sử dụng constant-time comparison để tránh timing attack
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // BẢO MẬT: Không tiết lộ password sai hay user không tồn tại
      res.status(401).json({
        success: false,
        message: 'Email/tên đăng nhập hoặc mật khẩu không đúng.',
      });
      return;
    }

    // 4. Tạo JWT token
    const token = signJwt({ userId: user._id.toString() });

    // 5. Trả về success response với token
    // QUAN TRỌNG: Token trong JSON body, KHÔNG set cookie
    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        current_rank: user.current_rank,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
    });
  }
};

/**
 * Get Current User - Lấy thông tin user hiện tại
 *
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 *
 * Cần authMiddleware để verify token
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user được set bởi authMiddleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng.',
      });
      return;
    }

    // Lấy thông tin user từ database
    const user = await User.findById(userId).select('-password'); // Bỏ password khỏi response

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.',
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        current_rank: user.current_rank,
        unlocked_provinces: user.unlocked_provinces,
        food_passport_count: user.food_passport.length,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
    });
  }
};
