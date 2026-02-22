import axiosClient from './axiosClient';

const adminApi = {
  // ===== SUPER ADMIN — /admin/system/** =====

  // Lấy danh sách tất cả công ty
  getAllTenants: () => {
    return axiosClient.get('/admin/system/tenants');
  },

  // Lấy chi tiết 1 công ty
  getTenant: (id) => {
    return axiosClient.get(`/admin/system/tenants/${id}`);
  },

  // Khóa công ty
  lockTenant: (tenantId) => {
    return axiosClient.post(`/admin/system/tenants/${tenantId}/lock`);
  },

  // Mở khóa công ty
  unlockTenant: (tenantId) => {
    return axiosClient.post(`/admin/system/tenants/${tenantId}/unlock`);
  },

  // Gia hạn dịch vụ
  renewSubscription: (tenantId, days) => {
    return axiosClient.post(`/admin/system/tenants/${tenantId}/renew`, null, {
      params: { days: parseInt(days) }
    });
  },

  // Lấy danh sách tất cả người dùng
  getAllUsers: () => {
    return axiosClient.get('/admin/system/users');
  },

  // Vô hiệu hóa người dùng
  deactivateUser: (userId) => {
    return axiosClient.post(`/admin/system/users/${userId}/deactivate`);
  },

  // Kích hoạt người dùng
  activateUser: (userId) => {
    return axiosClient.post(`/admin/system/users/${userId}/activate`);
  },

  // Xóa người dùng
  deleteUser: (userId) => {
    return axiosClient.delete(`/admin/system/users/${userId}`);
  },

  // ===== TENANT ADMIN/MANAGER — /admin/tenant/** =====
  // Cần header X-Tenant-Id được gửi tự động qua axiosClient interceptor

  // Lấy thông tin kho của chính mình
  getMyTenant: (tenantId) => {
    return axiosClient.get('/admin/tenant/info', {
      headers: { 'X-Tenant-Id': tenantId }
    });
  },

  // Lấy danh sách member trong kho
  getTenantUsers: (tenantId) => {
    return axiosClient.get('/admin/tenant/users', {
      headers: { 'X-Tenant-Id': tenantId }
    });
  },

  // Mời member mới vào kho
  inviteUser: (tenantId, data) => {
    return axiosClient.post('/admin/tenant/users/invite', data, {
      headers: { 'X-Tenant-Id': tenantId }
    });
  },

  // Đổi role của member
  assignRole: (tenantId, userId, role) => {
    return axiosClient.patch(`/admin/tenant/users/${userId}/role`, { role }, {
      headers: { 'X-Tenant-Id': tenantId }
    });
  },

  // Xóa member khỏi kho
  removeMember: (tenantId, userId) => {
    return axiosClient.delete(`/admin/tenant/users/${userId}`, {
      headers: { 'X-Tenant-Id': tenantId }
    });
  },
};

export default adminApi;