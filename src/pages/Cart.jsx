import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, Tag, ShieldCheck, ShoppingCart, Crown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import CheckoutSteps from '../components/CheckoutSteps';
import { getProductImageUrl } from '../services/productService';
import { useEffect } from 'react';

const Cart = () => {
    const { cartItems, cartSummary, removeFromCart, updateQuantity, calculateTotal } = useCart();
    const { user, isAuthenticated } = useAuth();
    
    // Import CheckoutSteps dynamically if not already imported at top, but better to add import
    // checking imports... we need to add import CheckoutSteps from '../components/CheckoutSteps';
    // Since I can't see the imports in this block, I will replace the whole file content to be safe and clean.
    
    useEffect(() => {
        console.log("Cart summary updated:", cartSummary);
    }, [cartSummary]);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <ShoppingCart className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our products and find something you love!</p>
                <Link to="/">
                    <Button size="lg" className="px-8 shadow-lg shadow-blue-200">Start Shopping</Button>
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            <CheckoutSteps currentStep={1} />

            <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart <span className="text-gray-400 font-normal text-xl ml-2">({cartItems.length} items)</span></h1>

            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                {/* CART ITEMS LIST */}
                <div className="flex-1 space-y-4">
                    {cartItems.map(item => {
                        const price = item.price || 0;
                        const productName = item.name || item.productName || "Product Name Unavailable"; 
                        // Sometimes backend might send 'qty' or 'quantity'
                        const quantity = item.quantity || item.qty || 1;

                            return (
                            <div key={item.cartItemId} className="group flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                
                                <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden shadow-inner shrink-0 relative">
                                    <img
                                        src={getProductImageUrl(item.imageUrl)}
                                        alt={productName}
                                        className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <div className="flex-1 w-full text-center sm:text-left">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{productName}</h3>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2 justify-center sm:justify-start">
                                        {(item.discountedPrice && item.price && item.discountedPrice < item.price) ? (
                                            <>
                                                <span className="text-sm text-gray-400 line-through">₹{item.price.toLocaleString()}</span>
                                                <span className="text-2xl font-bold text-gray-900">₹{item.discountedPrice.toLocaleString()}</span>
                                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% OFF
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-900">₹{(item.discountedPrice || item.price).toLocaleString()}</span>
                                        )}
                                    </div>

                                    {item.purchaseType !== 'NORMAL' && (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-3">
                                            {item.purchaseType === 'FULL_EP'
                                                ? `Full e-Points (${item.epointsUsed})`
                                                : `Partial e-Points (${item.epointsUsed})`}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                         <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                            <button
                                                disabled={quantity <= 1}
                                                onClick={() => updateQuantity(item.cartItemId, quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-semibold text-gray-700">{quantity}</span>
                                            <button
                                                onClick={() => {
                                                    const newQty = quantity + 1;
                                                    
                                                    // E-Points Validation
                                                    if (item.purchaseType === 'FULL_EP' || item.purchaseType === 'PARTIAL_EP') {
                                                        const available = cartSummary?.availableEpoints || 0;
                                                        const currentCartUsed = cartSummary?.usedEpoints || 0;
                                                        const itemUsed = item.epointsUsed || 0;
                                                        
                                                        // Calculate new required points for this item
                                                        let newRequired = 0;
                                                        const itemPrice = item.discountedPrice || item.price || 0;
                                                        
                                                        if (item.purchaseType === 'FULL_EP') {
                                                            newRequired = Math.ceil(itemPrice * newQty);
                                                        } else {
                                                            newRequired = Math.ceil(itemPrice * newQty * 0.37);
                                                        }
                                                        
                                                        // Total points needed = (Current Cart Total - Old Item Points) + New Item Points
                                                        const projectedTotalUsed = (currentCartUsed - itemUsed) + newRequired;
                                                        
                                                        if (projectedTotalUsed > available) {
                                                            // Calculate shortfall for better message if needed, or just generic
                                                            // Using toast from context or imported? 
                                                            // We need to import toast if not available. 
                                                            // toast is not imported in this file. 
                                                            // Let's assume toast is globally available or use alert first? 
                                                            // User asked for "toast / snackbar". 
                                                            // CartContext uses toast. Let's see if we can use it.
                                                            // Ideally we should import toast.
                                                            // For now using window.alert or console error if toast import missing, 
                                                            // BUT I will add toast import in next step.
                                                            // Actually, let's try to grab toast if it's not there?
                                                            // Wait, I can't add import in this block.
                                                            // I will use a custom function passed from props? No.
                                                            // I will add `import toast from 'react-hot-toast';` in a separate edit.
                                                            // Proceeding with logic.
                                                            
                                                            // Dispatch error event or use existing toast mechanism in app?
                                                            // The user said "Show an exception message using a React toggler / toast / snackbar library."
                                                            // I'll assume I can add the import.
                                                            
                                                            toast.error(`You do not have sufficient e-Points to add another unit of this product.\nRequired: ${projectedTotalUsed}, Available: ${available}`);
                                                            return;
                                                        }
                                                    }
                                                    
                                                    updateQuantity(item.cartItemId, newQty);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-r-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.cartItemId)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SUMMARY SIDEBAR */}
                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            Order Summary
                        </h2>

                        <div className="space-y-4 text-gray-600">
                            <div className="flex justify-between">
                                <span>Total MRP</span>
                                <span className="font-medium text-gray-900">₹{cartSummary.totalMrp || 0}</span>
                            </div>

                            {/* Offer Discount (MRP - Offer Price) */}
                            {cartSummary.offerDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Offer Discount</span>
                                    <span>- ₹{cartSummary.offerDiscount}</span>
                                </div>
                            )}

                            {displayEpointDisc > 0 && (
                                <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 fill-current" /> E-Point Discount</span>
                                    <span className="font-bold">- ₹{displayEpointDisc}</span>
                                </div>
                            )}

                             <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span className="font-medium text-gray-900">₹{displayPlatformFee}</span>
                            </div>

                            {/* GST Display */}
                            <div className="flex justify-between">
                                <span>GST (10%)</span>
                                <span className="font-medium text-gray-900">₹{cartSummary.gstAmount || 0}</span>
                            </div>

                            <div className="h-px bg-gray-200 my-4"></div>

                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                                <span className="text-2xl font-bold text-blue-600">₹{displayFinalAmount}</span>
                            </div>
                             <p className="text-xs text-gray-400 text-right mb-6">Inclusive of all taxes</p>
                        </div>

                        {!isGuest && displayEarnedPoints > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mb-6">
                                <div className="bg-white p-1.5 rounded-full shadow-sm">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-900 font-medium">You will earn</p>
                                    <p className="text-lg font-bold text-blue-700">{displayEarnedPoints} E-Points</p>
                                </div>
                            </div>
                        )}

                        <Link to="/checkout" className="block">
                            <Button className="w-full py-4 text-lg shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all">
                                Proceed to Checkout
                            </Button>
                        </Link>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
