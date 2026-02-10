import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Ưu tiên lấy từ Cookie để đồng bộ với Middleware
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// THÊM ĐOẠN NÀY: Tự động bóc vỏ dữ liệu từ Axios
api.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp phần body từ server (JSON bạn thấy ở Postman)
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
