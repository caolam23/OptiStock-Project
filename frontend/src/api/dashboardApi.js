import axiosClient from './axiosClient';

/**
 * DashboardApi - API calls for Dashboard
 * 
 * Tất cả requests được gắn header: X-Workspace-Id (tự động từ axiosClient)
 */

const dashboardApi = {
  /**
   * Lấy dữ liệu tổng quan (Summary)
   * GET /api/v1/workspaces/{tenantId}/dashboard/summary
   */
  getSummary: (workspaceId) => {
    return axiosClient.get(`/v1/workspaces/${workspaceId}/dashboard/summary`);
  },

  /**
   * Lấy danh sách cảnh báo (Low Stock + Expiring Batches)
   * GET /api/v1/workspaces/{tenantId}/dashboard/alerts
   */
  getAlerts: (workspaceId) => {
    return axiosClient.get(`/v1/workspaces/${workspaceId}/dashboard/alerts`);
  },

  /**
   * Lấy dữ liệu biểu đồ (7-day chart + Category breakdown)
   * GET /api/v1/workspaces/{tenantId}/dashboard/charts
   */
  getCharts: (workspaceId) => {
    return axiosClient.get(`/v1/workspaces/${workspaceId}/dashboard/charts`);
  },

  /**
   * Lấy tất cả dữ liệu Dashboard 1 lần
   * GET /api/v1/workspaces/{tenantId}/dashboard
   * (Recommended: thay vì 3 requests riêng lẻ)
   */
  getDashboard: (workspaceId) => {
    return axiosClient.get(`/v1/workspaces/${workspaceId}/dashboard`);
  },
};

export default dashboardApi;
