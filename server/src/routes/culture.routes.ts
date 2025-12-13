import { Router } from 'express';
import { CultureController } from '../controllers/culture.controller';

const router = Router();
const cultureController = new CultureController();

// Routes → Controller
router.get('/:foodId', (req, res) => cultureController.getCultureCard(req, res));

export default router;

