/**
 * Auth Context
 * Quản lý trạng thái authentication toàn ứng dụng
 *
 * BẢO MẬT:
 * - Lưu token vào secure storage
 * - Kiểm tra token khi app khởi động
 * - Tự động logout nếu token không hợp lệ
 */

import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  login as loginApi,
  LoginData,
  register as registerApi,
  RegisterData,
} from '../services/authApi';
import { clearAuthData, getToken, getUser, saveToken, saveUser } from '../utils/secureStorage';

export interface User {
  id: string;
  username: string;
  email: string;
  current_rank: string;
  avatar?: string;
  unlocked_provinces?: string[];
}

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  /**
   * Kiểm tra token khi app khởi động
   * Nếu có token hợp lệ, tự động đăng nhập
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const savedUser = await getUser();

        if (token && savedUser) {
          // Có token và user data, thử verify với server
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsLoggedIn(true);
          } catch (error) {
            // Token không hợp lệ, xóa dữ liệu cũ
            console.warn('Token invalid, clearing auth data');
            await clearAuthData();
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Đăng nhập
   *
   * @param data - { emailOrUsername, password }
   */
  const login = async (data: LoginData): Promise<void> => {
    try {
      const response = await loginApi(data);

      // Lưu token vào secure storage
      await saveToken(response.token);

      // Lưu user data vào secure storage
      await saveUser(response.user);

      // Cập nhật state
      setUser(response.user);
      setIsLoggedIn(true);

      // Redirect về home hoặc profile
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Đăng ký
   *
   * @param data - { username, email, password }
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await registerApi(data);

      // Lưu token vào secure storage
      await saveToken(response.token);

      // Lưu user data vào secure storage
      await saveUser(response.user);

      // Cập nhật state
      setUser(response.user);
      setIsLoggedIn(true);

      // Redirect về home hoặc profile
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  /**
   * Đăng xuất
   * Xóa token và user data khỏi secure storage
   */
  const logout = async (): Promise<void> => {
    try {
      await clearAuthData();
      setIsLoggedIn(false);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn set state ngay cả khi có lỗi
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  /**
   * Refresh user info từ server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await saveUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      // Nếu lỗi 401, tự động logout
      if ((error as any)?.response?.status === 401) {
        await logout();
      }
    }
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoggedIn, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
