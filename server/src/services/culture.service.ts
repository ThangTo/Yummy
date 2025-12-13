/**
 * Culture Service - Xử lý logic liên quan đến Culture Card
 * Tích hợp với Gemini API để sinh nội dung văn hóa
 */

export interface CultureCardData {
  name_vi: string;
  province_name: string;
  story: string; // Câu chuyện văn hóa từ GenAI
  how_to_eat?: string;
  pronunciation?: string; // Phát âm chuẩn
}

export class CultureService {
  /**
   * Lấy dữ liệu cho Culture Card
   * TODO: Tích hợp với Gemini API để sinh story
   */
  async getCultureCard(foodName: string, provinceName: string): Promise<CultureCardData> {
    // TODO: Gọi Gemini API với genai_prompt_seed
    // Hiện tại trả về mock data
    
    return {
      name_vi: foodName,
      province_name: provinceName,
      story: `Câu chuyện về ${foodName} ở ${provinceName}...`, // Sẽ được thay bằng GenAI
      how_to_eat: 'Hướng dẫn cách ăn...',
      pronunciation: foodName,
    };
  }

  /**
   * Generate story từ Gemini API
   * TODO: Implement khi có Gemini API key
   */
  async generateStory(foodName: string, provinceName: string, promptSeed?: string): Promise<string> {
    // TODO: Gọi Gemini API
    // const response = await geminiClient.generateContent(...)
    return `Câu chuyện về ${foodName} ở ${provinceName}`;
  }
}

