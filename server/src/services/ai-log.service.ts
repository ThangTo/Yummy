import { AILog, IAILog } from '../models/AILog';

export class AILogService {
  /**
   * Tạo log mới cho AI processing
   */
  async createLog(logData: Partial<IAILog>): Promise<IAILog> {
    // Tự động set upload_timestamp nếu chưa có
    if (!logData.upload_timestamp) {
      logData.upload_timestamp = new Date();
    }
    return AILog.create(logData);
  }

  /**
   * Lấy danh sách logs (mới nhất trước)
   */
  async getLogs(limit: number = 50): Promise<IAILog[]> {
    return AILog.find()
      .sort({ upload_timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Lấy log theo ID
   */
  async getLogById(id: string): Promise<IAILog | null> {
    return AILog.findById(id).lean();
  }

  /**
   * Lấy logs của một user
   */
  async getLogsByUserId(userId: string, limit: number = 50): Promise<IAILog[]> {
    return AILog.find({ user_id: userId })
      .sort({ upload_timestamp: -1 })
      .limit(limit)
      .lean();
  }
}

