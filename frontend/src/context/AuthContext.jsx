import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isActive, setIsActive] = useState(true);

  /**
   * Danh sách kho user đã tham gia + role trong từng kho.
   * VD: [{tenantId: "kho-a", role: "MANAGER", joinedAt: "..."}, ...]
   */
  const [memberships, setMemberships] = useState([]);

  /**
   * Kho đang làm việc hiện tại.
   * Được lưu vào localStorage để nhớ sau khi refresh.
   */
  const [currentTenantId, setCurrentTenantId] = useState(null);

  // Khởi tạo — đọc từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTenantId = localStorage.getItem('currentTenantId');

    if (savedToken && savedUser) {
      const userObj = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userObj);
      setUserId(userObj.userId);
      setMemberships(userObj.memberships || []);
      setAvatar(userObj.avatar);
      setIsActive(userObj.isActive !== false);
      setIsAuthenticated(true);

      // Khôi phục tenant đang làm việc
      if (savedTenantId) {
        setCurrentTenantId(savedTenantId);
      } else if (userObj.memberships && userObj.memberships.length > 0) {
        // Tự chọn kho đầu tiên nếu chưa có
        setCurrentTenantId(userObj.memberships[0].tenantId);
      }
    }
    setLoading(false);
  }, []);

  // ===================== Utility: Role Helpers =====================

  /** Lấy role của user trong kho đang làm việc */
  const getCurrentRole = () => {
    if (!currentTenantId) return null;
    const m = memberships.find(m => m.tenantId === currentTenantId);
    return m ? m.role : null;
  };

  /** Kiểm tra role trong kho hiện tại */
  const hasRole = (roleName) => getCurrentRole() === roleName;

  /** Kiểm tra trong kho hiện tại có phải 1 trong các role không */
  const hasAnyRole = (...roleNames) => roleNames.includes(getCurrentRole());

  const isSuperAdmin = () => memberships.some(m => m.role === 'SUPER_ADMIN');
  // TENANT_ADMIN d� g?p v�o MANAGER  isTenantAdmin() gi? check MANAGER
  const isTenantAdmin = () => hasRole('MANAGER');
  const isManager = () => hasRole('MANAGER');
  const isStaff = () => hasRole('STAFF');
  const isAccountant = () => hasRole('ACCOUNTANT');
  const isSale = () => hasRole('SALE');

  /** Kiểm tra user có thuộc kho nào không */
  const isMemberOf = (tenantId) => memberships.some(m => m.tenantId === tenantId);

  /**
   * Switch sang kho khác.
   * Cập nhật currentTenantId, lưu vào localStorage.
   */
  const switchTenant = (tenantId) => {
    if (!isMemberOf(tenantId)) {
      console.warn('Bạn không phải thành viên của kho này:', tenantId);
      return false;
    }
    setCurrentTenantId(tenantId);
    localStorage.setItem('currentTenantId', tenantId);
    return true;
  };

  // ===================== Auth Methods =====================

  const _saveUserData = (data) => {
    const { token: newToken, userId: newUserId, email, fullName,
            memberships: newMemberships, avatar: newAvatar, isActive: newIsActive } = data;

    const userDataToSave = { userId: newUserId, email, fullName,
                             memberships: newMemberships || [], avatar: newAvatar, isActive: newIsActive };

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userDataToSave));

    setToken(newToken);
    setUserId(newUserId);
    setUser(userDataToSave);
    setMemberships(newMemberships || []);
    setAvatar(newAvatar);
    setIsActive(newIsActive !== false);
    setIsAuthenticated(true);

    // Chọn kho mặc định: kho đầu tiên nếu chưa có
    const savedTenantId = localStorage.getItem('currentTenantId');
    if (!savedTenantId && newMemberships && newMemberships.length > 0) {
      setCurrentTenantId(newMemberships[0].tenantId);
      localStorage.setItem('currentTenantId', newMemberships[0].tenantId);
    } else if (savedTenantId) {
      setCurrentTenantId(savedTenantId);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      _saveUserData(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await authApi.register(formData);
      _saveUserData(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const googleLogin = async (token) => {
    setLoading(true);
    try {
      const response = await authApi.googleLogin({ token });
      _saveUserData(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTenantId');
    setToken(null);
    setUserId(null);
    setUser(null);
    setMemberships([]);
    setCurrentTenantId(null);
    setAvatar(null);
    setIsActive(true);
    setIsAuthenticated(false);
  };

  const sendOtp = async (email) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    return await authApi.resetPassword({ email, otp, newPassword, confirmPassword });
  };

  const value = {
    // State
    user, token, loading, isAuthenticated,
    userId, avatar, isActive,
    memberships, currentTenantId,

    // Methods
    login, register, googleLogin, logout, sendOtp, resetPassword,
    switchTenant,

    // Role helpers (dựa theo currentTenantId)
    getCurrentRole, hasRole, hasAnyRole,
    isSuperAdmin, isTenantAdmin, isManager,
    isStaff, isAccountant, isSale, isMemberOf,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
