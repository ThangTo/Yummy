import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { UserService } from '../services/user.service';

// Cấu hình upload avatar với multer.diskStorage (lưu file xuống server)
const AVATAR_UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars');

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
    } catch {
      // ignore if exists
    }
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const userId = req.params.id || 'avatar';
    cb(null, `${userId}${ext}`);
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const UserController = {
  /**
   * GET /api/users/:id/passport
   * Lấy thông tin passport của user (đồng bộ với frontend)
   */
  getUserPassport: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const passport = await UserService.getUserPassport(id);
      if (!passport) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Trả về format đúng với frontend cần
      res.json({
        food_passport: passport.food_passport,
        unlocked_provinces: passport.unlocked_provinces,
        current_rank: passport.current_rank,
        progress: passport.progress,
        recent_foods: passport.recent_foods,
      });
    } catch (err) {
      console.error('Error in getUserPassport:', err);
      res.status(500).json({ error: 'Failed to fetch passport' });
    }
  },

  /**
   * POST /api/users/:id/checkin
   * Check-in món ăn và tự động unlock tỉnh
   */
  checkIn: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { food_id, image_url, province_name } = req.body;

      if (!food_id) {
        res.status(400).json({ error: 'food_id required' });
        return;
      }

      await UserService.checkIn(id, {
        food_id,
        image_url,
        province_name,
      });

      res.json({ ok: true });
    } catch (err: any) {
      console.error('Error in checkIn:', err);
      if (err.message === 'User not found') {
        res.status(404).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err.message || 'Failed to check-in' });
    }
  },

  /**
   * PUT /api/users/:id/avatar
   * Upload avatar (multipart/form-data, field "file"), lưu file và cập nhật URL avatar cho user
   */
  updateAvatar: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'Avatar file is required' });
        return;
      }

      const filename = req.file.filename;
      const baseUrl =
        (process.env.PUBLIC_BASE_URL as string) || `${req.protocol}://${req.get('host')}`;
      const avatarUrl = `${baseUrl}/uploads/avatars/${filename}`;

      const updated = await UserService.updateAvatar(id, avatarUrl);
      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        user: {
          id: updated._id,
          username: updated.username,
          email: updated.email,
          current_rank: updated.current_rank,
          avatar: updated.avatar,
        },
      });
    } catch (err) {
      console.error('Error in updateAvatar:', err);
      res.status(500).json({ error: 'Failed to update avatar' });
    }
  },

  /**
   * GET /api/users/recent-activities
   * Lấy danh sách check-in mới nhất của tất cả user
   */
  getRecentActivities: async (_req: Request, res: Response): Promise<void> => {
    try {
      const activities = await UserService.getRecentActivities(20);
      res.json({ activities });
    } catch (err) {
      console.error('Error in getRecentActivities:', err);
      res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
  },
};
