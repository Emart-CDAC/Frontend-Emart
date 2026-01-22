
import { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = Guest

    // Simulate persistent login 
    useEffect(() => {
        const storedUser = localStorage.getItem('emart_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (email, password) => {
        const foundUser = USERS.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('emart_user', JSON.stringify(foundUser));
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('emart_user');
    };

    const register = (userData) => {
        // In a real app, this would hit API.
        // Here we just return success and user needs to login.
        // For "Nice to Have" card application, we would handle it here too.
        return { success: true, message: 'Registration successful! Please login.' };
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
