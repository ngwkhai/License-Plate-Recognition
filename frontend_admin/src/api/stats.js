// import axios from 'axios';

// const API_URL = 'http://localhost:5000';

// const apiClient = axios.create({
//   baseURL: API_URL,
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//   },
// });

// export const getStats = async () => {
//   const res = await apiClient.get('/stats');
//   return res.data;
// };
// src/api/stats.js

import { mockGetStats } from './mockService.js';

export const getStats = mockGetStats;
