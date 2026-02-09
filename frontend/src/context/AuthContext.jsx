import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

// Tạo Context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Khởi tạo - kiểm tra token từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, email: userEmail, fullName, roles } = response.data;

      // Lưu token và user vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        email: userEmail, 
        fullName, 
        roles 
      }));

      // Cập nhật state
      setToken(token);
      setUser({ email: userEmail, fullName, roles });
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Register
  const register = async (formData) => {
    try {
      const response = await authApi.register(formData);
      const { token, email, fullName, roles } = response.data;

      // Lưu token và user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        fullName, 
        roles 
      }));

      // Cập nhật state
      setToken(token);
      setUser({ email, fullName, roles });
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Forgot Password - Gửi OTP
  const sendOtp = async (email) => {
    return await authApi.forgotPassword(email);
  };

  // Reset Password - Xác nhận OTP & Đổi mật khẩu
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    return await authApi.resetPassword({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    sendOtp,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
