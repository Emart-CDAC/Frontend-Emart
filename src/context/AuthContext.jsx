import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = "http://localhost:8080/api/users";

// Helper to decode JWT
const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async (userId, initialEmail = null, initialRole = null) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            const data = response.data;
            setUser({
                id: data.userId,
                email: data.email,
                fullName: data.fullName,
                ePoints: data.epoints,
                role: data.role || initialRole || "ROLE_USER",
                type: data.emartCard ? 'CARDHOLDER' : 'USER'
            });
        } catch (error) {
            console.error("Error refreshing user profile:", error);
            if (userId) {
                setUser(prev => prev || {
                    id: userId,
                    email: initialEmail,
                    role: initialRole || "ROLE_USER"
                });
            }
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            // 1. Check for token in URL (from Google SSO redirect)
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (token) {
                localStorage.setItem('emart_token', token);
                const url = new URL(window.location);
                url.searchParams.delete('token');
                window.history.replaceState({}, document.title, url.pathname);
            }

            // 2. Load user and refresh details
            const storedToken = localStorage.getItem('emart_token');
            if (storedToken) {
                const decoded = decodeToken(storedToken);
                if (decoded) {
                    await refreshUser(decoded.userId, decoded.sub, decoded.role);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [refreshUser]);

    const login = async (email, password, isAdmin = false) => {
        try {
            const url = isAdmin
                ? "http://localhost:8080/api/admin/login"
                : `${API_URL}/login`;

            const response = await axios.post(url, { email, password });
            const { token } = response.data;
            localStorage.setItem('emart_token', token);
            const decoded = decodeToken(token);

            // Immediately fetch full profile to get ePoints etc.
            if (decoded?.userId && !isAdmin) {
                await refreshUser(decoded.userId, decoded.sub, decoded.role);
            } else {
                setUser({
                    id: decoded?.userId,
                    email: decoded?.sub || email,
                    role: decoded?.role || (isAdmin ? "ROLE_ADMIN" : "ROLE_USER")
                });
            }
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
            const params = new URLSearchParams(window.location.search);
            const userId = params.get('userId');

            if (userId) {
                const ssoPayload = { ...userData };
                if (typeof ssoPayload.address === 'string') {
                    ssoPayload.address = { city: ssoPayload.address };
                }
                const response = await axios.put(`${API_URL}/complete-registration/${userId}`, ssoPayload);
                const { token } = response.data;
                localStorage.setItem('emart_token', token);
                const decoded = decodeToken(token);
                await refreshUser(decoded.userId, userData.email, "ROLE_USER");
                return { success: true, message: 'Registration completed successfully!' };
            } else {
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
        <AuthContext.Provider value={{ user, login, logout, register, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
