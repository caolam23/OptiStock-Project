import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
    function (config) {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ Tự động gắn X-Workspace-Id header
        // Teammates KHÔNG cần gắn thủ công — axiosClient lo hết
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            if (workspace?.id) {
                config.headers['X-Workspace-Id'] = workspace.id;
            }
        } catch (_) {
            // Không có workspace context → bỏ qua (API auth/onboarding không cần)
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response && error.response.status === 401) {
             const requestUrl = error.config?.url || '';
            const isAuthEndpoint = requestUrl.includes('/api/auth/');
            const isAlreadyOnLogin = window.location.pathname === '/login';

            // Chỉ redirect về /login nếu:
            // 1. Chưa đang ở trang /login (tránh vòng lặp)
            // 2. Không phải request từ endpoint auth (tránh xóa token khi login sai mật khẩu)
            if (!isAlreadyOnLogin && !isAuthEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('currentWorkspace');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
