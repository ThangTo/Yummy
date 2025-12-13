import { Router } from 'express';
import { AILogController } from '../controllers/ai-log.controller';

const router = Router();
const aiLogController = new AILogController();

// Routes → Controller
router.post('/', (req, res) => aiLogController.createLog(req, res));
router.get('/', (req, res) => aiLogController.getLogs(req, res));
router.get('/:id', (req, res) => aiLogController.getLogById(req, res));

export default router;

