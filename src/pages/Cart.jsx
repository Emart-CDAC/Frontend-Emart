
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, calculateTotal } = useCart();
    const { user } = useAuth();
    const { subtotal, savings, pointsEarned, total } = calculateTotal();

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    {cartItems.map((item) => {
                        const price = user?.type === 'CARDHOLDER' ? item.price.cardHolder : item.price.normal;
                        return (
                            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-2">{item.brand}</p>
                                    <div className="font-bold text-lg">${price}</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="w-full lg:w-96 h-fit bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {savings > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Member Savings</span>
                                <span>-${savings.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {user?.type === 'CARDHOLDER' && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-6">
                            You will earn <span className="font-bold">{pointsEarned.toFixed(0)} e-Points</span> on this order!
                        </div>
                    )}

                    <Link to="/checkout" className="block w-full">
                        <Button className="w-full" size="lg">
                            Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>

                    {!user && (
                        <p className="text-xs text-center text-gray-500 mt-4">
                            <Link to="/login" className="text-blue-600 underline">Login</Link> to check for member prices.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
