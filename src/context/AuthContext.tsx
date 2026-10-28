import React, { createContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/user';
import {
  AccountResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '../types/account';
import { storageService } from '../services/storageService';
import { accountService } from '../services/accountService';
import { apiClient } from '../api/client';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  refreshProfile: () => Promise<AccountResponse | null>;
  updateProfile: (request: UpdateProfileRequest) => Promise<AccountResponse>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const mapAccountToUserProfile = (
  acc: AccountResponse,
  existing?: UserProfile | null
): UserProfile => ({
  id: acc.id,
  fullName: `${acc.firstName || ''} ${acc.lastName || ''}`.trim() || 'Passenger',
  firstName: acc.firstName,
  lastName: acc.lastName,
  phoneNumber: acc.phoneNumber,
  email: acc.email,
  role: acc.role,
  status: acc.status,
  profile: acc.profile,
  rating: existing?.rating ?? 5.0,
  walletBalance: existing?.walletBalance ?? 0,
  createdAt: acc.createdAt,
  updatedAt: acc.updatedAt,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore stored session and attempt fresh GET /accounts/{id}
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await storageService.getItem('authToken');
        const savedAccountId = await storageService.getItem('accountId');

        if (savedToken) {
          setToken(savedToken);
          apiClient.setToken(savedToken);
          setIsAuthenticated(true);

          if (savedAccountId) {
            try {
              const freshAccount = await accountService.getAccountById(savedAccountId, savedToken);
              if (freshAccount.role && freshAccount.role !== 'PASSENGER') {
                await storageService.removeItem('authToken');
                await storageService.removeItem('accountId');
                setToken(null);
                apiClient.setToken(null);
                setIsAuthenticated(false);
                setUser(null);
                return;
              }
              setUser((prev) => mapAccountToUserProfile(freshAccount, prev));
            } catch {
              // Network error or backend offline; keep stored user
            }
          }
        }
      } catch {
        // storage reading error ignored
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * POST /accounts/login
   */
  const login = async (request: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await accountService.login(request);

      if (response.account?.role && response.account.role !== 'PASSENGER') {
        throw new Error('This app is for passengers only. Driver accounts cannot log in here.');
      }

      setToken(response.token);
      apiClient.setToken(response.token);

      const mappedUser = mapAccountToUserProfile(response.account, user);
      setUser(mappedUser);
      setIsAuthenticated(true);

      await storageService.setItem('authToken', response.token);
      if (response.account?.id) {
        await storageService.setItem('accountId', response.account.id);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * POST /accounts/register
   */
  const register = async (request: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await accountService.register({
        ...request,
        role: 'PASSENGER',
      });
      setToken(response.token);
      apiClient.setToken(response.token);

      const mappedUser = mapAccountToUserProfile(response.account, user);
      setUser(mappedUser);
      setIsAuthenticated(true);

      await storageService.setItem('authToken', response.token);
      if (response.account?.id) {
        await storageService.setItem('accountId', response.account.id);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * GET /accounts/{id}
   */
  const refreshProfile = useCallback(async (): Promise<AccountResponse | null> => {
    const currentId = user?.id;
    if (!currentId) return null;

    setIsLoading(true);
    try {
      const accountData = await accountService.getAccountById(currentId, token || undefined);
      setUser((prev) => mapAccountToUserProfile(accountData, prev));
      return accountData;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);

  /**
   * PUT /accounts/{id}
   */
  const updateProfile = async (request: UpdateProfileRequest): Promise<AccountResponse> => {
    const currentId = user?.id;
    if (!currentId) throw new Error('No logged-in user to update');

    setIsLoading(true);
    try {
      const updatedAccount = await accountService.updateProfile(
        currentId,
        request,
        token || undefined
      );
      setUser((prev) => mapAccountToUserProfile(updatedAccount, prev));
      return updatedAccount;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (_phone: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    return true;
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (otp.length === 4) {
      await storageService.setItem('authToken', 'demo_jwt_token_yamu');
      const otpUser: UserProfile = {
        id: `usr_${Date.now()}`,
        fullName: 'Passenger',
        phoneNumber: phone,
        email: '',
        role: 'PASSENGER',
        status: 'ACTIVE',
        rating: 5.0,
        walletBalance: 0,
      };
      setUser(otpUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    apiClient.setToken(null);
    setToken(null);
    await storageService.removeItem('authToken');
    await storageService.removeItem('accountId');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        user,
        login,
        register,
        refreshProfile,
        updateProfile,
        loginWithPhone,
        verifyOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
