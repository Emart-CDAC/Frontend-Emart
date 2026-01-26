
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [redeemedPoints, setRedeemedPoints] = useState(0);

    // Sync with backend on mount or user change
    useEffect(() => {
        const fetchCart = async () => {
            if (user?.id) {
                try {
                    const response = await cartService.getCart(user.id);
                    // Map Backend structure to Frontend structure
                    // Backend returns List<CartItems>
                    const mappedItems = response.data.map(item => ({
                        ...item.product, // Includes name, price, etc.
                        cartItemId: item.cartItemId, // Important for updates/deletes
                        quantity: item.quantity,
                        id: item.product.id // Ensure ID consistency
                    }));
                    setCartItems(mappedItems);
                } catch (error) {
                    console.error("Failed to fetch cart:", error);
                }
            } else {
                setCartItems([]);
            }
        };

        fetchCart();
    }, [user]);

    const addToCart = async (product, quantity = 1) => {
        if (user?.id) {
            try {
                const response = await cartService.addToCartApi(user.id, product.id, quantity);
                // Refresh full cart to get the new cartItemId
                const refreshRes = await cartService.getCart(user.id);
                const mappedItems = refreshRes.data.map(item => ({
                    ...item.product,
                    cartItemId: item.cartItemId,
                    quantity: item.quantity,
                    id: item.product.id
                }));
                setCartItems(mappedItems);
            } catch (error) {
                console.error("Failed to add to cart API:", error);
            }
        } else {
            // Local mode (fallback or just ignore since we protected the button)
            setCartItems(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) {
                    return prev.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                    );
                }
                return [...prev, { ...product, quantity }];
            });
        }
    };

    const removeFromCart = async (productId) => {
        const item = cartItems.find(item => item.id === productId);
        if (user?.id && item?.cartItemId) {
            try {
                await cartService.removeFromCartApi(item.cartItemId);
                setCartItems(prev => prev.filter(i => i.id !== productId));
            } catch (error) {
                console.error("Failed to remove from cart API:", error);
            }
        } else {
            setCartItems(prev => prev.filter(item => item.id !== productId));
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        const item = cartItems.find(item => item.id === productId);
        if (user?.id && item?.cartItemId) {
            try {
                await cartService.updateQuantityApi(item.cartItemId, quantity);
                setCartItems(prev => prev.map(i =>
                    i.id === productId ? { ...i, quantity } : i
                ));
            } catch (error) {
                console.error("Failed to update quantity API:", error);
            }
        } else {
            setCartItems(prev => prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ));
        }
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
            // Backend: normalPrice, ecardPrice. Mock: price.normal, price.cardHolder
            const normal = item.normalPrice !== undefined ? item.normalPrice : (item.price?.normal || 0);
            const card = item.ecardPrice !== undefined ? item.ecardPrice : (item.price?.cardHolder || 0);

            const price = (user?.type === 'CARDHOLDER') ? card : normal;
            const normalPrice = normal;

            subtotal += price * item.quantity;

            if (user?.type === 'CARDHOLDER') {
                savings += (normalPrice - price) * item.quantity;
                // Points: 1% of purchase amount
                pointsEarned += (price * item.quantity) * 0.01;
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
