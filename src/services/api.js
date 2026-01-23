import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
});

export const getAllProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);
