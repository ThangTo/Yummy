import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

export interface UserPassportResponse {
  food_passport: Array<{
    food_id: string;
    checkin_date: string;
    image_url?: string;
  }>;
  unlocked_provinces: string[];
  current_rank: string;
  progress: {
    current: number;
    next_rank: {
      name: string;
      target: number;
    };
  };
  recent_foods: Array<{
    id: string;
    name: string;
    location: string;
    province_name: string;
    image: string;
    tag?: string;
  }>;
}

export interface CheckInData {
  food_id: string;
  image_url?: string;
  province_name?: string;
}

export class UserService {
  /**
   * Lấy thông tin passport của user (food passport + unlocked provinces)
   */
  async getUserPassport(userId: string): Promise<UserPassportResponse | null> {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const foodCount = user.food_passport.length;
    
    // Tính next rank và progress
    const nextRank = this.calculateNextRank(foodCount);
    const progress = {
      current: foodCount,
      next_rank: nextRank,
    };

    // Populate food_id để lấy thông tin món ăn
    const Food = (await import('../models/Food')).Food;
    const recentFoodsPromises = user.food_passport
      .slice(-5)
      .reverse()
      .map(async (item: any) => {
        const food = await Food.findById(item.food_id).lean();
        return {
          id: item.food_id?.toString() || '',
          name: food?.name_vi || 'Unknown',
          location: food?.province_name || '',
          province_name: food?.province_name || '',
          image: item.image_url || 'https://via.placeholder.com/400',
          tag: this.isRecentCheckIn(item.checkin_date) ? 'Mới mở khóa' : undefined,
        };
      });

    const recentFoods = await Promise.all(recentFoodsPromises);

    return {
      food_passport: user.food_passport.map((item: any) => ({
        food_id: item.food_id?.toString() || '',
        checkin_date: item.checkin_date.toISOString(),
        image_url: item.image_url,
      })),
      unlocked_provinces: user.unlocked_provinces,
      current_rank: user.current_rank,
      progress,
      recent_foods: recentFoods,
    };
  }

  /**
   * Kiểm tra xem check-in có phải là gần đây không (7 ngày)
   */
  private isRecentCheckIn(checkinDate: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(checkinDate) > sevenDaysAgo;
  }

  /**
   * Tính next rank dựa trên số món đã ăn
   */
  private calculateNextRank(foodCount: number): { name: string; target: number } {
    if (foodCount < 5) {
      return { name: 'Khách vãng lai', target: 5 };
    } else if (foodCount < 50) {
      return { name: 'Vua Ẩm Thực Việt', target: 50 };
    } else {
      return { name: 'Đã đạt cấp tối đa', target: foodCount };
    }
  }

  /**
   * Check-in món ăn và tự động unlock tỉnh nếu chưa unlock
   */
  async checkIn(userId: string, checkInData: CheckInData): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Thêm vào food passport
    user.food_passport.push({
      food_id: new Types.ObjectId(checkInData.food_id),
      checkin_date: new Date(),
      image_url: checkInData.image_url,
    });

    // Unlock tỉnh nếu chưa unlock
    if (
      checkInData.province_name &&
      !user.unlocked_provinces.includes(checkInData.province_name)
    ) {
      user.unlocked_provinces.push(checkInData.province_name);
    }

    await user.save();
    return user;
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).lean();
  }

  /**
   * Tạo user mới
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  /**
   * Cập nhật rank của user
   */
  async updateUserRank(userId: string, newRank: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { current_rank: newRank }, { new: true }).lean();
  }
}

