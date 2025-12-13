import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';

const foodService = new FoodService();

export class FoodController {
  /**
   * GET /api/foods
   * Lấy danh sách món ăn, có thể filter theo province_name
   */
  async getFoods(req: Request, res: Response): Promise<void> {
    try {
      const { province_name } = req.query;
      const foods = await foodService.getFoods(
        province_name as string | undefined,
      );
      res.json(foods);
    } catch (err) {
      console.error('Error in getFoods:', err);
      res.status(500).json({ error: 'Failed to fetch foods' });
    }
  }

  /**
   * POST /api/foods
   * Tạo món ăn mới
   */
  async createFood(req: Request, res: Response): Promise<void> {
    try {
      const food = await foodService.createFood(req.body);
      res.status(201).json(food);
    } catch (err: any) {
      console.error('Error in createFood:', err);
      res.status(400).json({ error: err.message || 'Failed to create food' });
    }
  }

  /**
   * GET /api/foods/:id
   * Lấy món ăn theo ID
   */
  async getFoodById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const food = await foodService.getFoodById(id);
      if (!food) {
        res.status(404).json({ error: 'Food not found' });
        return;
      }
      res.json(food);
    } catch (err) {
      console.error('Error in getFoodById:', err);
      res.status(500).json({ error: 'Failed to fetch food' });
    }
  }
}

