import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Nhớ kiểm tra Backend chạy port 8080 chưa
    headers: {
        'Content-Type': 'application/json',
    },
});

// Xử lý dữ liệu trả về cho gọn
axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        console.error("Lỗi gọi API:", error);
        throw error;
    }
);

export default axiosClient;