
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORES } from '../data/mockData';
import Button from '../components/Button';
import Input from '../components/Input';
import { Truck, Store } from 'lucide-react';

const Checkout = () => {
    const { cartItems, calculateTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { total, pointsEarned } = calculateTotal();

    const [deliveryType, setDeliveryType] = useState('courier'); // courier, pickup
    const [selectedStore, setSelectedStore] = useState(null);
    const [address, setAddress] = useState(user?.address || '');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    if (cartItems.length === 0) {
        return <div className="text-center py-20">Cart is empty</div>;
    }

    const handlePlaceOrder = () => {
        const orderId = Math.floor(Math.random() * 100000);
        const orderDetails = {
            id: orderId,
            items: cartItems,
            total: total,
            pointsEarned: pointsEarned,
            deliveryType,
            store: selectedStore,
            shippingAddress: address,
            date: new Date().toISOString(),
            status: 'pending' // Pending payment
        };

        localStorage.setItem('last_order', JSON.stringify(orderDetails));
        navigate(`/invoice/${orderId}`);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Delivery Option */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Delivery Method</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${deliveryType === 'courier' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setDeliveryType('courier')}
                            >
                                <Truck className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Courier Delivery</span>
                            </button>
                            <button
                                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${deliveryType === 'pickup' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setDeliveryType('pickup')}
                            >
                                <Store className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Store Pickup</span>
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
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {STORES.map(store => (
                                        <label key={store.id} className={`flex items-start p-3 rounded-lg border cursor-pointer ${selectedStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="store"
                                                className="mt-1 mr-3"
                                                checked={selectedStore?.id === store.id}
                                                onChange={() => setSelectedStore(store)}
                                            />
                                            <div>
                                                <div className="font-bold">{store.name}</div>
                                                <div className="text-sm text-gray-600">{store.address}, {store.city}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Side */}
                <div className="bg-gray-50 p-6 rounded-xl h-fit">
                    <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Items Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>{deliveryType === 'courier' ? '$10.00' : 'Free'}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-xl mb-8">
                        <span>Total to Pay</span>
                        <span>${(total + (deliveryType === 'courier' ? 10 : 0)).toFixed(2)}</span>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={!deliveryType || (deliveryType === 'courier' && !address) || (deliveryType === 'pickup' && !selectedStore)}
                    >
                        Generate Invoice & Review
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
