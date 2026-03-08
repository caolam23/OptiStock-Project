/**
 * managerApi.js — API calls cho role MANAGER.
 */
import axiosClient from './axiosClient';

const h = (workspaceId) => ({ headers: { 'X-Workspace-Id': workspaceId } });

// ── Phiếu nhập/xuất ──────────────────────────────────────────
export const getAllVouchers = (wid) =>
    axiosClient.get('/v1/manager/vouchers', h(wid)).then(r => r.data);

export const getVoucher = (wid, id) =>
    axiosClient.get(`/v1/manager/vouchers/${id}`, h(wid)).then(r => r.data);

/**
 * Tạo phiếu nhập/xuất mới.
 * @param {string} wid - workspaceId
 * @param {{ type, title, priority, destination, notes, items[] }} data
 */
export const createVoucher = (wid, data) =>
    axiosClient.post('/v1/manager/vouchers', data, h(wid)).then(r => r.data);

// ── Phiếu kiểm kê ────────────────────────────────────────────
export const getAllStocktakes = (wid) =>
    axiosClient.get('/v1/manager/stocktakes', h(wid)).then(r => r.data);

export const getStocktake = (wid, id) =>
    axiosClient.get(`/v1/manager/stocktakes/${id}`, h(wid)).then(r => r.data);

// ── Nhân sự (Personnel) ───────────────────────────────────────
export const getMembers = (tenantId) =>
    axiosClient.get(`/v1/workspaces/${tenantId}/personnel/members`).then(r => r.data);

export const getPendingInvitations = (tenantId) =>
    axiosClient.get(`/v1/workspaces/${tenantId}/personnel/invitations`).then(r => r.data);

export const sendInvitation = (tenantId, email, role) =>
    axiosClient.post(`/v1/workspaces/${tenantId}/personnel/invitations`, { email, role }).then(r => r.data);

export const updateMemberRole = (tenantId, targetUserId, role) =>
    axiosClient.put(`/v1/workspaces/${tenantId}/personnel/members/${targetUserId}`, { role }).then(r => r.data);

export const removeMember = (tenantId, targetUserId) =>
    axiosClient.delete(`/v1/workspaces/${tenantId}/personnel/members/${targetUserId}`).then(r => r.data);

export const cancelInvitation = (tenantId, inviteId) =>
    axiosClient.delete(`/v1/workspaces/${tenantId}/personnel/invitations/${inviteId}`).then(r => r.data);
