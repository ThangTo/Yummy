import { Request, Response } from 'express';
import { AILogService } from '../services/ai-log.service';

export const AILogController = {
  /**
   * POST /api/ai-logs
   * Tạo log mới cho AI processing
   */
  createLog: async (req: Request, res: Response): Promise<void> => {
    try {
      const log = await AILogService.createLog(req.body);
      res.status(201).json(log);
    } catch (err: any) {
      console.error('Error in createLog:', err);
      res.status(400).json({ error: err.message || 'Failed to create ai_log' });
    }
  },

  /**
   * GET /api/ai-logs
   * Lấy danh sách logs (mới nhất trước)
   */
  getLogs: async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await AILogService.getLogs(limit);
      res.json(logs);
    } catch (err) {
      console.error('Error in getLogs:', err);
      res.status(500).json({ error: 'Failed to fetch ai_logs' });
    }
  },

  /**
   * GET /api/ai-logs/:id
   * Lấy log theo ID
   */
  getLogById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const log = await AILogService.getLogById(id);
      if (!log) {
        res.status(404).json({ error: 'Log not found' });
        return;
      }
      res.json(log);
    } catch (err) {
      console.error('Error in getLogById:', err);
      res.status(500).json({ error: 'Failed to fetch log' });
    }
  },
};

