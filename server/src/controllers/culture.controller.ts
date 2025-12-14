import { Request, Response } from 'express';
import { CultureService } from '../services/culture.service';
import { FoodService } from '../services/food.service';

export const CultureController = {
  /**
   * GET /api/culture/:foodId
   * Lấy thông tin Culture Card cho món ăn
   */
  getCultureCard: async (req: Request, res: Response): Promise<void> => {
    try {
      const { foodId } = req.params;

      // Lấy thông tin món ăn từ database
      const food = await FoodService.getFoodById(foodId);
      if (!food) {
        res.status(404).json({ error: 'Food not found' });
        return;
      }

      // Lấy culture card data từ Food object
      const cultureData = await CultureService.getCultureCard(food);

      // Trả về kết quả với đầy đủ thông tin
      res.json({
        ...cultureData,
        food_id: food._id.toString(),
        name_key: food.name_key,
      });
    } catch (err) {
      console.error('Error in getCultureCard:', err);
      res.status(500).json({ error: 'Failed to fetch culture card' });
    }
  },
};
