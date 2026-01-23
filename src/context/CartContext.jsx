
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage? Optional.
    // For now let's keep it in memory or simple persistence.

    const [redeemedPoints, setRedeemedPoints] = useState(0);

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

    const clearCart = () => {
        setCartItems([]);
        setRedeemedPoints(0);
    }

    const redeemPoints = (points) => {
        setRedeemedPoints(points);
    }

    // Calculate totals
    const calculateTotal = () => {
        let subtotal = 0;
        let savings = 0;
        let pointsEarned = 0;

        // 100 Points = $1.00 Discount
        const discountFromPoints = redeemedPoints / 100;

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

        // Ensure total doesn't go below zero
        const total = Math.max(0, subtotal - discountFromPoints);

        return {
            subtotal,
            savings,
            pointsEarned,
            discountFromPoints,
            redeemedPoints,
            total
        };
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            redeemPoints,
            calculateTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
