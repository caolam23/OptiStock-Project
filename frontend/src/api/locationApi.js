/**
 * locationApi.js - API calls cho quản lý Sơ đồ Kho (Warehouse Topology)
 */
import axiosClient from './axiosClient';

/**
 * Lấy sơ đồ kho dạng cây
 * @param {string} tenantId - ID workspace
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @returns {Promise<{success, data, industryType}>}
 */
export const getLocationTree = (tenantId, industryType = 'ELECTRONICS') => {
    return axiosClient.get(
        `/v1/workspaces/${tenantId}/locations/tree`,
        { params: { industryType } }
    )
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy sơ đồ kho:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Lấy danh sách Location theo industryType (flat list)
 * @param {string} tenantId - ID workspace
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @returns {Promise<{success, data, count}>}
 */
export const getLocations = (tenantId, industryType = 'ELECTRONICS') => {
    return axiosClient.get(
        `/v1/workspaces/${tenantId}/locations`,
        { params: { industryType } }
    )
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy danh sách locations:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Lấy chi tiết Location theo ID
 * @param {string} tenantId - ID workspace
 * @param {string} locationId - ID location
 * @returns {Promise<{success, data}>}
 */
export const getLocationById = (tenantId, locationId) => {
    return axiosClient.get(`/v1/workspaces/${tenantId}/locations/${locationId}`)
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy chi tiết location:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Lấy Location theo Code (dùng cho barcode scan)
 * @param {string} tenantId - ID workspace
 * @param {string} code - Location code (VD: ZONE-A, RACK-1)
 * @returns {Promise<{success, data, message}>}
 */
export const getLocationByCode = (tenantId, code) => {
    if (!code || code.trim().length === 0) {
        return Promise.resolve(null);
    }
    return axiosClient.get(`/v1/workspaces/${tenantId}/locations/code/${encodeURIComponent(code.trim())}`)
        .then(response => response.data)
        .catch(error => {
            console.error('⚠️ [API] Location not found:', code);
            return null; // Return null khi không tìm thấy
        });
};

/**
 * Lấy danh sách Location con theo parentId
 * @param {string} tenantId - ID workspace
 * @param {string} parentId - ID location cha
 * @returns {Promise<{success, data, count}>}
 */
export const getChildLocations = (tenantId, parentId) => {
    return axiosClient.get(`/v1/workspaces/${tenantId}/locations/${parentId}/children`)
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy location con:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Tạo Location mới
 * @param {string} tenantId - ID workspace
 * @param {Object} location - Dữ liệu location
 * @returns {Promise<{success, data, message}>}
 */
export const createLocation = (tenantId, location) => {
    return axiosClient.post(
        `/v1/workspaces/${tenantId}/locations`,
        location
    )
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi tạo location:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Cập nhật Location
 * @param {string} tenantId - ID workspace
 * @param {string} locationId - ID location
 * @param {Object} updates - Dữ liệu cập nhật
 * @returns {Promise<{success, data, message}>}
 */
export const updateLocation = (tenantId, locationId, updates) => {
    return axiosClient.put(
        `/v1/workspaces/${tenantId}/locations/${locationId}`,
        updates
    )
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi cập nhật location:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Xóa Location
 * @param {string} tenantId - ID workspace
 * @param {string} locationId - ID location
 * @returns {Promise<{success, message}>}
 */
export const deleteLocation = (tenantId, locationId) => {
    return axiosClient.delete(`/v1/workspaces/${tenantId}/locations/${locationId}`)
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi xóa location:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Lấy danh sách Location BIN (leaf nodes)
 * Dùng cho TreeSelect trong CreateVoucherModal
 * @param {string} tenantId - ID workspace
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @returns {Promise<{success, data, count}>}
 */
export const getBinLocations = (tenantId, industryType = 'ELECTRONICS') => {
    return axiosClient.get(
        `/v1/workspaces/${tenantId}/locations/bins/list`,
        { params: { industryType } }
    )
        .then(response => response.data)
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy danh sách BIN:', error.response?.data || error.message);
            throw error;
        });
};
