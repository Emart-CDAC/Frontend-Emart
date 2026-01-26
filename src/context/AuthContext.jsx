import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = "http://localhost:8080/api/users";

// Decode JWT safely
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 ALWAYS normalize user object
    const normalizeUser = (data) => ({
        id: data.id || data.userId || data.customerId,
        email: data.email,
        fullName: data.fullName,
        ePoints: data.epoints ?? data.ePoints ?? 0,
        emartCard: data.emartCard,
        role: data.role || "ROLE_USER",
        type: data.emartCard ? 'CARDHOLDER' : 'USER'
    });

    const refreshUser = useCallback(async (userId, email = null, role = null) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            const normalized = normalizeUser(response.data);

            if (!normalized.id) {
                throw new Error("User ID missing after refresh");
            }

            setUser(normalized);
        } catch (err) {
            console.error("refreshUser failed:", err);
            if (userId) {
                setUser({
                    id: userId,
                    email,
                    role: role || "ROLE_USER"
                });
            }
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('emart_token');

            if (token) {
                const decoded = decodeToken(token);
                if (decoded?.userId) {
                    await refreshUser(decoded.userId, decoded.sub, decoded.role);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [refreshUser]);

    const login = async (email, password, isAdmin = false) => {
        const url = isAdmin
            ? "http://localhost:8080/api/admin/login"
            : `${API_URL}/login`;

        const response = await axios.post(url, { email, password });
        const { token } = response.data;

        localStorage.setItem('emart_token', token);

        const decoded = decodeToken(token);
        if (!decoded?.userId) {
            throw new Error("Invalid token: userId missing");
        }

        await refreshUser(decoded.userId, decoded.sub, decoded.role);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('emart_token');
    };

    const isAuthenticated = () => !!user?.id;
    const getToken = () => localStorage.getItem('emart_token');

    console.log("✅ AuthContext user:", user);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                refreshUser,
                loading,
                isAuthenticated,
                getToken
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
