import { Food, IFood } from '../models/Food';

export const FoodService = {
  /**
   * Lấy danh sách món ăn, có thể filter theo tỉnh
   */
  getFoods: async (provinceName?: string): Promise<IFood[]> => {
    const filter = provinceName ? { province_name: provinceName } : {};
    return Food.find(filter).lean();
  },

  /**
   * Tạo món ăn mới
   */
  createFood: async (foodData: Partial<IFood>): Promise<IFood> => {
    return Food.create(foodData);
  },

  /**
   * Lấy món ăn theo ID
   */
  getFoodById: async (id: string): Promise<IFood | null> => {
    return Food.findById(id).lean();
  },

  /**
   * Lấy món ăn theo name_key
   */
  getFoodByNameKey: async (nameKey: string): Promise<IFood | null> => {
    return Food.findOne({ name_key: nameKey }).lean();
  },

  /**
   * Lấy món ăn theo ID (với populate nếu cần)
   */
  getFoodByIdWithDetails: async (id: string): Promise<any> => {
    return Food.findById(id).lean();
  },
};
