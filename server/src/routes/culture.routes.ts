import { Router } from 'express';
import { CultureController } from '../controllers/culture.controller';

const router = Router();

// Routes → Controller
router.get('/:foodId', CultureController.getCultureCard);

export default router;
