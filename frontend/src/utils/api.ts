import axios from 'axios';
import { Product, Category, Transaction, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { category?: number; search?: string }): Promise<Product[]> => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getByBarcode: async (barcode: string): Promise<Product> => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },
  
  create: async (product: Omit<Product, 'id' | 'created_at' | 'is_active'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },
  
  update: async (id: number, updates: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, updates);
    return response.data;
  },
  
  updateStock: (id: number, data: any) =>
    axios.put(`/api/products/${id}`, data).then(res => res.data),
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },
  
  update: async (id: number, updates: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, updates);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    start_date?: string; 
    end_date?: string; 
  }): Promise<Transaction[]> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  create: async (transaction: {
    items: Array<{ product_id: number; quantity: number }>;
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    payment_method: 'cash' | 'card' | 'digital';
  }): Promise<Transaction> => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },
  
  getSummary: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/transactions/reports/summary', { params });
    return response.data;
  },
};

export default api;