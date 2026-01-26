import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Checkout = () => {
    const { cartItems, cartSummary } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!cartItems.length) {
        return <div className="text-center py-20">Cart is empty</div>;
    }

    const handlePlaceOrder = async () => {
        // 👉 ONLY trigger backend order API
        navigate('/order-success');
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* SUMMARY */}
            <div className="bg-white p-6 rounded-xl shadow border space-y-4">
                <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span>₹{cartSummary.totalMrp}</span>
                </div>

                <div className="flex justify-between text-green-600">
                    <span>E-Points Discount</span>
                    <span>- ₹{cartSummary.epointDiscount}</span>
                </div>

                <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{cartSummary.platformFee}</span>
                </div>

                <div className="pt-4 border-t flex justify-between font-bold text-lg">
                    <span>Total Payable</span>
                    <span>₹{cartSummary.totalAmount}</span>
                </div>

                <div className="text-sm text-gray-600">
                    e-Points Used: <b>{cartSummary.usedEpoints}</b>
                </div>

                <div className="text-sm text-blue-600">
                    You will earn <b>{cartSummary.earnedEpoints}</b> e-Points
                </div>

                <Button className="w-full mt-6" onClick={handlePlaceOrder}>
                    Place Order
                </Button>
            </div>
        </div>
    );
};

export default Checkout;
