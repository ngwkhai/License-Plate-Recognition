import axios from "axios";

const API_URL = "http://localhost:8001/admin";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hàm API giữ nguyên như bạn viết
export const getAdminLookupLogs = async (limit = 100) => {
  try {
    const res = await apiClient.get("/lookup_logs", {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Bạn không có quyền hoặc chưa đăng nhập");
    }
    throw error;
  }
};

export const getAdminUsers = async (limit = 100) => {
  try {
    const res = await apiClient.get("/users", { params: { limit } });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Bạn không có quyền hoặc chưa đăng nhập");
    }
    throw error;
  }
};

export const getLookupStats = async () => {
  try {
    const res = await apiClient.get("/lookup_stats");
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu thống kê lookup", error);
    throw error;
  }
};

export const getLookupCountToday = async () => {
  try {
    const res = await apiClient.get("/lookup_count_today");
    return res.data.count_today;
  } catch (error) {
    console.error("Lỗi lấy tổng số biển số tra cứu trong ngày", error);
    throw error;
  }
};
