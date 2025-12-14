import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

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

// Tạo axios client instance
const getAIClient = (): AxiosInstance => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  return axios.create({
    baseURL: aiServiceUrl,
    timeout: 30000, // 30 seconds timeout
  });
};

export const AIService = {
  /**
   * Gửi ảnh đến AI service để nhận diện món ăn
   * @param imageBuffer Buffer của ảnh
   * @param filename Tên file (optional)
   */
  predictFood: async (
    imageBuffer: Buffer,
    filename: string = 'image.jpg',
  ): Promise<AIPredictionResponse> => {
    try {
      const client = getAIClient();
      
      console.log('📸 AI Service - Preparing to send image:', {
        bufferSize: imageBuffer.length,
        filename,
      });

      // Tạo FormData
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: 'image/jpeg',
      });

      const headers = formData.getHeaders();
      console.log('📸 AI Service - FormData headers:', headers);

      // Gửi request đến FastAPI service
      const response = await client.post<AIPredictionResponse>(
        '/predict',
        formData as any, // FormData type compatibility
        {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      console.log('✅ AI Service - Response received:', {
        status: response.status,
        bestMatch: response.data.best_match,
        confidence: response.data.confidence,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error calling AI service:', error);
      if (error.response) {
        console.error('❌ AI service response status:', error.response.status);
        console.error('❌ AI service response data:', error.response.data);
        console.error('❌ AI service response headers:', error.response.headers);
      }
      if (error.request) {
        console.error('❌ AI service request error:', error.request);
      }
      if (error.code) {
        console.error('❌ AI service error code:', error.code);
      }
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Health check AI service
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const client = getAIClient();
      const response = await client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};
