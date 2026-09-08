import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('playportal_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state by verifying existing token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('playportal_token');
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.warn('Session expired or token invalid:', error.message);
          localStorage.removeItem('playportal_token');
          localStorage.removeItem('playportal_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('playportal_token', data.token);
    localStorage.setItem('playportal_user', JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  // Register handler
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    localStorage.setItem('playportal_token', data.token);
    localStorage.setItem('playportal_user', JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('playportal_token');
    localStorage.removeItem('playportal_user');
    setUser(null);
    setToken(null);
  };

  // Update profile handler
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('playportal_user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'ADMIN',
    isDeveloper: user?.role === 'DEVELOPER' || user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
