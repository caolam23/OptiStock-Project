import axiosClient from './axiosClient';

/**
 * stocktakeApi.js: API client cho module Kiểm kê kho
 * 
 * Base URL: /api/v1/workspaces/{workspaceId}/stocktakes
 */

const stocktakeApi = {
  /**
   * Lấy danh sách phiếu kiểm kê
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {object} filters - Bộ lọc { industryType, status }
   * @returns {Promise} Danh sách phiếu
   */
  getList(workspaceId, filters = {}) {
    return axiosClient.get(
      `/v1/workspaces/${workspaceId}/stocktakes`,
      { params: filters }
    );
  },

  /**
   * Lấy chi tiết phiếu kiểm kê
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} ticketId - ID của phiếu
   * @returns {Promise} Chi tiết phiếu với danh sách sản phẩm
   */
  getById(workspaceId, ticketId) {
    return axiosClient.get(
      `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}`
    );
  },

  /**
   * Tạo phiếu kiểm kê mới
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {object} data - Dữ liệu phiếu {title, industryType, locationId, locationName, assignedTo}
   * @returns {Promise} Phiếu vừa tạo
   */
  create(workspaceId, data) {
    return axiosClient.post(
      `/v1/workspaces/${workspaceId}/stocktakes`,
      data
    );
  },

  /**
   * Cập nhật số đếm cho một sản phẩm
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} ticketId - ID của phiếu
   * @param {string} productId - ID của sản phẩm
   * @param {number} actualQty - Số lượng thực tế đếm được
   * @returns {Promise} Phiếu sau khi cập nhật
   */
  updateItemCount(workspaceId, ticketId, productId, actualQty) {
    return axiosClient.put(
      `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/items/${productId}`,
      { actualQty }
    );
  },

  /**
   * Gửi phiếu duyệt (COUNTING → REVIEWING)
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} ticketId - ID của phiếu
   * @returns {Promise} Phiếu sau khi gửi
   */
  submitForReview(workspaceId, ticketId) {
    return axiosClient.put(
      `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/submit`
    );
  },

  /**
   * Duyệt phiếu (REVIEWING → COMPLETED)
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} ticketId - ID của phiếu
   * @returns {Promise} Phiếu sau khi duyệt
   */
  approve(workspaceId, ticketId) {
    return axiosClient.put(
      `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/approve`
    );
  },

  /**
   * Lấy danh sách phiếu theo ngành hàng
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} industryType - ELECTRONICS hoặc GROCERY
   * @returns {Promise} Danh sách phiếu
   */
  getByIndustry(workspaceId, industryType) {
    return axiosClient.get(
      `/v1/workspaces/${workspaceId}/stocktakes`,
      { params: { industryType } }
    );
  },

  /**
   * Lấy danh sách phiếu theo trạng thái
   * 
   * @param {string} workspaceId - ID của kho hàng
   * @param {string} status - PENDING, COUNTING, REVIEWING, COMPLETED
   * @returns {Promise} Danh sách phiếu
   */
  getByStatus(workspaceId, status) {
    return axiosClient.get(
      `/v1/workspaces/${workspaceId}/stocktakes`,
      { params: { status } }
    );
  },
};

export default stocktakeApi;
