import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

// ============================================================
// AuthContext: Foundation cho toàn bộ hệ thống phân quyền
//
// LUỒNG:
//   1. Đăng nhập → nhận JWT (chứa systemRoles: [] hoặc ['SUPER_ADMIN'])
//   2. Gọi /api/v1/workspaces/my-workspaces → lấy danh sách kho user tham gia
//   3. User chọn 1 kho → switchWorkspace({ id, name, role, industryCode })
//   4. Mọi API call workspace cần gắn header: "X-Workspace-Id: currentWorkspace.id"
//
// CÁCH TEAMMATES DÙNG:
//   const { getWorkspaceRole, isWorkspaceOwner, isWorkspaceManager } = useAuth();
//   if (isWorkspaceManager()) { ... hiện nút chỉnh sửa ... }
// ============================================================

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- System State (từ JWT) ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [systemRoles, setSystemRoles] = useState([]); // ['SUPER_ADMIN'] hoặc []
  const [avatar, setAvatar] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // --- Workspace State (sau khi user chọn kho) ---
  // currentWorkspace: { id, name, role, industryCode, lastAccessed }
  // role: 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'SALE' | 'STAFF'
  const [currentWorkspace, setCurrentWorkspaceState] = useState(null);

  // Khởi tạo từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedWorkspace = localStorage.getItem('currentWorkspace');

    if (savedToken && savedUser) {
      const userObj = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userObj);
      setUserId(userObj.userId);
      setSystemRoles(userObj.roles || []);
      setAvatar(userObj.avatar);
      setIsActive(userObj.isActive !== false);
      setIsAuthenticated(true);
    }

    if (savedWorkspace) {
      try {
        setCurrentWorkspaceState(JSON.parse(savedWorkspace));
      } catch (_) { }
    }

    setLoading(false);
  }, []);

  // ============================================================
  // WORKSPACE SWITCHER
  // Gọi sau khi user chọn kho từ danh sách (WorkspaceSelector component)
  // ============================================================
  const switchWorkspace = useCallback((workspace) => {
    // workspace: { id, name, role, industryCode, lastAccessed } hoặc null để deselect
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('currentWorkspace');
    }
  }, []);

  // ============================================================
  // WORKSPACE ROLE HELPERS — Teammates dùng để check quyền
  // ============================================================

  /** Lấy role của user trong workspace hiện tại: 'OWNER'|'MANAGER'|'ACCOUNTANT'|'SALE'|'STAFF'|null */
  const getWorkspaceRole = () => currentWorkspace?.role ?? null;

  /** Chủ kho — toàn quyền */
  const isWorkspaceOwner = () => getWorkspaceRole() === 'OWNER';

  /** Quản lý kho hoặc cao hơn (OWNER hoặc MANAGER) */
  const isWorkspaceManager = () => ['OWNER', 'MANAGER'].includes(getWorkspaceRole());

  /** Kế toán hoặc cao hơn */
  const isWorkspaceAccountant = () => ['OWNER', 'MANAGER', 'ACCOUNTANT'].includes(getWorkspaceRole());

  /** Nhân viên sale hoặc cao hơn */
  const isWorkspaceSale = () => ['OWNER', 'MANAGER', 'SALE'].includes(getWorkspaceRole());

  /** Bất kỳ ai trong workspace đều có quyền nhân viên kho */
  const isWorkspaceStaff = () => currentWorkspace !== null;

  /** Kiểm tra role cụ thể: hasWorkspaceRole('MANAGER') */
  const hasWorkspaceRole = (role) => getWorkspaceRole() === role;

  // ============================================================
  // SYSTEM ROLE HELPERS
  // ============================================================

  /** Super Admin của nền tảng OptiStock */
  const isSuperAdmin = () => systemRoles.includes('SUPER_ADMIN');

  /** Alias backward compat */
  const hasRole = (roleName) => systemRoles.includes(roleName);

  /** @deprecated Dùng isWorkspaceOwner() */
  const isTenantAdmin = () => isWorkspaceOwner();

  /** @deprecated Dùng isWorkspaceAccountant() */
  const isAccountant = () => isWorkspaceAccountant();

  /** @deprecated Dùng isWorkspaceStaff() */
  const isStaff = () => isWorkspaceStaff();

  // ============================================================
  // AUTH ACTIONS
  // ============================================================

  const _saveSession = (data) => {
    const {
      token: newToken, userId: newUserId, email, fullName,
      roles: newRoles, avatar: newAvatar, isActive: newIsActive
    } = data;

    const userDataToSave = {
      userId: newUserId, email, fullName,
      roles: newRoles, avatar: newAvatar, isActive: newIsActive
    };

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userDataToSave));

    setToken(newToken);
    setUserId(newUserId);
    setUser(userDataToSave);
    setSystemRoles(newRoles || []);
    setAvatar(newAvatar);
    setIsActive(newIsActive !== false);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      _saveSession(response.data);
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
      _saveSession(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
      throw error;
    }
  };

  const googleLogin = async (googleToken) => {
    setLoading(true);
    try {
      const response = await authApi.googleLogin({ token: googleToken });
      _saveSession(response.data);
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
    localStorage.removeItem('currentWorkspace');
    setToken(null);
    setUserId(null);
    setUser(null);
    setSystemRoles([]);
    setAvatar(null);
    setIsActive(true);
    setIsAuthenticated(false);
    setCurrentWorkspaceState(null);
  };

  const sendOtp = async (email) => authApi.forgotPassword(email);

  const resetPassword = async (email, otp, newPassword, confirmPassword) =>
    authApi.resetPassword({ email, otp, newPassword, confirmPassword });

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    // System state
    user, token, loading, isAuthenticated, userId, avatar, isActive,

    // System roles
    systemRoles,
    roles: systemRoles,   // backward compat alias
    hasRole,
    isSuperAdmin,

    // Workspace state
    currentWorkspace,
    switchWorkspace,

    // ✅ Workspace role helpers — TEAMMATES DÙNG CÁC HÀM NÀY
    getWorkspaceRole,       // → 'OWNER'|'MANAGER'|'ACCOUNTANT'|'SALE'|'STAFF'|null
    isWorkspaceOwner,       // Chủ kho
    isWorkspaceManager,     // OWNER hoặc MANAGER
    isWorkspaceAccountant,  // OWNER, MANAGER hoặc ACCOUNTANT
    isWorkspaceSale,        // OWNER, MANAGER hoặc SALE
    isWorkspaceStaff,       // Bất kỳ ai trong workspace
    hasWorkspaceRole,       // check role cụ thể: hasWorkspaceRole('ACCOUNTANT')

    // Auth actions
    login, register, googleLogin, logout, sendOtp, resetPassword,

    // @deprecated — giữ để không break code cũ
    isTenantAdmin,
    isAccountant,
    isStaff,
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
