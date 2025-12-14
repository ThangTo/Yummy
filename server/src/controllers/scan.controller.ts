import { Request, Response } from 'express';
import multer from 'multer';
import { AILogService } from '../services/ai-log.service';
import { AIService } from '../services/ai.service';
import { FoodService } from '../services/food.service';

// Cấu hình multer để xử lý file upload
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    // Chỉ chấp nhận ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const ScanController = {
  /**
   * POST /api/scan
   * Scan ảnh món ăn và trả về kết quả từ AI Council
   */
  scanFood: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const { user_id } = req.body;
      const imageBuffer = req.file.buffer;
      const filename = req.file.originalname;

      console.log('📸 Scan request - File info:', {
        filename,
        size: imageBuffer.length,
        mimetype: req.file.mimetype,
      });

      // 1. Gửi ảnh đến AI service (FastAPI)
      console.log('📸 Sending to AI service...');
      const aiResult = await AIService.predictFood(imageBuffer, filename);
      console.log('✅ AI service response:', aiResult);

      // 2. Lấy thông tin món ăn từ database
      // Thử exact match trước
      let food = await FoodService.getFoodByNameKey(aiResult.best_match);

      // Nếu không tìm thấy, thử case-insensitive search
      if (!food) {
        const allFoods = await FoodService.getFoods();
        food =
          allFoods.find((f) => f.name_key.toLowerCase() === aiResult.best_match.toLowerCase()) ||
          null;
      }

      if (!food) {
        console.error('Food not found:', {
          ai_prediction: aiResult.best_match,
          confidence: aiResult.confidence,
          model_details: aiResult.model_details,
        });
        res.status(404).json({
          error: 'Food not found in database',
          ai_prediction: aiResult.best_match,
          confidence: aiResult.confidence,
          suggestion: 'Vui lòng thử lại hoặc kiểm tra database có món ăn này không',
        });
        return;
      }

      // 3. Lưu AI log nếu có user_id
      if (user_id) {
        await AILogService.createLog({
          user_id: user_id as any,
          upload_timestamp: new Date(),
          final_prediction: aiResult.best_match,
          confidence: aiResult.confidence,
          model_details: {
            resnet: aiResult.model_details.resnet?.prediction,
            vgg16: aiResult.model_details.vgg16?.prediction,
            custom_cnn: aiResult.model_details.custom_cnn?.prediction,
            efficientnet_v2: aiResult.model_details.efficientnet_v2?.prediction,
            color_histogram: aiResult.model_details.color_histogram?.prediction,
          },
        });
      }

      // 4. Trả về kết quả tổng hợp (đồng bộ với frontend)
      const response = {
        food: {
          _id: food._id.toString(),
          name_key: food.name_key,
          name_vi: food.name_vi,
          province_name: food.province_name,
          how_to_eat: food.how_to_eat,
        },
        ai_council: {
          best_match: aiResult.best_match,
          confidence: aiResult.confidence,
          model_details: aiResult.model_details,
          voting_result: aiResult.voting_result,
        },
        image_url: req.file.buffer ? undefined : undefined, // Có thể lưu và trả về URL
      };

      res.json(response);
    } catch (error: any) {
      console.error('❌ Error in scanFood:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        error: 'Failed to scan food',
        message: error.message,
      });
    }
  },
};
