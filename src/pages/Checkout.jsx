
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORES } from '../data/mockData';
import Button from '../components/Button';
import Input from '../components/Input';
import { Truck, Store, CreditCard, Coins, Split } from 'lucide-react';

const Checkout = () => {
    const { cartItems, calculateTotal, redeemPoints } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [deliveryType, setDeliveryType] = useState('courier'); // courier, pickup
    const [selectedStore, setSelectedStore] = useState(null);
    const [address, setAddress] = useState(user?.address || '');
    const [paymentMode, setPaymentMode] = useState('money'); // money, points, split

    const { subtotal, redeemedPoints, discountFromPoints, total, pointsEarned } = calculateTotal();
    const shippingFee = deliveryType === 'courier' ? 10 : 0;
    const finalTotal = total + shippingFee;

    const availablePoints = user?.ePoints || 0;
    const pointsNeededForFull = Math.ceil(subtotal * 100);

    // Sync context redeemedPoints when paymentMode changes
    useEffect(() => {
        if (paymentMode === 'money') {
            redeemPoints(0);
        } else if (paymentMode === 'points') {
            // Redeem exactly what is needed or all available
            redeemPoints(Math.min(availablePoints, pointsNeededForFull));
        }
    }, [paymentMode, availablePoints, pointsNeededForFull, redeemPoints]);

    if (cartItems.length === 0) {
        return <div className="text-center py-20">Cart is empty</div>;
    }

    const handlePlaceOrder = () => {
        const orderId = Math.floor(Math.random() * 100000);
        const orderDetails = {
            id: orderId,
            items: cartItems,
            total: finalTotal,
            subtotal: subtotal,
            discountFromPoints: discountFromPoints,
            redeemedPoints: redeemedPoints,
            pointsEarned: pointsEarned,
            deliveryType,
            store: selectedStore,
            shippingAddress: address,
            paymentMode,
            date: new Date().toISOString(),
            status: 'pending'
        };

        localStorage.setItem('last_order', JSON.stringify(orderDetails));
        navigate(`/invoice/${orderId}`);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Delivery Option */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" /> Delivery Method
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${deliveryType === 'courier' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setDeliveryType('courier')}
                            >
                                <Truck className="w-6 h-6 mb-2" />
                                <span className="font-semibold text-sm">Courier Delivery</span>
                            </button>
                            <button
                                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${deliveryType === 'pickup' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setDeliveryType('pickup')}
                            >
                                <Store className="w-6 h-6 mb-2" />
                                <span className="font-semibold text-sm">Store Pickup</span>
                            </button>
                        </div>
                    </div>

                    {/* Address / Store Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {deliveryType === 'courier' ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Shipping Address</h2>
                                <Input
                                    label="Full Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your delivery address"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Select Store</h2>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {STORES.map(store => (
                                        <label key={store.id} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${selectedStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                name="store"
                                                className="mt-1 mr-3 h-4 w-4 text-blue-600"
                                                checked={selectedStore?.id === store.id}
                                                onChange={() => setSelectedStore(store)}
                                            />
                                            <div>
                                                <div className="font-bold text-gray-900">{store.name}</div>
                                                <div className="text-sm text-gray-600">{store.address}, {store.city}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" /> Payment Mode
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMode === 'money' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setPaymentMode('money')}
                            >
                                <CreditCard className="w-6 h-6" />
                                <span className="font-semibold text-sm">Money Only</span>
                            </button>
                            <button
                                disabled={availablePoints < 100}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${availablePoints < 100 ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${paymentMode === 'points' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setPaymentMode('points')}
                            >
                                <Coins className="w-6 h-6" />
                                <span className="font-semibold text-sm">e-Points Only</span>
                            </button>
                            <button
                                disabled={availablePoints < 100}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${availablePoints < 100 ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${paymentMode === 'split' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setPaymentMode('split')}
                            >
                                <Split className="w-6 h-6" />
                                <span className="font-semibold text-sm">Split (Points + Money)</span>
                            </button>
                        </div>

                        {/* Split Payment Slider */}
                        {paymentMode === 'split' && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Points to Redeem</span>
                                    <span className="text-sm font-bold text-blue-600">{redeemedPoints} pts</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={Math.min(availablePoints, pointsNeededForFull)}
                                    step="100"
                                    value={redeemedPoints}
                                    onChange={(e) => redeemPoints(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>$0.00 discount</span>
                                    <span>-${discountFromPoints.toFixed(2)} discount</span>
                                </div>
                            </div>
                        )}

                        {paymentMode === 'points' && availablePoints < pointsNeededForFull && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-700 text-xs flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                Note: You only have {availablePoints} points. The remaining ${(subtotal - (availablePoints / 100)).toFixed(2)} must be paid with money.
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Payment Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Cart Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            {discountFromPoints > 0 && (
                                <div className="flex justify-between text-green-600 text-sm font-medium">
                                    <span>Points Discount</span>
                                    <span>-${discountFromPoints.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Shipping Fee</span>
                                <span>${shippingFee.toFixed(2)}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-xl text-gray-900">
                                <span>Total to Pay</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl mb-6">
                            <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Rewards</div>
                            <div className="text-sm text-blue-800">
                                You will earn <span className="font-bold">{pointsEarned.toFixed(0)} e-Points</span> on this order!
                            </div>
                        </div>

                        <Button
                            className="w-full py-4 text-lg shadow-lg shadow-blue-100"
                            onClick={handlePlaceOrder}
                            disabled={!deliveryType || (deliveryType === 'courier' && !address) || (deliveryType === 'pickup' && !selectedStore)}
                        >
                            Complete Order & Pay
                        </Button>

                        <p className="text-[10px] text-gray-400 text-center mt-4">
                            By placing your order, you agree to our Terms of Use and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
