import api from './api';

export const getEmartCardDetails = async (userId) => {
    try {
        const response = await api.get(`/emart-card/details/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching eMart Card details:", error);
        throw error;
    }
};

export const applyForEmartCard = async (cardData) => {
    try {
        const response = await api.post('/emart-card/apply', cardData);
        return response.data;
    } catch (error) {
        console.error("Error applying for eMart Card:", error);
        throw error;
    }
};
