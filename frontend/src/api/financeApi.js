import axiosClient from './axiosClient';

/**
 * financeApi.js — API client cho tính năng Tài chính & Công nợ
 */

/**
 * Lấy các chỉ số tài chính KPI cho dashboard
 * GET /api/v1/workspaces/{workspaceId}/finance/dashboard
 */
export const getDashboardMetrics = async (workspaceId) => {
    const response = await axiosClient.get(`/v1/workspaces/${workspaceId}/finance/dashboard`);
    return response.data;
};

/**
 * Lấy danh sách tất cả công nợ
 * GET /api/v1/workspaces/{workspaceId}/finance/debts
 */
export const getAllDebts = async (workspaceId) => {
    const response = await axiosClient.get(`/v1/workspaces/${workspaceId}/finance/debts`);
    return response.data;
};

/**
 * Lấy công nợ theo loại (PAYABLE hoặc RECEIVABLE)
 * GET /api/v1/workspaces/{workspaceId}/finance/debts/type/{type}
 */
export const getDebtsByType = async (workspaceId, type) => {
    const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/finance/debts/type/${type}`
    );
    return response.data;
};

/**
 * Tạo công nợ mới
 * POST /api/v1/workspaces/{workspaceId}/finance/debts
 */
export const createDebt = async (workspaceId, debtData) => {
    const response = await axiosClient.post(
        `/v1/workspaces/${workspaceId}/finance/debts`,
        debtData
    );
    return response.data;
};

/**
 * Cập nhật công nợ
 * PUT /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}
 */
export const updateDebt = async (workspaceId, debtId, debtData) => {
    const response = await axiosClient.put(
        `/v1/workspaces/${workspaceId}/finance/debts/${debtId}`,
        debtData
    );
    return response.data;
};

/**
 * Thanh toán công nợ
 * POST /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}/pay
 */
export const payDebt = async (workspaceId, debtId, amount) => {
    const response = await axiosClient.post(
        `/v1/workspaces/${workspaceId}/finance/debts/${debtId}/pay?amount=${amount}`
    );
    return response.data;
};

/**
 * Xóa công nợ (soft delete)
 * DELETE /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}
 */
export const deleteDebt = async (workspaceId, debtId) => {
    const response = await axiosClient.delete(
        `/v1/workspaces/${workspaceId}/finance/debts/${debtId}`
    );
    return response.data;
};

/**
 * Kiểm tra hạn mức tín dụng
 * POST /api/v1/workspaces/{workspaceId}/finance/check-credit-limit
 */
export const checkCreditLimit = async (workspaceId, partnerId, orderValue) => {
    const response = await axiosClient.post(
        `/v1/workspaces/${workspaceId}/finance/check-credit-limit`,
        {
            partnerId,
            orderValue,
        }
    );
    return response.data;
};

/**
 * Lấy báo cáo tài chính gần nhất
 * GET /api/v1/workspaces/{workspaceId}/finance/report/latest
 */
export const getLatestReport = async (workspaceId) => {
    const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/finance/report/latest`
    );
    return response.data;
};

/**
 * Tạo hoặc cập nhật báo cáo tài chính hôm nay
 * POST /api/v1/workspaces/{workspaceId}/finance/report/generate
 */
export const generateDailyReport = async (workspaceId) => {
    const response = await axiosClient.post(
        `/v1/workspaces/${workspaceId}/finance/report/generate`
    );
    return response.data;
};
