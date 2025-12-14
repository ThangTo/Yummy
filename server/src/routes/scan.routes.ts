import { Router } from 'express';
import { ScanController, upload } from '../controllers/scan.controller';

const router = Router();

// POST /api/scan - Scan ảnh món ăn
router.post(
  '/',
  upload.single('file'), // Middleware để xử lý file upload
  ScanController.scanFood,
);

export default router;
