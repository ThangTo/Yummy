import { Router } from 'express';
import { ScanController, upload } from '../controllers/scan.controller';

const router = Router();
const scanController = new ScanController();

// POST /api/scan - Scan ảnh món ăn
router.post(
  '/',
  upload.single('file'), // Middleware để xử lý file upload
  (req, res) => scanController.scanFood(req, res)
);

export default router;

