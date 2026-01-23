
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, CheckCircle, Edit2, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [order, setOrder] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState('');

    useEffect(() => {
        const storedOrder = localStorage.getItem('last_order');
        if (storedOrder) {
            const parsed = JSON.parse(storedOrder);
            if (String(parsed.id) === id) {
                setOrder(parsed);
                setAddress(parsed.shippingAddress);
                if (parsed.status === 'paid') setIsPaid(true);
            }
        }
    }, [id]);

    const handlePayment = () => {
        // Mock Payment
        setIsPaid(true);
        clearCart(); // Clear cart now

        // Update local storage
        const updated = { ...order, status: 'paid', shippingAddress: address };
        localStorage.setItem('last_order', JSON.stringify(updated));
        setOrder(updated);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!order) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Payment Success View */}
            {isPaid ? (
                <div className="text-center mb-8 print:hidden">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-500">Invoice #{order.id} has been generated.</p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Link to="/">
                            <Button>Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-blue-900">Review & Pay</h2>
                        <p className="text-blue-700">Please review your invoice before making payment.</p>
                    </div>
                    <div className="space-x-4">
                        <Button variant="outline" onClick={() => navigate('/checkout')}>Modify Order</Button>
                        <Button onClick={handlePayment}>
                            <CreditCard className="w-4 h-4 mr-2" /> Pay Now ${order.total.toFixed(2)}
                        </Button>
                    </div>
                </div>
            )}

            {/* Invoice Paper */}
            <div className="bg-white p-8 md:p-12 shadow-lg border border-gray-100 print:shadow-none print:border-none print:p-0">
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-2">e-MART</h2>
                        <p className="text-sm text-gray-500">Invoice #{order.id}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.date).toLocaleDateString()}</p>
                        <p className="text-sm font-bold mt-1 uppercase text-gray-400">{isPaid ? 'PAID' : 'UNPAID'}</p>
                    </div>
                    <div className="text-right max-w-xs">
                        <h3 className="font-bold text-gray-900 flex items-center justify-end">
                            Bill To:
                            {!isPaid && !isEditingAddress && (
                                <button onClick={() => setIsEditingAddress(true)} className="ml-2 text-blue-600 hover:text-blue-800">
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            )}
                        </h3>

                        {isEditingAddress && !isPaid ? (
                            <div className="mt-2">
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="text-right text-sm"
                                />
                                <button onClick={() => setIsEditingAddress(false)} className="text-xs text-blue-600 mt-1 underline">Save</button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">{address || order.shippingAddress || 'N/A'}</p>
                        )}
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                            <th className="py-2">Item</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => {
                            const price = item.price.cardHolder || item.price.normal;
                            return (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.brand}</div>
                                    </td>
                                    <td className="py-4 text-right">{item.quantity}</td>
                                    <td className="py-4 text-right">${price}</td>
                                    <td className="py-4 text-right">${(price * item.quantity).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${(order.subtotal || order.total).toFixed(2)}</span>
                        </div>
                        {order.discountFromPoints > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Points Redemption ({order.redeemedPoints} pts)</span>
                                <span>-${order.discountFromPoints.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2 mt-2">
                            <span>Total Due</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                        {order.pointsEarned > 0 && (
                            <div className="text-xs text-blue-600 text-center mt-2 bg-blue-50 py-1 rounded">
                                Points Earned: {order.pointsEarned.toFixed(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>Thank you for your business!</p>
                    <p>e-MART Inc. | support@emart.com</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
