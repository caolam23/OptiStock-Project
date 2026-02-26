import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import đầy đủ các trang
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register'; // <-- Trang Đăng ký
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'; // <-- Trang Quên pass
import Dashboard from '../pages/Dashboard/Dashboard'; // <-- Trang Dashboard
import Product from '../pages/Product/Product'; // <-- (Optional) Trang Product nếu có
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard'; // <-- Admin Dashboard
import TenantOnboarding from '../pages/TenantOnboarding/TenantOnboarding'; // <-- Tenant Onboarding Wizard
import RoleBasedRoute from '../components/RoleBasedRoute'; // <-- Role protection

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES (Ai cũng vào được) --- */}
        
        {/* Mặc định vào trang chủ sẽ chuyển hướng về Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- PROTECTED ROUTES (Sau này sẽ chặn nếu chưa login) --- */}
        
        {/* User Dashboard - Bất kỳ user authenticated nào cũng có thể xem */}
        <Route path="/dashboard" element={
          <RoleBasedRoute 
            allowedRoles={[]} 
            element={<Dashboard />} 
          />
        } />
        <Route path="/products" element={
          <RoleBasedRoute 
            allowedRoles={[]} 
            element={<Product />} 
          />
        } />

        {/* Tenant Onboarding - Create new warehouse/tenant */}
        <Route path="/onboarding" element={
          <RoleBasedRoute 
            allowedRoles={[]} 
            element={<TenantOnboarding />} 
          />
        } />
        
        {/* Admin Dashboard - Chỉ Super Admin */}
        <Route path="/admin" element={
          <RoleBasedRoute 
            allowedRoles={['SUPER_ADMIN']} 
            element={<AdminDashboard />} 
          />
        } /> 

        {/* Route bắt lỗi: Nhập link bậy bạ sẽ quay về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;