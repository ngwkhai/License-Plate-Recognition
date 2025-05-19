// import axios from 'axios';

// const API_URL = 'http://localhost:5000'; // backend API base URL

// // Axios instance với JWT Bearer token (giả sử lưu trong localStorage)
// const apiClient = axios.create({
//   baseURL: API_URL,
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//   },
// });

// export const getLatestPlates = async () => {
//   const res = await apiClient.get('/plates?limit=10&sort=desc');
//   return res.data;
// };

// export const searchPlates = async (filters) => {
//   const res = await apiClient.get('/plates', { params: filters });
//   return res.data;
// };

// src/api/plates.js

// src/api/plates.js
import {
  mockGetLatestPlates,
  mockSearchPlates,
  subscribePlates as mockSubscribePlates,
} from './mockService.js'; // import mock

// Hàm lấy danh sách biển số mới nhận diện
export const getLatestPlates = mockGetLatestPlates;

// Hàm tìm kiếm biển số
export const searchPlates = mockSearchPlates;

/**
 * Hàm chuyển danh sách plates sang dữ liệu biểu đồ (group theo timestamp và đếm)
 * @param {Array} plates - danh sách plates [{ plateNumber, timestamp }]
 * @returns {Array} - danh sách { timestamp, count }
 */
export const convertPlatesToStats = (plates) => {
  const countByTimestamp = {};

  plates.forEach((plate) => {
    const key = plate.timestamp.trim(); // tránh lỗi do khoảng trắng cuối
    countByTimestamp[key] = (countByTimestamp[key] || 0) + 1;
  });

  return Object.entries(countByTimestamp).map(([timestamp, count]) => ({
    timestamp,
    count,
  }));
};

/**
 * Hàm đăng ký nhận biển số mới realtime
 * @param {function} callback - hàm callback nhận newPlate khi có cập nhật
 * @returns {function} - hàm hủy đăng ký (unsubscribe)
 */
export const subscribePlates = (callback) => {
  return mockSubscribePlates(callback);
};
