import { Types } from 'mongoose';
import { IUser, User } from '../models/User';

export interface UserPassportResponse {
  food_passport: Array<{
    food_id: string;
    checkin_date: string;
    image_url?: string;
  }>;
  unlocked_provinces: string[];
  current_rank: string;
  avatar?: string;
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

export interface RecentActivity {
  user_id: string;
  username: string;
  avatar?: string;
  food_id: string;
  food_name: string;
  province_name: string;
  checkin_date: string;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  current_rank: string;
  food_count: number;
}

export interface CheckInData {
  food_id: string;
  image_url?: string;
  province_name?: string;
}

// Helper functions
const isRecentCheckIn = (checkinDate: Date): boolean => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(checkinDate) > sevenDaysAgo;
};

const calculateNextRank = (foodCount: number): { name: string; target: number } => {
  if (foodCount < 1) return { name: 'Khách vãng lai', target: 1 };
  if (foodCount < 5) return { name: 'Nhà săn vị', target: 5 };
  if (foodCount < 10) return { name: 'Kẻ phiêu lưu', target: 10 };
  if (foodCount < 20) return { name: 'Xuyên Việt', target: 20 };
  if (foodCount < 30) return { name: 'Đại sứ ẩm thực', target: 30 };
  return { name: 'Thần Ăn', target: foodCount };
};

const resolveRankFromCount = (foodCount: number): string => {
  if (foodCount >= 30) return 'Đại sứ ẩm thực';
  if (foodCount >= 20) return 'Xuyên Việt';
  if (foodCount >= 10) return 'Kẻ phiêu lưu';
  if (foodCount >= 5) return 'Nhà săn vị';
  if (foodCount >= 1) return 'Khách vãng lai';
  return 'Ẩm thực sơ khai';
};

export const UserService = {
  /**
   * Lấy thông tin passport của user (food passport + unlocked provinces)
   */
  getUserPassport: async (userId: string): Promise<UserPassportResponse | null> => {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const foodCount = user.food_passport.length;

    // Tính next rank và progress
    const nextRank = calculateNextRank(foodCount);
    const currentRank = resolveRankFromCount(foodCount);
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
          tag: isRecentCheckIn(item.checkin_date) ? 'Mới mở khóa' : undefined,
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
      current_rank: currentRank,
      avatar: user.avatar,
      progress,
      recent_foods: recentFoods,
    };
  },

  /**
   * Check-in món ăn và tự động unlock tỉnh nếu chưa unlock
   */
  checkIn: async (userId: string, checkInData: CheckInData): Promise<IUser> => {
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
    if (checkInData.province_name && !user.unlocked_provinces.includes(checkInData.province_name)) {
      user.unlocked_provinces.push(checkInData.province_name);
    }

    // Cập nhật rank dựa trên tổng số món đã check-in
    const foodCount = user.food_passport.length;
    user.current_rank = resolveRankFromCount(foodCount);

    await user.save();
    return user;
  },

  /**
   * Lấy user theo ID
   */
  getUserById: async (userId: string): Promise<IUser | null> => {
    return User.findById(userId).lean();
  },

  /**
   * Tạo user mới
   */
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    return User.create(userData);
  },

  /**
   * Cập nhật rank của user
   */
  updateUserRank: async (userId: string, newRank: string): Promise<IUser | null> => {
    return User.findByIdAndUpdate(userId, { current_rank: newRank }, { new: true }).lean();
  },

  /**
   * Cập nhật avatar (URL)
   */
  updateAvatar: async (userId: string, avatarUrl: string): Promise<IUser | null> => {
    return User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true }).lean();
  },

  /**
   * Lấy danh sách hoạt động check-in mới nhất của tất cả user
   */
  getRecentActivities: async (limit = 20): Promise<RecentActivity[]> => {
    const activities = await User.aggregate([
      { $unwind: '$food_passport' },
      { $sort: { 'food_passport.checkin_date': -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'foods',
          localField: 'food_passport.food_id',
          foreignField: '_id',
          as: 'food',
        },
      },
      { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          user_id: '$_id',
          username: '$username',
          avatar: '$avatar',
          food_id: '$food._id',
          food_name: '$food.name_vi',
          province_name: '$food.province_name',
          checkin_date: '$food_passport.checkin_date',
        },
      },
    ]).exec();

    return activities.map((a: any) => ({
      user_id: a.user_id?.toString() || '',
      username: a.username || 'Người dùng ẩn danh',
      avatar: a.avatar,
      food_id: a.food_id?.toString() || '',
      food_name: a.food_name || 'Món ăn bí ẩn',
      province_name: a.province_name || '',
      checkin_date: new Date(a.checkin_date).toISOString(),
    }));
  },

  /**
   * Lấy bảng xếp hạng top user theo số món ăn đã check-in
   */
  getLeaderboard: async (limit = 10): Promise<LeaderboardUser[]> => {
    const users = await User.aggregate([
      {
        $project: {
          username: 1,
          avatar: 1,
          current_rank: 1,
          food_count: { $size: '$food_passport' },
        },
      },
      { $sort: { food_count: -1 } },
      { $limit: limit },
    ]).exec();

    return users.map((u: any) => ({
      id: u._id?.toString() || '',
      username: u.username || 'Người dùng ẩn danh',
      avatar: u.avatar,
      current_rank: u.current_rank || 'Khách vãng lai',
      food_count: u.food_count || 0,
    }));
  },
};
