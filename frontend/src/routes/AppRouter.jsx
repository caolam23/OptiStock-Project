import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import AcceptInvitation from '../pages/AcceptInvitation/AcceptInvitation';

// Workspace Selector (chọn kho)
import Dashboard from '../pages/Dashboard/Dashboard';

// Admin
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';

// Onboarding
import TenantOnboarding from '../pages/TenantOnboarding/TenantOnboarding';

// Layout & Guards
import RoleBasedRoute from '../components/RoleBasedRoute';
import WorkspaceLayout from '../layouts/WorkspaceLayout';
import WorkspaceRoleRoute from '../components/WorkspaceRoleRoute';

// ── Workspace Pages ────────────────────────────────────
import Overview from '../pages/workspace/Overview';
import Products from '../pages/workspace/Products';
import Locations from '../pages/workspace/Locations';
import Inventory from '../pages/workspace/Inventory';
import Stocktake from '../pages/workspace/Stocktake';
import Finance from '../pages/workspace/Finance';
import Reports from '../pages/workspace/Reports';
import Orders from '../pages/workspace/Orders';
import Customers from '../pages/workspace/Customers';
import StaffTasks from '../pages/workspace/StaffTasks';
import ProcessVoucher from '../pages/workspace/ProcessVoucher';
import StocktakeDetail from '../pages/workspace/StocktakeDetail';
import Personnel from '../pages/workspace/Personnel';
import AuditLog from '../pages/workspace/AuditLog';
import Settings from '../pages/workspace/Settings';
import SalesOrderList from "../pages/workspace/SalesOrderList";
import CreateSalesOrder from "../pages/workspace/CreateSalesOrder";
import AvailableStock from "../pages/workspace/AvailableStock";
import SaleDashboard from "../pages/workspace/SaleDashboard";

/**
 * AppRouter: Cấu trúc routing toàn ứng dụng.
 *
 * /login, /register, /forgot-password   → Public
 * /dashboard                            → Workspace Selector (chọn kho)
 * /workspace/:workspaceId/*             → Trong kho (WorkspaceLayout)
 * /admin                                → Super Admin
 *
 * CÁCH TEAMMATES THÊM TRANG MỚI:
 * 1. Tạo file trong pages/workspace/TenMoi.jsx
 * 2. Import ở đây
 * 3. Thêm <Route> bên trong <Route element={<WorkspaceLayout />}>
 * 4. Wrap bằng <WorkspaceRoleRoute> nếu cần giới hạn role
 * 5. Thêm entry vào MENU_CONFIG trong Sidebar.jsx
 */
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── PUBLIC ROUTES ──────────────────────── */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />

                {/* ── WORKSPACE SELECTOR ─────────────────── */}
                <Route path="/dashboard" element={
                    <RoleBasedRoute allowedRoles={[]} element={<Dashboard />} />
                } />

                {/* ── ONBOARDING ─────────────────────────── */}
                <Route path="/onboarding" element={
                    <RoleBasedRoute allowedRoles={[]} element={<TenantOnboarding />} />
                } />

                {/* ── WORKSPACE (trong kho) ──────────────── */}
                <Route path="/workspace/:workspaceId" element={<WorkspaceLayout />}>
                    {/* Default redirect → overview */}
                    <Route index element={<Navigate to="overview" replace />} />

                    {/* Tổng quan — tất cả role trừ STAFF */}
                    <Route path="overview" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'ACCOUNTANT', 'SALE']}>
                            <Overview />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Tổng quan Bán hàng (Sale Dashboard) — OWNER, MANAGER, SALE */}
                    <Route path="sale-dashboard" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'SALE']}>
                            <SaleDashboard />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Sản phẩm — OWNER, MANAGER */}
                    <Route path="products" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER']}>
                            <Products />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Kho & Vị trí — OWNER, MANAGER */}
                    <Route path="locations" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER']}>
                            <Locations />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Nhập / Xuất — OWNER, MANAGER, STAFF */}
                    <Route path="inventory" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                            <Inventory />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Kiểm kê — OWNER, MANAGER, STAFF */}
                    <Route path="stocktake" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
                            <Stocktake />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Tài chính — OWNER, ACCOUNTANT */}
                    <Route path="finance" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'ACCOUNTANT']}>
                            <Finance />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Báo cáo — OWNER, MANAGER, ACCOUNTANT */}
                    <Route path="reports" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'ACCOUNTANT']}>
                            <Reports />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Đơn hàng — OWNER, SALE */}
                    <Route path="orders" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'SALE']}>
                            <Orders />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Danh sách Đơn hàng bán (Sale) — OWNER, MANAGER, SALE */}
                    <Route path="sales" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'SALE', 'ACCOUNTANT']}>
                            <SalesOrderList />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Tạo Đơn hàng bán mới — OWNER, MANAGER, SALE */}
                    <Route path="sales/create" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'SALE']}>
                            <CreateSalesOrder />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Tra cứu Tồn kho khả dụng (ATP) — OWNER, MANAGER, SALE */}
                    <Route path="available-stock" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'SALE']}>
                            <AvailableStock />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Cập nhật Đơn hàng bán (Edit) — OWNER, MANAGER, SALE */}
                    <Route path="sales/edit/:orderId" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER', 'SALE']}>
                            <CreateSalesOrder />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Khách hàng — OWNER, SALE, ACCOUNTANT */}
                    <Route path="customers" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'SALE', 'ACCOUNTANT']}>
                            <Customers />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Phiếu công việc Staff — chỉ STAFF */}
                    <Route path="staff-tasks" element={
                        <WorkspaceRoleRoute allowedRoles={['STAFF']}>
                            <StaffTasks />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Xử lý phiếu nhập/xuất — STAFF */}
                    <Route path="voucher/:voucherId" element={
                        <WorkspaceRoleRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER']}>
                            <ProcessVoucher />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Chi tiết phiếu kiểm kê — STAFF */}
                    <Route path="stocktake/:ticketId" element={
                        <WorkspaceRoleRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER']}>
                            <StocktakeDetail />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Nhân sự — OWNER + MANAGER */}
                    <Route path="personnel" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER']}>
                            <Personnel />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Audit Log — chỉ OWNER */}
                    <Route path="audit-log" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER']}>
                            <AuditLog />
                        </WorkspaceRoleRoute>
                    } />

                    {/* Cài đặt — chỉ OWNER */}
                    <Route path="settings" element={
                        <WorkspaceRoleRoute allowedRoles={['OWNER']}>
                            <Settings />
                        </WorkspaceRoleRoute>
                    } />
                </Route>

                {/* ── SUPER ADMIN ────────────────────────── */}
                <Route path="/admin" element={
                    <RoleBasedRoute allowedRoles={['SUPER_ADMIN']} element={<AdminDashboard />} />
                } />

                {/* ── CATCH ALL ──────────────────────────── */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;