// ==========================================
// API Configuration - Update this URL
// ==========================================
const API_CONFIG = {
  // For Development (Local testing)
  // DEVELOPMENT_URL: 'http://192.168.1.100:3000/api', // Replace with YOUR IP

  // For Production (Play Store)
  PRODUCTION_URL: 'https://testing-backend-akshaya.vercel.app/api',

  // Change this to switch between dev and prod
  USE_PRODUCTION: true, // Set to true when building for Play Store
};

// Select URL based on configuration (NOT from .env)
const BASE_URL = API_CONFIG.USE_PRODUCTION
  ? API_CONFIG.PRODUCTION_URL
  : API_CONFIG.DEVELOPMENT_URL;

console.log('🌐 API Base URL:', BASE_URL);

// ==========================================
// API Service Configuration
// ==========================================
const config = {
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds - Vercel serverless can be slow on cold starts
  headers: {
    'Content-Type': 'application/json',
  }
};

// ==========================================
// Core API Service
// ==========================================
const apiService = {
  // GET Request
  get: async (endpoint) => {
    try {
      console.log(`📡 GET: ${config.baseURL}${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.baseURL}${endpoint}`, {
        method: 'GET',
        headers: config.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Response:`, data.success ? 'Success' : 'Failed');
      return data;
    } catch (error) {
      console.error('❌ API GET Error:', error.message);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }

      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  },

  // POST Request
  post: async (endpoint, data) => {
    try {
      console.log(`📡 POST: ${config.baseURL}${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.baseURL}${endpoint}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`✅ Response:`, responseData.success ? 'Success' : 'Failed');
      return responseData;
    } catch (error) {
      console.error('❌ API POST Error:', error.message);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }

      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  },

  // PUT Request
  put: async (endpoint, data) => {
    try {
      console.log(`📡 PUT: ${config.baseURL}${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`✅ Response:`, responseData.success ? 'Success' : 'Failed');
      return responseData;
    } catch (error) {
      console.error('❌ API PUT Error:', error.message);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }

      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  },

  // PATCH Request
  patch: async (endpoint, data) => {
    try {
      console.log(`📡 PATCH: ${config.baseURL}${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: config.headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`✅ Response:`, responseData.success ? 'Success' : 'Failed');
      return responseData;
    } catch (error) {
      console.error('❌ API PATCH Error:', error.message);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }

      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  },

  // DELETE Request
  delete: async (endpoint) => {
    try {
      console.log(`📡 DELETE: ${config.baseURL}${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: config.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Response:`, data.success ? 'Success' : 'Failed');
      return data;
    } catch (error) {
      console.error('❌ API DELETE Error:', error.message);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }

      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  }
};

// ==========================================
// Legacy Menu API (for backward compatibility)
// ==========================================
export const menuAPI = {
  getAllItems: () => apiService.get('/menu'),
  getItemsByDay: (day) => apiService.get(`/menu/day/${day}`),
  getItemsByDayAndMeal: (day, mealType) => apiService.get(`/menu/day/${day}/meal/${mealType}`),
  getItemById: (id) => apiService.get(`/menu/${id}`),
  createItem: (itemData) => apiService.post('/menu', itemData),
  updateItem: (id, itemData) => apiService.put(`/menu/${id}`, itemData),
  deleteItem: (id) => apiService.delete(`/menu/${id}`),
};

// ==========================================
// Package Meals API (NEW)
// ==========================================
export const packagesAPI = {
  // Get all packages
  getAll: () => apiService.get('/packages'),

  // Get packages by day (optionally filter by mealType)
  getByDay: (day, mealType = null) => {
    const url = mealType ? `/packages/day/${day}?mealType=${mealType}` : `/packages/day/${day}`;
    return apiService.get(url);
  },

  // Get single package
  getById: (id) => apiService.get(`/packages/${id}`),
};

// ==========================================
// Single Meals API (NEW)
// ==========================================
export const singlesAPI = {
  // Get all single items (visible only for customers)
  getAll: () => apiService.get('/singles'),

  // Get by category
  getByCategory: (category) => apiService.get(`/singles/category/${encodeURIComponent(category)}`),

  // Get categories list
  getCategories: () => apiService.get('/singles/categories'),

  // Get single item
  getById: (id) => apiService.get(`/singles/${id}`),
};

// ==========================================
// Orders API (NEW)
// ==========================================
export const ordersAPI = {
  // Create new order
  create: (orderData) => apiService.post('/orders', orderData),

  // Get user's orders (by phone number)
  getMyOrders: (phone) => apiService.get(`/orders?phone=${phone}`),

  // Get order by ID
  getById: (id) => apiService.get(`/orders/${id}`),
};

// ==========================================
// Auth API Endpoints
// ==========================================
export const authAPI = {
  // Login with phone and password
  login: (phone, password) =>
    apiService.post('/auth/login', { phone, password }),

  // Register new user
  register: (userData) =>
    apiService.post('/auth/register', userData),
};

export default apiService;
