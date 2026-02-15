import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============= USER APIs =============
export const userAPI = {
    login: (credentials) => api.post('/users/login', credentials),
    register: (userData) => api.post('/users', userData),
    getAllUsers: (params) => api.get('/users', { params }), // params: { page, limit, search }
    updateUser: (id, data) => api.patch(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// ============= PRODUCT APIs =============
// ============= PRODUCT APIs =============
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    create: (productData) => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
};

// ============= ORDER APIs =============
export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }), // params: { page, limit, search, status }
    create: (orderData) => api.post('/orders', orderData),
    update: (id, orderData) => api.put(`/orders/${id}`, orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
};

// ============= CART APIs =============
export const cartAPI = {
    getCart: (userId) => api.get(`/cart/${userId}`),
    addToCart: (userId, item) => api.post(`/cart/${userId}`, item),
    updateCart: (userId, cartData) => api.put(`/cart/${userId}`, cartData),
    removeFromCart: (userId, productId) => api.delete(`/cart/${userId}/${productId}`),
};

// ============= WISHLIST APIs =============
export const wishlistAPI = {
    getWishlist: (userId) => api.get(`/wishlist/${userId}`),
    addToWishlist: (userId, productId) => api.post(`/wishlist/${userId}`, { productId }),
    removeFromWishlist: (userId, productId) => api.delete(`/wishlist/${userId}/${productId}`),
};

export default api;
