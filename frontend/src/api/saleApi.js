import axiosClient from './axiosClient'; // Thay đổi đường dẫn này nếu file axios config của bạn nằm ở chỗ khác

const saleApi = {
  // 1. Lấy thông tin Tồn kho khả dụng (ATP) và giá bán
  getProductAvailability: (productId) => {
    // KHI NÀO BACKEND XONG, HÃY MỞ COMMENT DÒNG DƯỚI VÀ XÓA KHỐI MOCK Ở TRÊN:
    return axiosClient.get(`/v1/sale/products/${productId}/availability`);
  },

  // Lấy TẤT CẢ thông tin Tồn kho khả dụng (Cho trang Available Stock)
  getAllProductsAvailability: () => {
    return axiosClient.get('/v1/sale/products/availability');
  },

  // 2. Tạo đơn hàng mới
  createSalesOrder: (orderData) => {
    return axiosClient.post('/v1/sale/orders', orderData);
  },

  // 3. Lấy danh sách đơn hàng đã bán
  getSalesOrders: () => {
    return axiosClient.get('/v1/sale/orders');
  },

  // 4. Cập nhật trạng thái đơn hàng
  updateOrderStatus: (id, status) => {
    return axiosClient.patch(`/v1/sale/orders/${id}/status`, { status });
  },

  // 5. Cập nhật lại toàn bộ thông tin đơn hàng
  updateOrderDetails: (id, data) => {
    return axiosClient.put(`/v1/sale/orders/${id}`, data);
  },

  // 6. Lấy thống kê cho trang Sale Dashboard
  getSaleDashboardStats: () => {
    return axiosClient.get('/v1/sale/dashboard/stats');
  }
};

export default saleApi;