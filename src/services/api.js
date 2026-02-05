import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('emart_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401 (token expired or invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('emart_token');
            localStorage.removeItem('emart_user');
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export const getAllProducts = () => {
    return api.get('/products');
};

export const getProductById = (id) => {
    return api.get(`/products/${id}`);
};

export const searchProducts = (query) => {
    return api.get(`/products/search?q=${query}`);
};

// Cart APIs
export const addToCartAPI = (userId, productId, quantity, purchaseType = 'NORMAL', epointsUsed = 0) => {
    return api.post(`/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}&purchaseType=${purchaseType}&epointsUsed=${epointsUsed}`);
};

export const removeFromCartAPI = (cartItemId) => {
    return api.delete(`/cart/delete/${cartItemId}`);
};

export const updateCartQuantityAPI = (cartItemId, quantity) => {
    return api.put(`/cart/update?cartItemId=${cartItemId}&quantity=${quantity}`);
};

export const getCartAPI = (userId) => {
    return api.get(`/cart/get/${userId}`);
};

export const getCartSummaryAPI = (userId) => {
    return api.get(`/cart/summary/${userId}`);
};

export const applyEpointsAPI = (userId, epointsToRedeem) => {
    return api.post(`/cart/apply-epoints`, { userId, epointsToRedeem });
};
// ==========================
// ORDER APIs
// ==========================

// ==========================
// ORDER APIs
// ==========================



// ==========================
// STORE & ADDRESS APIs
// ==========================

export const getStoresAPI = () => {
    return api.get('/stores');
};

export const getAddressesAPI = (userId) => {
    return api.get(`/address/user/${userId}`);
};

export const addAddressAPI = (userId, addressData) => {
    return api.post(`/address/add/${userId}`, addressData);
};

// ORDER
export const placeOrderAPI = (payload) => {
  return api.post('/order/place', payload);
};

export const getOrderByIdAPI = (orderId) => {
  return api.get(`/order/${orderId}`);
};

export const getOrdersByUserAPI = (userId) => {
  return api.get(`/order/user/${userId}`);
};

// RAZORPAY
export const createRazorpayOrderAPI = (amount) => {
  return api.post(`/payment/create-order?amount=${amount}`);
};

export const verifyRazorpayPaymentAPI = (orderId, paymentData) => {
    return api.post(`/payment/verify-razorpay-payment/${orderId}`, paymentData);
};




export default api;
