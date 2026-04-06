import axiosClient from './axiosClient';

/**
 * reportApi.js: API client cho module Reports
 * 
 * Base: /v1/workspaces/{tenantId}/reports
 */

const reportApi = {
  /**
   * Lấy giá trị tồn kho theo danh mục
   * @param {string} tenantId - Workspace ID
   * @param {string} industryType - ELECTRONICS | GROCERY
   * @returns {Promise} {data: [...], total: number, status: 'SUCCESS'}
   */
  getInventoryValuation: (tenantId, industryType = 'ELECTRONICS') =>
    axiosClient.get(
      `/v1/workspaces/${tenantId}/reports/inventory-valuation`,
      { params: { industryType } }
    ).then(r => r.data),

  /**
   * Lấy danh sách SKU phân loại ABC
   * @param {string} tenantId
   * @param {string} industryType
   * @returns {Promise} {data: [{productCode, productName, value, classification, cumulativePercentage}, ...]}
   */
  getAbcAnalysis: (tenantId, industryType = 'ELECTRONICS') =>
    axiosClient.get(
      `/v1/workspaces/${tenantId}/reports/abc-analysis`,
      { params: { industryType } }
    ).then(r => r.data),

  /**
   * Lấy tóm tắt ABC (count + value + percentage)
   * @param {string} tenantId
   * @param {string} industryType
   * @returns {Promise} {data: {classA: {...}, classB: {...}, classC: {...}, totalValue: number}}
   */
  getAbcSummary: (tenantId, industryType = 'ELECTRONICS') =>
    axiosClient.get(
      `/v1/workspaces/${tenantId}/reports/abc-summary`,
      { params: { industryType } }
    ).then(r => r.data),

  /**
   * Lấy báo cáo lô hàng sắp hết hạn (GROCERY)
   * @param {string} tenantId
   * @returns {Promise} {data: [{productCode, productName, batchCode, expiryDate, quantity, status, daysRemaining}, ...]}
   */
  getExpiryReport: (tenantId) =>
    axiosClient.get(
      `/v1/workspaces/${tenantId}/reports/expiry-report`
    ).then(r => r.data),

  /**
   * Lấy báo cáo dead stock (ELECTRONICS)
   * @param {string} tenantId
   * @returns {Promise} {data: [{productCode, productName, sku, createdAt, lastSalesDate, daysInStock, daysStockWarning}, ...]}
   */
  getDeadstockReport: (tenantId) =>
    axiosClient.get(
      `/v1/workspaces/${tenantId}/reports/deadstock-report`
    ).then(r => r.data),

  /**
   * Export report to CSV
   * @param {string} tenantId
   * @param {string} reportType - inventory | abc | expiry | deadstock
   * @param {Array} data - Dữ liệu cần export
   * @returns {Blob} CSV file
   */
  exportToCsv: (reportType, data) => {
    if (!data || data.length === 0) {
      console.warn('⚠️ No data to export');
      return;
    }

    // Lấy headers từ key của object đầu tiên
    const headers = Object.keys(data[0]);
    const rows = [headers];

    // Transform data thành rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Escape quote và wrap string nếu có comma
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      rows.push(row);
    });

    // Tạo CSV content
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download file
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default reportApi;
