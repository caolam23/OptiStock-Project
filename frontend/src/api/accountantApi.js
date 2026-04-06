import axiosClient from './axiosClient';

/**
 * Accountant API endpoints
 * 
 * Note: axiosClient has baseURL='http://localhost:8080/api'
 * So we only need to append the path starting from /v1/...
 */
const accountantApi = {
    /**
     * Lấy dữ liệu tổng quan tài chính cho Accountant Dashboard
     * @param {string} workspaceId - ID của workspace
     * @returns {Promise} Dashboard summary data
     */
    getDashboardSummary: async (workspaceId) => {
        try {
            const url = `/v1/workspaces/${workspaceId}/accountant/dashboard-summary`;
            console.log(`[AccountantAPI] GET ${url}`);
            
            const response = await axiosClient.get(url);
            
            console.log(`[AccountantAPI] Response received:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[AccountantAPI] Error fetching dashboard summary:`, error);
            
            if (error.response) {
                console.error(`[AccountantAPI] Status: ${error.response.status}`);
                console.error(`[AccountantAPI] Data:`, error.response.data);
            }
            
            throw error;
        }
    },

    /**
     * Kiểm tra health của API
     * @param {string} workspaceId - ID của workspace
     * @returns {Promise} Health status
     */
    healthCheck: async (workspaceId) => {
        try {
            const url = `/v1/workspaces/${workspaceId}/accountant/health`;
            console.log(`[AccountantAPI] GET ${url}`);
            
            const response = await axiosClient.get(url);
            
            console.log(`[AccountantAPI] Health check response:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[AccountantAPI] Error checking health:`, error);
            throw error;
        }
    },
};

export default accountantApi;
