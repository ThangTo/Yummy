import { Router } from 'express';
import { FoodController } from '../controllers/food.controller';

const router = Router();
const foodController = new FoodController();

// Routes → Controller
router.get('/', (req, res) => foodController.getFoods(req, res));
router.post('/', (req, res) => foodController.createFood(req, res));
router.get('/:id', (req, res) => foodController.getFoodById(req, res));

export default router;

