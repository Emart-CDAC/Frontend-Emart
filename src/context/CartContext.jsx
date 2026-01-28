import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
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
            availableEpoints: data.availableEpoints,
            gstAmount: data.gstAmount,
            offerDiscount: data.offerDiscount
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

        try {
            await addToCartAPI(userId, product.id, quantity, purchaseType, epointsUsed);
            await fetchCart();
            toast.success("Added to cart!");
        } catch (err) {
            console.error("❌ addToCart failed:", err);
            const msg = err.response?.data?.message || err.message || "Failed to add to cart";
            // Check for specific Insufficient E-points message from backend
            if(msg.includes("Insufficient e-points")) {
                toast.error(`⚠️ ${msg}`);
            } else {
                toast.error(msg);
            }
        }
    };

    // =====================
    // REMOVE
    // =====================
    const removeFromCart = async (cartItemId) => {
        try {
            await removeFromCartAPI(cartItemId);
            await fetchCart();
            toast.success("Item removed");
        } catch (err) {
            console.error("❌ removeFromCart failed:", err);
            toast.error("Failed to remove item");
        }
    };

    // =====================
    // UPDATE QUANTITY
    // =====================
    const updateQuantity = async (cartItemId, quantity) => {
        if (!cartItemId || quantity < 1) return;

        try {
            await updateCartQuantityAPI(cartItemId, quantity);
            await fetchCart(); 
        } catch (err) {
            console.error("❌ updateQuantity failed:", err.response?.data || err);
            const msg = err.response?.data?.message || "Failed to update quantity";
            toast.error(msg);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartSummary,
            addToCart,
            removeFromCart,
            updateQuantity,
            refreshCart: fetchCart // Expose for external updates (e.g. after checkout)
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
