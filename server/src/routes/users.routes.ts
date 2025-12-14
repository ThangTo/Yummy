import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

// Routes → Controller
router.get('/:id/passport', UserController.getUserPassport);
router.post('/:id/checkin', UserController.checkIn);

export default router;
