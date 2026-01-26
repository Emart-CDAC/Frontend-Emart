import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cart';

export const getCart = async (userId) => {
    return axios.get(`${API_URL}/get/${userId}`);
};

export const addToCartApi = async (userId, productId, quantity = 1) => {
    return axios.post(`${API_URL}/add`, null, {
        params: { userId, productId, quantity }
    });
};

export const removeFromCartApi = async (cartItemId) => {
    return axios.delete(`${API_URL}/delete/${cartItemId}`);
};

export const updateQuantityApi = async (cartItemId, quantity) => {
    return axios.put(`${API_URL}/update`, null, {
        params: { cartItemId, quantity }
    });
};
