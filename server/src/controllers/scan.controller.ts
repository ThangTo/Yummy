import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { FoodService } from '../services/food.service';
import { UserService } from '../services/user.service';
import { AILogService } from '../services/ai-log.service';
import multer from 'multer';

const aiService = new AIService();
const foodService = new FoodService();
const userService = new UserService();
const aiLogService = new AILogService();

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

export class ScanController {
  /**
   * POST /api/scan
   * Scan ảnh món ăn và trả về kết quả từ AI Council
   */
  async scanFood(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const { user_id } = req.body;
      const imageBuffer = req.file.buffer;
      const filename = req.file.originalname;

      // 1. Gửi ảnh đến AI service (FastAPI)
      const aiResult = await aiService.predictFood(imageBuffer, filename);

      // 2. Lấy thông tin món ăn từ database
      const food = await foodService.getFoodByNameKey(aiResult.best_match);
      
      if (!food) {
        res.status(404).json({ 
          error: 'Food not found in database',
          ai_prediction: aiResult.best_match 
        });
        return;
      }

      // 3. Lưu AI log nếu có user_id
      if (user_id) {
        await aiLogService.createLog({
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
      res.json({
        food: {
          _id: food._id.toString(),
          name_key: food.name_key,
          name_vi: food.name_vi,
          province_name: food.province_name,
          how_to_eat: food.how_to_eat,
          genai_prompt_seed: food.genai_prompt_seed,
        },
        ai_council: {
          best_match: aiResult.best_match,
          confidence: aiResult.confidence,
          model_details: aiResult.model_details,
          voting_result: aiResult.voting_result,
        },
        image_url: req.file.buffer ? undefined : undefined, // Có thể lưu và trả về URL
      });
    } catch (error: any) {
      console.error('Error in scanFood:', error);
      res.status(500).json({ 
        error: 'Failed to scan food',
        message: error.message 
      });
    }
  }
}

