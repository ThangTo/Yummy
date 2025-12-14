import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

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
};

