/**
 * Secure Storage Helper
 * 
 * BẢO MẬT:
 * - Sử dụng expo-secure-store để lưu token an toàn
 * - Token được mã hóa và lưu trong Keychain (iOS) / Keystore (Android)
 * - KHÔNG BAO GIỜ dùng AsyncStorage cho token (không an toàn)
 * 
 * Lưu ý:
 * - expo-secure-store chỉ lưu được string, không lưu được object
 * - Tự động mã hóa/giải mã khi lưu/lấy
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Lưu JWT token vào secure storage
 * 
 * @param token - JWT token string
 * @returns Promise<void>
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('✅ Token saved securely');
  } catch (error) {
    console.error('❌ Error saving token:', error);
    throw new Error('Không thể lưu token. Vui lòng thử lại.');
  }
};

/**
 * Lấy JWT token từ secure storage
 * 
 * @returns Promise<string | null> - Token hoặc null nếu không có
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

/**
 * Xóa JWT token khỏi secure storage
 * 
 * @returns Promise<void>
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('✅ Token deleted');
  } catch (error) {
    console.error('❌ Error deleting token:', error);
    // Không throw error vì có thể token không tồn tại
  }
};

/**
 * Lưu thông tin user vào secure storage
 * 
 * @param userData - Object chứa thông tin user (sẽ được stringify)
 * @returns Promise<void>
 */
export const saveUser = async (userData: {
  id: string;
  username: string;
  email: string;
  current_rank?: string;
}): Promise<void> => {
  try {
    const userString = JSON.stringify(userData);
    await SecureStore.setItemAsync(USER_KEY, userString);
    console.log('✅ User data saved securely');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    throw new Error('Không thể lưu thông tin người dùng.');
  }
};

/**
 * Lấy thông tin user từ secure storage
 * 
 * @returns Promise<object | null> - User data hoặc null nếu không có
 */
export const getUser = async (): Promise<{
  id: string;
  username: string;
  email: string;
  current_rank?: string;
} | null> => {
  try {
    const userString = await SecureStore.getItemAsync(USER_KEY);
    if (!userString) {
      return null;
    }
    return JSON.parse(userString);
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

/**
 * Xóa thông tin user khỏi secure storage
 * 
 * @returns Promise<void>
 */
export const deleteUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
    console.log('✅ User data deleted');
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
  }
};

/**
 * Xóa tất cả dữ liệu auth (token + user)
 * Dùng khi logout
 * 
 * @returns Promise<void>
 */
export const clearAuthData = async (): Promise<void> => {
  await Promise.all([deleteToken(), deleteUser()]);
};






