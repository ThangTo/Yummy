import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Routes → Controller
router.get('/:id/passport', (req, res) => userController.getUserPassport(req, res));
router.post('/:id/checkin', (req, res) => userController.checkIn(req, res));

export default router;

