import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動加上 JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kanban-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器：處理通用錯誤
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 如果是 401 (未授權)，可以選擇清除本地 Token 並跳轉至登入頁
    if (error.response?.status === 401) {
      localStorage.removeItem('kanban-token');
      localStorage.removeItem('kanban-user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
