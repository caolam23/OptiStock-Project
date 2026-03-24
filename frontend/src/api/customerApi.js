import axiosClient from './axiosClient';

const customerApi = {
  // Lấy danh sách khách hàng
  getCustomers: () => {
    return axiosClient.get('/v1/customers');
  },

  // Tạo mới khách hàng
  createCustomer: (customerData) => {
    return axiosClient.post('/v1/customers', customerData);
  },

  // Cập nhật khách hàng
  updateCustomer: (id, customerData) => {
    return axiosClient.put(`/v1/customers/${id}`, customerData);
  },

  // Xóa khách hàng
  deleteCustomer: (id) => {
    return axiosClient.delete(`/v1/customers/${id}`);
  }
};

export default customerApi;