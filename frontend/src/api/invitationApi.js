import axios from 'axios';
import axiosClient from './axiosClient';

const BASE_URL = 'http://localhost:8080/api';

// Public axios (không cần JWT) dùng cho endpoint /info
const publicAxios = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

const invitationApi = {
    /**
     * Lấy thông tin lời mời theo code — PUBLIC (không cần đăng nhập)
     * GET /v1/invitations/info?code=xxx
     */
    getInvitationInfo: (code) =>
        publicAxios.get(`/v1/invitations/info`, { params: { code } }),

    /**
     * Chấp nhận lời mời — AUTHENTICATED (cần Bearer token)
     * POST /v1/invitations/accept
     */
    acceptInvitation: (invitationCode) =>
        axiosClient.post('/v1/invitations/accept', { invitationCode }),

    /**
     * Từ chối lời mời — AUTHENTICATED (cần Bearer token)
     * POST /v1/invitations/reject
     */
    rejectInvitation: (invitationCode) =>
        axiosClient.post('/v1/invitations/reject', { invitationCode }),
};

export default invitationApi;
