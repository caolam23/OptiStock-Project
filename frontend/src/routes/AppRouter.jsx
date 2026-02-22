import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Dashboard from '../pages/Dashboard/Dashboard';
import Product from '../pages/Product/Product';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import RoleBasedRoute from '../components/RoleBasedRoute';

/**
 * AppRouter — định nghĩa toàn bộ routes với phân quyền theo role.
 *
 * Roles hệ thống:
 *   SUPER_ADMIN  — Quản trị toàn hệ thống (bypass mọi route)
 *   MANAGER — Chủ kho (quản lý toàn bộ kho của mình)
 *   MANAGER      — Quản lý kho
 *   STAFF        — Nhân viên kho
 *   ACCOUNTANT   — Kế toán kho
 *   SALE         — Nhân viên bán hàng
 *
 * Mỗi route dùng RoleBasedRoute với allowedRoles tương ứng.
 * Header X-Tenant-Id phải được gửi kèm trong mọi API call khi vào kho.
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ===== DASHBOARD — Mọi user đã login ===== */}
        <Route path="/dashboard" element={
          <RoleBasedRoute allowedRoles={[]} element={<Dashboard />} />
        } />

        {/* ===== ADMIN SYSTEM — Chỉ SUPER_ADMIN ===== */}
        <Route path="/admin" element={
          <RoleBasedRoute
            allowedRoles={['SUPER_ADMIN']}
            element={<AdminDashboard />}
            redirectTo="/dashboard"
          />
        } />

        {/* ===== KHO HÀNG — MANAGER, MANAGER, STAFF ===== */}
        {/* 
          Trang warehouse: xem hàng tồn kho, nhập xuất hàng
          Placeholder — sẽ được xây giao diện sau
        */}
        <Route path="/warehouse" element={
          <RoleBasedRoute
            allowedRoles={['MANAGER', 'STAFF']}
            element={<Product />}
            redirectTo="/dashboard"
          />
        } />

        {/* Sản phẩm/hàng hóa — MANAGER, MANAGER, STAFF */}
        <Route path="/products" element={
          <RoleBasedRoute
            allowedRoles={['MANAGER', 'STAFF']}
            element={<Product />}
            redirectTo="/dashboard"
          />
        } />

        {/* ===== BÁN HÀNG — MANAGER, SALE ===== */}
        {/*
          Trang sales: tạo đơn hàng, xem đơn hàng của mình
          Placeholder — sẽ được xây giao diện sau
        */}
        <Route path="/sales" element={
          <RoleBasedRoute
            allowedRoles={['MANAGER', 'SALE']}
            element={<Dashboard />}
            redirectTo="/dashboard"
          />
        } />

        {/* ===== KẾ TOÁN — MANAGER, ACCOUNTANT ===== */}
        {/*
          Trang accounting: báo cáo thu chi, xuất hóa đơn
          Placeholder — sẽ được xây giao diện sau
        */}
        <Route path="/accounting" element={
          <RoleBasedRoute
            allowedRoles={['ACCOUNTANT']}
            element={<Dashboard />}
            redirectTo="/dashboard"
          />
        } />

        {/* ===== BÁO CÁO — MANAGER, MANAGER, ACCOUNTANT ===== */}
        <Route path="/reports" element={
          <RoleBasedRoute
            allowedRoles={['MANAGER', 'ACCOUNTANT']}
            element={<Dashboard />}
            redirectTo="/dashboard"
          />
        } />

        {/* ===== QUẢN LÝ TEAM — MANAGER only ===== */}
        {/*
          Trang team: mời thành viên, phân role, xem danh sách nhân viên
          Placeholder — sẽ được xây giao diện sau
        */}
        <Route path="/team" element={
          <RoleBasedRoute
            allowedRoles={['MANAGER']}
            element={<Dashboard />}
            redirectTo="/dashboard"
          />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;