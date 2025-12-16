import { usePassportContext } from '../context/PassportContext';

export const usePassport = () => {
  const { passport, isLoading, error, refreshPassport } = usePassportContext();

  return {
    passport,
    isLoadingPassport: isLoading,
    passportError: error,
    refreshPassport,
  };
};
