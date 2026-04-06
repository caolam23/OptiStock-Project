import axios from 'axios';

/**
 * reportsApi.js - API client cho Reports & Analytics
 * Mock data + real API integration
 */

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1/workspaces',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add authorization token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Lấy báo cáo Dead Stock từ Backend
 * GET /api/v1/workspaces/{workspaceId}/reports/dead-stock?days=90
 */
export const fetchDeadStockData = async (workspaceId, days = 90) => {
    try {
        const response = await apiClient.get(`/${workspaceId}/reports/dead-stock`, {
            params: { days },
        });
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching dead stock data:', error);
        // Return mock data for demo
        return getMockDeadStockData();
    }
};

/**
 * Lấy phân tích ABC từ Backend
 * GET /api/v1/workspaces/{workspaceId}/reports/abc-analysis
 */
export const fetchABCAnalysisData = async (workspaceId) => {
    try {
        const response = await apiClient.get(`/${workspaceId}/reports/abc-analysis`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching ABC analysis data:', error);
        // Return mock data for demo
        return getMockABCAnalysisData();
    }
};

/**
 * Xuất Dead Stock ra Excel
 * GET /api/v1/workspaces/{workspaceId}/reports/export/dead-stock
 */
export const downloadDeadStockExcel = async (workspaceId, days = 90) => {
    try {
        const response = await apiClient.get(`/${workspaceId}/reports/export/dead-stock`, {
            params: { days },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dead-stock-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading dead stock Excel:', error);
        throw error;
    }
};

/**
 * Xuất ABC Analysis ra Excel
 * GET /api/v1/workspaces/{workspaceId}/reports/export/abc-analysis
 */
export const downloadABCAnalysisExcel = async (workspaceId) => {
    try {
        const response = await apiClient.get(`/${workspaceId}/reports/export/abc-analysis`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `abc-analysis-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading ABC analysis Excel:', error);
        throw error;
    }
};

// ============================================================
// MOCK DATA (cho demo trước khi Backend live)
// ============================================================

function getMockDeadStockData() {
    return [
        {
            productId: 'PROD_001',
            productName: 'iPhone 13 Pro Max 256GB',
            productCode: 'A001',
            daysSinceLastSale: 125,
            stockQuantity: 5,
            costPrice: 18000000,
            totalValue: 90000000,
            category: 'Electronics',
            condition: 'New',
        },
        {
            productId: 'PROD_002',
            productName: 'Samsung Galaxy S21 Ultra',
            productCode: 'A002',
            daysSinceLastSale: 95,
            stockQuantity: 3,
            costPrice: 12000000,
            totalValue: 36000000,
            category: 'Electronics',
            condition: 'Like New',
        },
        {
            productId: 'PROD_003',
            productName: 'iPad Pro 12.9 M1',
            productCode: 'A003',
            daysSinceLastSale: 110,
            stockQuantity: 2,
            costPrice: 15000000,
            totalValue: 30000000,
            category: 'Tablets',
            condition: 'New',
        },
        {
            productId: 'PROD_004',
            productName: 'MacBook Air M2',
            productCode: 'A004',
            daysSinceLastSale: 140,
            stockQuantity: 1,
            costPrice: 25000000,
            totalValue: 25000000,
            category: 'Laptops',
            condition: 'New',
        },
        {
            productId: 'PROD_005',
            productName: 'Apple Watch Series 8',
            productCode: 'A005',
            daysSinceLastSale: 92,
            stockQuantity: 8,
            costPrice: 3000000,
            totalValue: 24000000,
            category: 'Wearables',
            condition: 'New',
        },
    ];
}

function getMockABCAnalysisData() {
    return [
        {
            productId: 'PROD_001',
            productName: 'iPhone 13 Pro Max 256GB',
            productCode: 'A001',
            category: 'A',
            totalRevenue: 1500000000,
            quantitySold: 80,
            price: 18750000,
            productCategory: 'Electronics',
            cumulativePercentage: 22.5,
        },
        {
            productId: 'PROD_002',
            productName: 'Samsung Galaxy S21 Ultra',
            productCode: 'A002',
            category: 'A',
            totalRevenue: 1200000000,
            quantitySold: 100,
            price: 12000000,
            productCategory: 'Electronics',
            cumulativePercentage: 40.5,
        },
        {
            productId: 'PROD_003',
            productName: 'iPad Pro 12.9 M1',
            productCode: 'A003',
            category: 'A',
            totalRevenue: 900000000,
            quantitySold: 60,
            price: 15000000,
            productCategory: 'Tablets',
            cumulativePercentage: 55.0,
        },
        {
            productId: 'PROD_006',
            productName: 'AirPods Pro',
            productCode: 'A006',
            category: 'B',
            totalRevenue: 500000000,
            quantitySold: 250,
            price: 2000000,
            productCategory: 'Accessories',
            cumulativePercentage: 72.5,
        },
        {
            productId: 'PROD_007',
            productName: 'Apple Lightning Cable',
            productCode: 'A007',
            category: 'B',
            totalRevenue: 250000000,
            quantitySold: 5000,
            price: 50000,
            productCategory: 'Accessories',
            cumulativePercentage: 81.25,
        },
        {
            productId: 'PROD_008',
            productName: 'USB-C Hub',
            productCode: 'A008',
            category: 'C',
            totalRevenue: 80000000,
            quantitySold: 800,
            price: 100000,
            productCategory: 'Accessories',
            cumulativePercentage: 93.5,
        },
        {
            productId: 'PROD_009',
            productName: 'Screen Protector',
            productCode: 'A009',
            category: 'C',
            totalRevenue: 50000000,
            quantitySold: 5000,
            price: 10000,
            productCategory: 'Accessories',
            cumulativePercentage: 98.0,
        },
    ];
}

export function getMockOverviewChartData() {
    return [
        {
            month: 'Tháng 10',
            inbound: 50000000,
            outbound: 45000000,
            stock: 5000000,
        },
        {
            month: 'Tháng 11',
            inbound: 60000000,
            outbound: 55000000,
            stock: 10000000,
        },
        {
            month: 'Tháng 12',
            inbound: 55000000,
            outbound: 60000000,
            stock: 5000000,
        },
        {
            month: 'Tháng 1',
            inbound: 70000000,
            outbound: 65000000,
            stock: 10000000,
        },
        {
            month: 'Tháng 2',
            inbound: 65000000,
            outbound: 70000000,
            stock: 5000000,
        },
        {
            month: 'Tháng 3',
            inbound: 80000000,
            outbound: 75000000,
            stock: 10000000,
        },
    ];
}
