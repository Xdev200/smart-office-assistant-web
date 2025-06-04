
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedUserId, setStoredUserId] = useLocalStorage<string | null>('smartOfficeUserId', null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (storedUserId) {
      const user = MOCK_USERS.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        setStoredUserId(null); // Clear invalid stored ID
      }
    }
  }, [storedUserId, setStoredUserId]);

  const login = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setStoredUserId(user.id);
    } else {
      console.error("User not found for login:", userId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setStoredUserId(null);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
