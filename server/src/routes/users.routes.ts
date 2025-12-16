import { Router } from 'express';
import { UserController, avatarUpload } from '../controllers/user.controller';

const router = Router();

// Routes → Controller
router.get('/recent-activities', UserController.getRecentActivities);
router.get('/leaderboard', UserController.getLeaderboard);
router.get('/:id/passport', UserController.getUserPassport);
router.post('/:id/checkin', UserController.checkIn);
router.put('/:id/avatar', avatarUpload.single('file'), UserController.updateAvatar);

export default router;
