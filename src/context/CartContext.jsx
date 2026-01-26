import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    addToCartAPI,
    removeFromCartAPI,
    updateCartQuantityAPI,
    getCartSummaryAPI
} from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    const userId = user?.id || user?.userId || user?.customerId;

    const [cartItems, setCartItems] = useState([]);
    const [cartSummary, setCartSummary] = useState({
        totalMrp: 0,
        epointDiscount: 0,
        couponDiscount: 0,
        platformFee: 0,
        totalAmount: 0,
        usedEpoints: 0,
        earnedEpoints: 0,
        availableEpoints: 0
    });

    // ✅ SINGLE cart fetcher (FIXES fetchCart error)
    const fetchCart = useCallback(async () => {
        if (!userId) return;

        const { data } = await getCartSummaryAPI(userId);

        setCartItems(data.items || []);
        setCartSummary({
            totalMrp: data.totalMrp,
            epointDiscount: data.epointDiscount,
            couponDiscount: data.couponDiscount,
            platformFee: data.platformFee,
            totalAmount: data.finalPayableAmount,
            usedEpoints: data.usedEpoints,
            earnedEpoints: data.earnedEpoints,
            availableEpoints: data.availableEpoints
        });
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // =====================
    // ADD
    // =====================
    const addToCart = async (product, quantity = 1, purchaseType = "NORMAL", epointsUsed = 0) => {
        if (!userId) return;

        await addToCartAPI(userId, product.id, quantity, purchaseType, epointsUsed);
        await fetchCart();
    };

    // =====================
    // REMOVE
    // =====================
    const removeFromCart = async (cartItemId) => {
        await removeFromCartAPI(cartItemId);
        await fetchCart();
    };

    // =====================
    // UPDATE QUANTITY
    // =====================
    const updateQuantity = async (cartItemId, quantity) => {
        if (!cartItemId || quantity < 1) return;

        try {
            await updateCartQuantityAPI(cartItemId, quantity);
            await fetchCart(); // ✅ now works
        } catch (err) {
            console.error("❌ updateQuantity failed:", err.response?.data || err);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartSummary,
            addToCart,
            removeFromCart,
            updateQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
