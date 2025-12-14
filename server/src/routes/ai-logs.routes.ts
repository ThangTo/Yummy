import { Router } from 'express';
import { AILogController } from '../controllers/ai-log.controller';

const router = Router();

// Routes → Controller
router.post('/', AILogController.createLog);
router.get('/', AILogController.getLogs);
router.get('/:id', AILogController.getLogById);

export default router;
