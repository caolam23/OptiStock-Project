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
  const [userId, setUserId] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // Khởi tạo - kiểm tra token từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const userObj = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userObj);
      setUserId(userObj.userId);
      setTenantId(userObj.tenantId);
      setRoles(userObj.roles || []);
      setAvatar(userObj.avatar);
      setIsActive(userObj.isActive !== false);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Utility function - Check if user has specific role
  const hasRole = (roleName) => {
    return roles && roles.includes(roleName);
  };

  const isSuperAdmin = () => {
    return hasRole('SUPER_ADMIN');
  };

  const isTenantAdmin = () => {
    return hasRole('TENANT_ADMIN');
  };

  const isStaff = () => {
    return hasRole('STAFF');
  };

  const isAccountant = () => {
    return hasRole('ACCOUNTANT');
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { 
        token: newToken, 
        userId: newUserId,
        email: userEmail, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      } = response.data;

      // Lưu token và user vào localStorage
      localStorage.setItem('token', newToken);
      const userDataToSave = {
        userId: newUserId,
        email: userEmail, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      };
      localStorage.setItem('user', JSON.stringify(userDataToSave));

      // Cập nhật state - ✅ FIX: Lưu đầy đủ user object
      setToken(newToken);
      setUserId(newUserId);
      setUser(userDataToSave);
      setRoles(newRoles || []);
      setTenantId(newTenantId);
      setAvatar(newAvatar);
      setIsActive(newIsActive !== false);
      setIsAuthenticated(true);
      setLoading(false);

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  // Register
  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await authApi.register(formData);
      const { 
        token: newToken, 
        userId: newUserId,
        email, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      } = response.data;

      // Lưu token và user
      localStorage.setItem('token', newToken);
      const userDataToSave = {
        userId: newUserId,
        email, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      };
      localStorage.setItem('user', JSON.stringify(userDataToSave));

      // Cập nhật state - ✅ FIX: Lưu đầy đủ user object
      setToken(newToken);
      setUserId(newUserId);
      setUser(userDataToSave);
      setRoles(newRoles || []);
      setTenantId(newTenantId);
      setAvatar(newAvatar);
      setIsActive(newIsActive !== false);
      setIsAuthenticated(true);
      setLoading(false);

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  // Google Login
  const googleLogin = async (token) => {
    setLoading(true);
    try {
      const response = await authApi.googleLogin({ token });
      const { 
        token: newToken, 
        userId: newUserId,
        email, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      } = response.data;

      // Lưu token và user
      localStorage.setItem('token', newToken);
      const userDataToSave = {
        userId: newUserId,
        email, 
        fullName, 
        roles: newRoles,
        tenantId: newTenantId,
        avatar: newAvatar,
        isActive: newIsActive
      };
      localStorage.setItem('user', JSON.stringify(userDataToSave));

      // Cập nhật state - ✅ FIX: Lưu đầy đủ user object
      setToken(newToken);
      setUserId(newUserId);
      setUser(userDataToSave);
      setRoles(newRoles || []);
      setTenantId(newTenantId);
      setAvatar(newAvatar);
      setIsActive(newIsActive !== false);
      setIsAuthenticated(true);
      setLoading(false);

      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setUser(null);
    setRoles([]);
    setTenantId(null);
    setAvatar(null);
    setIsActive(true);
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
    // State
    user,
    token,
    loading,
    isAuthenticated,
    userId,
    tenantId,
    roles,
    avatar,
    isActive,
    
    // Methods
    login,
    register,
    googleLogin,
    logout,
    sendOtp,
    resetPassword,
    
    // Utility methods
    hasRole,
    isSuperAdmin,
    isTenantAdmin,
    isStaff,
    isAccountant,
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
