import axios from 'axios';

const API_URL = 'http://localhost:8080/api/order';

export const getUserOrders = async (userId) => {
    const token = localStorage.getItem('emart_token');
    return axios.get(`${API_URL}/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const placeOrderApi = async (orderData) => {
    const token = localStorage.getItem('emart_token');
    return axios.post(`${API_URL}/placeOrder`, null, {
        params: {
            userId: orderData.userId,
            totalAmount: orderData.totalAmount,
            useEpoints: orderData.useEpoints,
            deliveryType: orderData.deliveryType,
            address: orderData.address
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
