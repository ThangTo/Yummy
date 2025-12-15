/**
 * Auth API Service với Axios Interceptor
 * 
 * BẢO MẬT:
 * - Tự động chèn Authorization header vào mọi request
 * - Token được lấy từ secure storage
 * - Tự động logout nếu token expired hoặc invalid
 * 
 * Cách sử dụng:
 * - Import: import { authApi } from '@/services/authApi'
 * - Gọi API: authApi.post('/auth/login', { email, password })
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, deleteToken } from '../utils/secureStorage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// Tạo axios instance
const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 giây timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Tự động chèn Authorization header vào mọi request
 * 
 * BẢO MẬT:
 * - Lấy token từ secure storage
 * - Chèn vào header: Authorization: Bearer <token>
 * - Nếu không có token, không chèn header (cho public routes)
 */
authApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Lấy token từ secure storage
      const token = await getToken();

      // Nếu có token, chèn vào header
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token in interceptor:', error);
      // Không throw error, tiếp tục request không có token (cho public routes)
    }

    return config;
  },
  (error: AxiosError) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Xử lý lỗi authentication và tự động logout nếu cần
 * 
 * BẢO MẬT:
 * - Nếu token expired (401), tự động xóa token và logout
 * - Xử lý các lỗi khác một cách thân thiện
 */
authApi.interceptors.response.use(
  (response) => {
    // Response thành công, trả về data
    return response;
  },
  async (error: AxiosError) => {
    // Xử lý lỗi response

    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized - Token expired hoặc invalid
      if (status === 401) {
        console.warn('⚠️ Token expired or invalid. Logging out...');

        // Xóa token khỏi secure storage
        await deleteToken();

        // Có thể emit event để các component khác biết và redirect về login
        // Hoặc có thể dùng navigation để redirect
        // Ở đây chúng ta chỉ log, component sẽ tự xử lý dựa vào error response
      }

      // 403 Forbidden - Không có quyền truy cập
      if (status === 403) {
        console.warn('⚠️ Access forbidden');
      }

      // 500 Server Error
      if (status >= 500) {
        console.error('❌ Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('❌ No response received:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('❌ Error setting up request:', error.message);
    }

    // Trả về error để component xử lý
    return Promise.reject(error);
  },
);

/**
 * Auth API Methods
 */

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    current_rank: string;
  };
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  current_rank: string;
  unlocked_provinces: string[];
  food_passport_count: number;
}

/**
 * Đăng ký tài khoản mới
 * 
 * @param data - { username, email, password }
 * @returns Promise<AuthResponse>
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Đăng nhập
 * 
 * @param data - { emailOrUsername, password }
 * @returns Promise<AuthResponse>
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Lấy thông tin user hiện tại
 * Cần token trong header (tự động chèn bởi interceptor)
 * 
 * @returns Promise<UserInfo>
 */
export const getCurrentUser = async (): Promise<UserInfo> => {
  const response = await authApi.get<{ success: boolean; user: UserInfo }>('/auth/me');
  return response.data.user;
};

// Export axios instance để dùng cho các API khác nếu cần
export { authApi };






