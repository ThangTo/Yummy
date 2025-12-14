import { Router } from 'express';
import { FoodController } from '../controllers/food.controller';

const router = Router();

// Routes → Controller
router.get('/', FoodController.getFoods);
router.post('/', FoodController.createFood);
router.get('/:id', FoodController.getFoodById);

export default router;
