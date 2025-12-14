/**
 * Culture Service - Xử lý logic liên quan đến Culture Card
 * Lấy dữ liệu từ database (story và how_to_eat đã có sẵn trong DB)
 */

import { IFood } from '../models/Food';

export interface CultureCardData {
  name_vi: string;
  province_name: string;
  story: string; // Câu chuyện văn hóa từ database
  how_to_eat?: string;
  image?: string; // Ảnh chuẩn của món ăn
}

export const CultureService = {
  /**
   * Lấy dữ liệu cho Culture Card từ Food object
   * Lấy trực tiếp từ database (story và how_to_eat đã có sẵn)
   */
  getCultureCard: async (food: IFood): Promise<CultureCardData> => {
    // Kiểm tra xem có story trong database không
    if (!food.story || food.story.trim().length === 0) {
      throw new Error(
        `Story not found for food: ${food.name_vi}. Please ensure story is seeded in database.`,
      );
    }

    return {
      name_vi: food.name_vi,
      province_name: food.province_name,
      story: food.story,
      how_to_eat: food.how_to_eat || undefined,
      image: food.image || undefined,
    };
  },
};
