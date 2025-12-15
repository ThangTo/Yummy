import { useCallback, useEffect, useState } from 'react';
import { apiService, UserPassport } from '../services/api';
import { useAuth } from './use-auth';

type PassportState = {
  data: UserPassport | null;
  isLoading: boolean;
  error: string | null;
};

export const usePassport = () => {
  const { user, isLoggedIn } = useAuth();
  const [state, setState] = useState<PassportState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchPassport = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      setState((prev) => ({ ...prev, data: null, error: null }));
      return;
    }
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const data = await apiService.getUserPassport(user.id);
      setState({ data, isLoading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch passport', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.message || 'Không thể tải hộ chiếu',
      }));
    }
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  return {
    passport: state.data,
    isLoadingPassport: state.isLoading,
    passportError: state.error,
    refreshPassport: fetchPassport,
  };
};
