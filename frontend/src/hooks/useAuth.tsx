import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  secureGateLogin: (credentials: { email: string; password: string; passcode?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mw_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mw_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('mw_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.me();
      setUser(response.user);
      localStorage.setItem('mw_user', JSON.stringify(response.user));
    } catch {
      localStorage.removeItem('mw_token');
      localStorage.removeItem('mw_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('mw_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mw_auth_unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('mw_token', response.token);
      localStorage.setItem('mw_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const secureGateLogin = async (credentials: { email: string; password: string; passcode?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.secureGateLogin(credentials);
      localStorage.setItem('mw_token', response.token);
      localStorage.setItem('mw_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('mw_token');
      localStorage.removeItem('mw_user');
      setToken(null);
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        secureGateLogin,
        logout,
        refreshUser,
        isAdmin,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

