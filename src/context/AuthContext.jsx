import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = "http://localhost:8080/api/users";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for token in URL (from Google SSO redirect)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
            localStorage.setItem('emart_token', token);
            // Clean URL
            const url = new URL(window.location);
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.pathname);
        }

        // 2. Load user from token
        const storedToken = localStorage.getItem('emart_token');
        if (storedToken) {
            // In a real app, we'd fetch /me. 
            // For now, let's decode the email from JWT or just assume valid.
            // Simplified: we'll set a basic user object.
            // You might want to add a /me endpoint later.
            setUser({ email: 'authenticated_user' }); 
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token } = response.data;
            localStorage.setItem('emart_token', token);
            setUser({ email }); 
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed" 
            };
        }
    };

    const register = async (userData) => {
        try {
            // Check if it's a "complete registration" for SSO user
            const params = new URLSearchParams(window.location.search);
            const userId = params.get('userId');

            if (userId) {
                // Ensure address is an object if it's currently a string
                const ssoPayload = { ...userData };
                if (typeof ssoPayload.address === 'string') {
                    ssoPayload.address = { city: ssoPayload.address };
                }
                const response = await axios.put(`${API_URL}/complete-registration/${userId}`, ssoPayload);
                const { token } = response.data;
                localStorage.setItem('emart_token', token);
                setUser({ email: userData.email });
                return { success: true, message: 'Registration completed successfully!' };
            } else {
                // Normal registration
                const normalPayload = { ...userData };
                if (typeof normalPayload.address === 'string') {
                    normalPayload.address = { city: normalPayload.address };
                }
                await axios.post(`${API_URL}/register`, normalPayload);
                return { success: true, message: 'Registration successful! Please login.' };
            }
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Registration failed" 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('emart_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
