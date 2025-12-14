/**
 * API Service - Giao tiếp với Node.js Backend
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface AICouncilMember {
  name: string;
  quote: string;
  score: string; // Percentage như "95%"
  result: string;
  state: 'ok' | 'warn' | 'error';
}

export interface AICouncilResponse {
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

export interface FoodInfo {
  _id: string;
  name_key: string;
  name_vi: string;
  province_name: string;
  how_to_eat?: string;
  genai_prompt_seed?: string;
}

export interface ScanResponse {
  food: FoodInfo;
  ai_council: AICouncilResponse;
  image_url?: string;
}

export interface UserPassport {
  food_passport: {
    food_id: string;
    checkin_date: string;
    image_url?: string;
  }[];
  unlocked_provinces: string[];
  current_rank: string;
}

export interface RecentFood {
  id: string;
  name: string;
  location: string;
  province_name: string;
  image: string;
  tag?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Scan ảnh món ăn
   * @param imageUri - URI của ảnh (từ camera hoặc file system)
   * @param userId - ID của user (optional)
   */
  async scanFood(imageUri: string, userId?: string): Promise<ScanResponse> {
    try {
      console.log('📸 scanFood - Image URI:', imageUri);

      // Tạo FormData cho React Native
      const formData = new FormData();

      // Trong React Native, FormData cần format đặc biệt
      // Lấy filename từ URI hoặc dùng tên mặc định
      const filename = imageUri.split('/').pop() || 'food.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📸 scanFood - Filename:', filename, 'Type:', type);

      // Format đúng cho React Native FormData
      // Trên iOS, URI từ image picker có thể là ph:// hoặc assets-library://
      // Cần đảm bảo URI có thể đọc được
      let finalUri = imageUri;

      // Nếu là iOS ph:// URI, cần convert (nhưng expo-image-picker thường trả về file://)
      if (imageUri.startsWith('ph://') || imageUri.startsWith('assets-library://')) {
        console.warn('⚠️ Unsupported URI format, may need conversion:', imageUri);
        // expo-image-picker với allowsEditing: false thường trả về file:// URI
        // Nếu vẫn là ph://, có thể cần dùng expo-file-system để copy
      }

      formData.append('file', {
        uri: finalUri,
        type: type,
        name: filename,
      } as any);

      if (userId) {
        formData.append('user_id', userId);
      }

      console.log('📸 scanFood - Sending request to:', `${this.baseUrl}/scan`);

      // Không set Content-Type header, để React Native tự động set multipart/form-data với boundary
      const res = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        body: formData as any,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Scan failed: ${res.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          // Hiển thị thông tin chi tiết hơn nếu có
          if (errorJson.error === 'Food not found in database') {
            errorMessage = `Không tìm thấy món ăn "${
              errorJson.ai_prediction
            }" trong database.\n\nĐộ tin cậy: ${Math.round(
              (errorJson.confidence || 0) * 100,
            )}%\n\n${errorJson.suggestion || 'Vui lòng thử lại với ảnh khác.'}`;
          } else {
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return res.json();
    } catch (error: any) {
      console.error('Error scanning food:', error);
      throw error;
    }
  }

  /**
   * Lấy passport của user
   */
  async getUserPassport(userId: string): Promise<UserPassport> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${userId}/passport`);
      if (!res.ok) {
        throw new Error(`Failed to get passport: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error getting passport:', error);
      throw error;
    }
  }

  /**
   * Check-in món ăn
   */
  async checkIn(
    userId: string,
    foodId: string,
    imageUrl?: string,
    provinceName?: string,
  ): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${userId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          food_id: foodId,
          image_url: imageUrl,
          province_name: provinceName,
        }),
      });

      if (!res.ok) {
        throw new Error(`Check-in failed: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách món ăn theo tỉnh
   */
  async getFoodsByProvince(provinceName?: string): Promise<FoodInfo[]> {
    try {
      const url = provinceName
        ? `${this.baseUrl}/foods?province_name=${encodeURIComponent(provinceName)}`
        : `${this.baseUrl}/foods`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to get foods: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error getting foods:', error);
      throw error;
    }
  }

  /**
   * Lấy Culture Card cho món ăn
   */
  async getCultureCard(foodId: string): Promise<{
    name_vi: string;
    province_name: string;
    story: string;
    how_to_eat?: string;
    food_id: string;
    name_key: string;
    image?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/culture/${foodId}`);
      if (!res.ok) {
        throw new Error(`Failed to get culture card: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error getting culture card:', error);
      throw error;
    }
  }

  /**
   * Convert AI Council response thành format cho UI
   */
  convertAICouncilToUI(aiCouncil: AICouncilResponse): AICouncilMember[] {
    const modelNames: { [key: string]: string } = {
      resnet: 'ResNet-50',
      vgg16: 'VGG16',
      custom_cnn: 'Custom CNN',
      efficientnet_v2: 'EfficientNet V2',
      color_histogram: 'Color Histogram',
    };

    const quotes: { [key: string]: string } = {
      resnet: 'Kết cấu sợi phở và lát thịt bò rất rõ ràng.',
      vgg16: 'Phát hiện hành tây, nước dùng trong.',
      custom_cnn: 'Màu nước dùng hơi đỏ, có thể là Bún Bò?',
      efficientnet_v2: 'Đặc trưng thảo mộc và bánh phở tươi. Chắc chắn 100%.',
      color_histogram: 'Phở màu tương đồng với dữ liệu Phở.',
    };

    return Object.entries(aiCouncil.model_details).map(([key, detail]) => {
      const confidence = detail.confidence || 0;

      // Xác định state dựa trên confidence
      let state: 'ok' | 'warn' | 'error' = 'ok';
      if (confidence < 0.5) {
        state = 'error';
      } else if (confidence < 0.7) {
        state = 'warn';
      }

      // Nếu prediction khác với best_match, đánh dấu warn
      if (detail.prediction !== aiCouncil.best_match) {
        state = 'warn';
      }

      return {
        name: modelNames[key] || key,
        quote: quotes[key] || `Dự đoán: ${detail.prediction}`,
        score: `${Math.round(confidence * 100)}%`,
        result: detail.prediction,
        state,
      };
    });
  }
}

export const apiService = new ApiService();
