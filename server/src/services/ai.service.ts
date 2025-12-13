import FormData from 'form-data';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';

export interface AIPredictionResponse {
  best_match: string;
  confidence: number;
  model_details: {
    [modelName: string]: {
      prediction: string;
      confidence: number;
    };
  };
  voting_result: {
    prediction: string;
    confidence: number;
    votes: { [prediction: string]: number };
    total_models: number;
  };
}

export class AIService {
  private client: AxiosInstance;
  private aiServiceUrl: string;

  constructor() {
    // URL của FastAPI service
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.aiServiceUrl,
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Gửi ảnh đến AI service để nhận diện món ăn
   * @param imageBuffer Buffer của ảnh
   * @param filename Tên file (optional)
   */
  async predictFood(
    imageBuffer: Buffer,
    filename: string = 'image.jpg'
  ): Promise<AIPredictionResponse> {
    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: 'image/jpeg',
      });

      // Gửi request đến FastAPI service
      const response = await this.client.post<AIPredictionResponse>(
        '/predict',
        formData as any, // FormData type compatibility
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error calling AI service:', error);
      if (error.response) {
        console.error('AI service response error:', error.response.data);
      }
      throw new Error(
        `AI service error: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Health check AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

