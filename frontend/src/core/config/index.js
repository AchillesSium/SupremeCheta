export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  imageUrl: process.env.REACT_APP_IMAGE_URL || 'http://localhost:5000/uploads',
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  appName: 'Supreme Cheta',
  version: '1.0.0',
};

export const ROUTES = {
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id) => `/customers/${id}`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    SALES: '/analytics/sales',
    PRODUCTS: '/analytics/products',
  },
};
