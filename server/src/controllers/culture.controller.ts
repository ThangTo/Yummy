import { Request, Response } from 'express';
import { CultureService } from '../services/culture.service';
import { FoodService } from '../services/food.service';

const cultureService = new CultureService();
const foodService = new FoodService();

export class CultureController {
  /**
   * GET /api/culture/:foodId
   * Lấy thông tin Culture Card cho món ăn
   */
  async getCultureCard(req: Request, res: Response): Promise<void> {
    try {
      const { foodId } = req.params;
      
      // Lấy thông tin món ăn
      const food = await foodService.getFoodById(foodId);
      if (!food) {
        res.status(404).json({ error: 'Food not found' });
        return;
      }

      // Lấy culture card data
      const cultureData = await cultureService.getCultureCard(
        food.name_vi,
        food.province_name
      );

      res.json({
        ...cultureData,
        food_id: food._id.toString(),
        name_key: food.name_key,
      });
    } catch (err) {
      console.error('Error in getCultureCard:', err);
      res.status(500).json({ error: 'Failed to fetch culture card' });
    }
  }
}

