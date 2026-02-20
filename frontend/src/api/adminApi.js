import axiosClient from './axiosClient';

const adminApi = {
  // Lấy danh sách tất cả công ty (Super Admin)
  getAllTenants: () => {
    return axiosClient.get('/admin/tenants');
  },

  // Lấy danh sách tất cả người dùng (Super Admin)
  getAllUsers: () => {
    return axiosClient.get('/admin/users');
  },

  // Lấy thông tin công ty của chính mình (Tenant Admin)
  getMyTenant: () => {
    return axiosClient.get('/admin/my-tenant');
  },

  // Khóa công ty
  lockTenant: (tenantId) => {
    return axiosClient.post(`/admin/tenants/${tenantId}/lock`);
  },

  // Mở khóa công ty
  unlockTenant: (tenantId) => {
    return axiosClient.post(`/admin/tenants/${tenantId}/unlock`);
  },

  // Gia hạn dịch vụ
  renewSubscription: (tenantId, days) => {
    return axiosClient.post(`/admin/tenants/${tenantId}/renew`, null, {
      params: { days: parseInt(days) }
    });
  },

  // Vô hiệu hóa người dùng
  deactivateUser: (userId) => {
    return axiosClient.post(`/admin/users/${userId}/deactivate`);
  },

  // Kích hoạt người dùng
  activateUser: (userId) => {
    return axiosClient.post(`/admin/users/${userId}/activate`);
  },

  // Xóa người dùng
  deleteUser: (userId) => {
    return axiosClient.delete(`/admin/users/${userId}`);
  }
};

export default adminApi;