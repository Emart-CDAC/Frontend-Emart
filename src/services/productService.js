import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/products';
const IMAGE_BASE_URL = 'http://localhost:8080/images';

export const getAllProducts = () => {
    return axios.get(API_BASE_URL);
};

export const getProductById = (id) => {
    return axios.get(`${API_BASE_URL}/${id}`);
};

export const searchProducts = (query) => {
    return axios.get(`${API_BASE_URL}/search?q=${query}`);
};

export const getProductImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // If it's already a full URL (like from Unsplash in mock data), return it
    if (imagePath.startsWith('http')) return imagePath;

    // Clean path
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    // Append .jpg if no extension is present (assuming all backend images are jpg based on file list)
    if (!cleanPath.match(/\.[a-zA-Z0-9]+$/)) {
        cleanPath += '.jpg';
    }

    return `${IMAGE_BASE_URL}/${cleanPath}`;
};
