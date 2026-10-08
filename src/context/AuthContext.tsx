import React, { createContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { storageService } from '../services/storageService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  loginWithPhone: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USER: UserProfile = {
  id: 'usr_101',
  fullName: 'Kasun Perera',
  phoneNumber: '+94771234567',
  email: 'kasun.perera@example.com',
  rating: 4.9,
  walletBalance: 2450,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for preview
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER);

  useEffect(() => {
    // Check saved session on app mount
    const checkSession = async () => {
      const token = await storageService.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  const loginWithPhone = async (_phone: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    return true;
  };

  const verifyOtp = async (_phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (otp.length === 4) {
      await storageService.setItem('authToken', 'demo_jwt_token_yamu');
      setUser(DEMO_USER);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    await storageService.removeItem('authToken');
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
        user,
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
