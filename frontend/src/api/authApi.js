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
   * @param {String} idToken - Token nhận được từ Google
   */
  loginGoogle: (idToken) => {
    return axiosClient.post(`${AUTH_URL}/google-login`, { token: idToken });
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
   * @param {Object} data - { email, otpCode, newPassword }
   * Lưu ý: Tên hàm này khớp với logic Backend (verify-otp)
   */
  verifyOtpAndResetPassword: (data) => {
    return axiosClient.post(`${AUTH_URL}/verify-otp`, data);
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
    // Nếu muốn gọi API logout phía server thì uncomment dòng dưới
    // return axiosClient.post(`${AUTH_URL}/logout`);
  },
};

export default authApi;