import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // REMOVED: Use configured api instance
import api from '../services/api';

const AuthContext = createContext();

// Decode JWT safely (Robust implementation handling Base64Url)
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token", e);
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
            // Use configured `api` which adds the Authorization header automatically
            const response = await api.get(`/users/${userId}`);
            console.log("🔄 refreshUser response:", response.data); // DEBUG
            const normalized = normalizeUser(response.data);

            if (!normalized.id) {
                console.error("❌ Normalized user missing ID:", normalized, "From data:", response.data);
                throw new Error("User ID missing after refresh");
            }

            console.log("✅ User refreshed successfully:", normalized);
            setUser(normalized);
        } catch (err) {
            console.error("refreshUser failed:", err);
            // Fallback: if backend fails, use token data so the user isn't logged out visually
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
                    // Pass sub (email) and role as fallbacks
                    await refreshUser(decoded.userId, decoded.sub, decoded.role);
                } else {
                    console.warn("Token present but invalid or missing userId");
                    // Optionally clear invalid token?
                    // localStorage.removeItem('emart_token'); 
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [refreshUser]);

    const login = async (email, password, isAdmin = false) => {
        const url = isAdmin
            ? "/admin/login" 
            : "/users/login";

        try {
            const response = await api.post(url, { email, password });
            const { token } = response.data;
            
            if (!token) throw new Error("No token received");

            localStorage.setItem('emart_token', token);

            const decoded = decodeToken(token);
            if (!decoded?.userId) {
                throw new Error("Invalid token: userId missing");
            }

            await refreshUser(decoded.userId, decoded.sub, decoded.role);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            // Return error structure consistent with UI expectation
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed" 
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post(`/users/register`, userData);
            return { success: true, message: "Registration successful! Please login." };
        } catch (error) {
            console.error("Registration failed:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Registration failed" 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('emart_token');
        // Optional: Call network logout if needed
    };

    const isAuthenticated = () => !!user?.id;
    const getToken = () => localStorage.getItem('emart_token');

    // Debugging loop check
    // console.log("✅ AuthContext user state:", user);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
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
