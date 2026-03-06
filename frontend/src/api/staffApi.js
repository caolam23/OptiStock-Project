import axiosClient from './axiosClient';

const BASE = '/v1/staff';

// ══════════════════════════════════════════
// VOUCHER APIs (Nhập / Xuất kho)
// ══════════════════════════════════════════

/** Dashboard cột 1: Phiếu Nhập đang chờ */
export const getPendingInbound = () =>
    axiosClient.get(`${BASE}/vouchers/pending/inbound`);

/** Dashboard cột 2: Phiếu Xuất đang chờ */
export const getPendingOutbound = () =>
    axiosClient.get(`${BASE}/vouchers/pending/outbound`);

/** Chi tiết 1 phiếu nhập/xuất */
export const getVoucher = (voucherId) =>
    axiosClient.get(`${BASE}/vouchers/${voucherId}`);

/** Bắt đầu xử lý phiếu: PENDING → PROCESSING */
export const startVoucher = (voucherId) =>
    axiosClient.put(`${BASE}/vouchers/${voucherId}/start`);

/** Quét barcode để tăng số lượng */
export const scanBarcode = (voucherId, barcode) =>
    axiosClient.put(`${BASE}/vouchers/${voucherId}/scan`, { barcode });

/** Nhập thủ công số lượng cho 1 item */
export const updateVoucherItem = (voucherId, productCode, actualQuantity) =>
    axiosClient.put(`${BASE}/vouchers/${voucherId}/update-item`, {
        productCode,
        quantity: actualQuantity,   // backend expects 'quantity'
    });

/** Hoàn tất phiếu: PROCESSING → COMPLETED (cập nhật tồn kho) */
export const completeVoucher = (voucherId) =>
    axiosClient.put(`${BASE}/vouchers/${voucherId}/complete`);

// ══════════════════════════════════════════
// STOCKTAKE APIs (Kiểm kê)
// ══════════════════════════════════════════

/** Dashboard cột 3: Phiếu Kiểm kê đang chờ */
export const getPendingStocktakes = () =>
    axiosClient.get(`${BASE}/stocktakes/pending`);

/** Chi tiết 1 phiếu kiểm kê (items không có systemQuantity) */
export const getStocktakeTicket = (ticketId) =>
    axiosClient.get(`${BASE}/stocktakes/${ticketId}`);

/** Bắt đầu kiểm kê: PENDING → IN_PROGRESS */
export const startStocktake = (ticketId) =>
    axiosClient.put(`${BASE}/stocktakes/${ticketId}/start`);

/** Nhập số lượng thực tế cho 1 sản phẩm */
export const updateCount = (ticketId, productCode, actualCount) =>
    axiosClient.put(`${BASE}/stocktakes/${ticketId}/count`, {
        productCode,
        actualCount,
    });

/** Gửi báo cáo kiểm kê: IN_PROGRESS → SUBMITTED */
export const submitStocktake = (ticketId) =>
    axiosClient.put(`${BASE}/stocktakes/${ticketId}/submit`);
