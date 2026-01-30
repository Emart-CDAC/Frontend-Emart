import API from "./api";

export const getProductOffersInventory = () =>
    API.get("/api/admin/analytics/product-offers-inventory");
