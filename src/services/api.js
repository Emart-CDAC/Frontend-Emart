import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

export const getAllProducts = () => {
    return api.get('/products');
};

export const getProductById = (id) => {
    return api.get(`/products/${id}`);
};

export const searchProducts = (query) => {
    return api.get(`/products/search?q=${query}`);
};

export default api;