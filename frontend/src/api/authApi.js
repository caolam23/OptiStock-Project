import axiosClient from "./axiosClient";

// Định nghĩa URL prefix cho các API Auth
const AUTH_URL = "/auth";

const authApi = {
  /**
   * 1. Đăng ký tài khoản
   * @param {Object} data - { email, password, fullName, phoneNumber }
   */
  register: (data) => {
    return axiosClient.post(`${AUTH_URL}/register`, data);
  },

  /**
   * 2. Đăng nhập thường
   * @param {Object} data - { email, password }
   */
  login: (data) => {
    return axiosClient.post(`${AUTH_URL}/login`, data);
  },

  /**
   * 3. Đăng nhập Google (SSO)
   * @param {String} accessToken - Token nhận được từ Google (qua hook useGoogleLogin)
   * Backend sẽ dùng token này để gọi Google API lấy thông tin user.
   */
  loginGoogle: (accessToken) => {
    // Backend đang chờ body là: { "token": "..." }
    return axiosClient.post(`${AUTH_URL}/google-login`, { token: accessToken });
  },

  /**
   * 4. Quên mật khẩu - Bước 1: Gửi OTP
   * @param {String} email
   */
  forgotPassword: (email) => {
    return axiosClient.post(`${AUTH_URL}/forgot-password`, { email });
  },

  /**
   * 5. Quên mật khẩu - Bước 2: Xác thực OTP và Đổi mật khẩu
   * @param {Object} data - { email, otp, newPassword, confirmPassword }
   */
  resetPassword: (data) => {
    return axiosClient.post(`${AUTH_URL}/reset-password`, data);
  },

  /**
   * 6. Refresh Token (Dùng khi Access Token hết hạn)
   * @param {String} refreshToken 
   */
  refreshToken: (refreshToken) => {
    return axiosClient.post(`${AUTH_URL}/refresh-token`, { refreshToken });
  },

  /**
   * 7. Đăng xuất
   * Xóa toàn bộ token trong LocalStorage
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

export default authApi;