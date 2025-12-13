import { Router } from 'express';
import { AILog } from '../models/AILog';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.upload_timestamp) payload.upload_timestamp = new Date();
    const log = await AILog.create(payload);
    res.status(201).json(log);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to create ai_log' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const logs = await AILog.find().sort({ upload_timestamp: -1 }).limit(50).lean();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ai_logs' });
  }
});

export default router;

