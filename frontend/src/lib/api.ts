import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learning_center_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? 'Không thể kết nối máy chủ.';
  }
  return 'Đã xảy ra lỗi.';
};

export const formatMoney = (value: string | number | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
};

export const dayLabel = (day: number) =>
  ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day] ?? `Thứ ${day}`;

