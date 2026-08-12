import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { jwtDecode } from 'jwt-decode';

export type UserPayload = {
  userId: string;
  role: string;
  baseId: string;
};

type AuthContextType = {
  user: UserPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mams_token'));
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        setUser(decoded);
        localStorage.setItem('mams_token', token);
      } catch (err) {
        console.error('Failed to decode token');
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem('mams_token');
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
