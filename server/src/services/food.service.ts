import { Food, IFood } from '../models/Food';

export class FoodService {
  /**
   * Lấy danh sách món ăn, có thể filter theo tỉnh
   */
  async getFoods(provinceName?: string): Promise<IFood[]> {
    const filter = provinceName ? { province_name: provinceName } : {};
    return Food.find(filter).lean();
  }

  /**
   * Tạo món ăn mới
   */
  async createFood(foodData: Partial<IFood>): Promise<IFood> {
    return Food.create(foodData);
  }

  /**
   * Lấy món ăn theo ID
   */
  async getFoodById(id: string): Promise<IFood | null> {
    return Food.findById(id).lean();
  }

  /**
   * Lấy món ăn theo name_key
   */
  async getFoodByNameKey(nameKey: string): Promise<IFood | null> {
    return Food.findOne({ name_key: nameKey }).lean();
  }

  /**
   * Lấy món ăn theo ID (với populate nếu cần)
   */
  async getFoodByIdWithDetails(id: string): Promise<any> {
    return Food.findById(id).lean();
  }
}

