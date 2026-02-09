import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import đầy đủ các trang
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register'; // <-- Trang Đăng ký
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'; // <-- Trang Quên pass
import Dashboard from '../pages/Dashboard/Dashboard'; // <-- Trang Dashboard
import Product from '../pages/Product/Product'; // <-- (Optional) Trang Product nếu có

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Product />} /> 

        {/* Route bắt lỗi: Nhập link bậy bạ sẽ quay về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;