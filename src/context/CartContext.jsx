
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage? Optional.
    // For now let's keep it in memory or simple persistence.

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCartItems([]);

    // Calculate totals
    const calculateTotal = () => {
        let subtotal = 0;
        let savings = 0;
        let pointsEarned = 0;
        let pointsUsed = 0; // Future implementation for redemption

        cartItems.forEach(item => {
            // Determine price based on User Type
            const price = (user?.type === 'CARDHOLDER') ? item.price.cardHolder : item.price.normal;
            const normalPrice = item.price.normal;

            subtotal += price * item.quantity;

            if (user?.type === 'CARDHOLDER') {
                savings += (normalPrice - price) * item.quantity;
                // Points: 10% of purchase amount
                pointsEarned += (price * item.quantity) * 0.10;
            }
        });

        return {
            subtotal,
            savings,
            pointsEarned,
            total: subtotal
        };
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            calculateTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
