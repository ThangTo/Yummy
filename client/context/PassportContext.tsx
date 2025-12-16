import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiService, type UserPassport } from '../services/api';
import { useAuth } from '../hooks/use-auth';

type PassportState = {
  passport: UserPassport | null;
  isLoading: boolean;
  error: string | null;
  refreshPassport: () => Promise<void>;
};

const PassportContext = createContext<PassportState | undefined>(undefined);

export const PassportProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState<UserPassport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPassport = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      setData(null);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiService.getUserPassport(user.id);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch passport', err);
      setError(err?.message || 'Không thể tải hộ chiếu');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  // Tự động tải lại khi user hoặc trạng thái đăng nhập thay đổi
  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  const value = useMemo(
    () => ({
      passport: data,
      isLoading,
      error,
      refreshPassport: fetchPassport,
    }),
    [data, isLoading, error, fetchPassport],
  );

  return <PassportContext.Provider value={value}>{children}</PassportContext.Provider>;
};

export const usePassportContext = () => {
  const ctx = useContext(PassportContext);
  if (!ctx) {
    throw new Error('usePassportContext must be used within PassportProvider');
  }
  return ctx;
};


