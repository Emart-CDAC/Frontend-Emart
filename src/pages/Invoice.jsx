import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2 } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrderApi } from '../services/orderService';

import Button from '../components/Button';
import Input from '../components/Input';

const Invoice = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { user, refreshUser } = useAuth();

    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!user?.id) {
            alert("Please login to place an order");
            navigate('/login');
            return;
        }

        try {
            setIsLoading(true);

            await placeOrderApi({
                userId: user.id,
                totalAmount: 0, // ⚠️ Ideally pass total from Checkout
                useEpoints: 0,
                deliveryType: 'HOME_DELIVERY',
                address: address
            });

            // refresh e-points in navbar
            await refreshUser(user.id);

            // clear cart
            clearCart();

            alert("Payment successful! Invoice has been sent to your email.");

            navigate('/');

        } catch (error) {
            alert(
                error.response?.data ||
                "Payment failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto py-10">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Confirm Payment
            </h2>

            <div className="bg-white p-6 rounded-xl shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                </label>

                <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter delivery address"
                />

                <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full mt-6"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Invoice;
