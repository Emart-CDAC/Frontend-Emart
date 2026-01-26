import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { getProductImageUrl } from '../services/productService';
import { useEffect } from 'react';

const Cart = () => {
    const { cartItems, cartSummary, removeFromCart, updateQuantity, calculateTotal } = useCart();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        console.log("Cart summary updated:", cartSummary);
    }, [cartSummary]);

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <Link to="/">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    const isGuest = !isAuthenticated() || !user?.id;
    const guestTotal = isGuest ? calculateTotal() : null;

    const displayMrp = isGuest ? guestTotal.subtotal : cartSummary.totalMrp;
    const displayEpointDisc = isGuest ? 0 : cartSummary.epointDiscount;
    const displayPlatformFee = isGuest ? guestTotal.platformFee : cartSummary.platformFee;
    const displayFinalAmount = isGuest ? guestTotal.total : cartSummary.totalAmount;
    const displayEarnedPoints = isGuest ? 0 : cartSummary.earnedEpoints;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* CART ITEMS */}
                <div className="flex-1 space-y-6">
                    {cartItems.map(item => {
                        const price = item.price || 0;

                        return (
                            <div key={item.cartItemId} className="flex items-center gap-6 bg-white p-4 rounded-xl shadow border">
                                <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                                    <img
                                        src={getProductImageUrl(item.imageUrl)}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <div className="font-bold">₹{price}</div>

                                    {item.purchaseType !== 'NORMAL' && (
                                        <div className="text-sm text-blue-600 mt-1">
                                            {item.purchaseType === 'FULL_EP'
                                                ? `Full e-Points (${item.epointsUsed})`
                                                : `Partial e-Points (${item.epointsUsed})`}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
    disabled={item.quantity <= 1}
    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
>
    -
</button>

<button
    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
>
    +
</button>

                                </div>

                                <button onClick={() => removeFromCart(item.cartItemId)}>
                                    <Trash2 className="text-red-500" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* SUMMARY */}
                <div className="w-full lg:w-96 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">Price Details</h2>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Total MRP</span>
                            <span>₹{displayMrp}</span>
                        </div>

                        <div className="flex justify-between text-green-600">
                            <span>E-Points Discount</span>
                            <span>- ₹{displayEpointDisc}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>₹{displayPlatformFee}</span>
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-3 border-t">
                            <span>Total</span>
                            <span>₹{displayFinalAmount}</span>
                        </div>
                    </div>

                    {!isGuest && (
                        <div className="bg-blue-50 mt-4 p-3 rounded text-sm text-blue-700">
                            You will earn <b>{displayEarnedPoints}</b> e-points
                        </div>
                    )}

                    <Link to="/checkout">
                        <Button className="w-full mt-6">Place Order</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
