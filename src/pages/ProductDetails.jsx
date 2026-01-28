import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { getProductById, getProductImageUrl } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const { addToCart } = useCart();

    // ✅ SINGLE source of truth
    const resolvedUserId = user?.id;

    const [purchaseType, setPurchaseType] = useState('NORMAL');
    const [partialPoints, setPartialPoints] = useState(0);



    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response.data);
            } catch (err) {
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!product) return null;

    const price = product.normalPrice;
    const discount = product.discountPercent || 0;
    const isDiscounted = discount > 0;
    const offerPrice = isDiscounted ? Math.ceil(price - (price * discount / 100)) : price;

    const imageUrl = getProductImageUrl(product.imageUrl);

    // ✅ Enforce Normal Purchase for discounted items
    const handleAddToCart = () => {
        if (!resolvedUserId) {
            navigate('/login');
            return;
        }

        let epointsUsed = 0;
        let finalPurchaseType = purchaseType;

        if (isDiscounted) {
             finalPurchaseType = 'NORMAL';
             epointsUsed = 0;
        } else {
             if (purchaseType === 'PARTIAL_EP') {
                epointsUsed = partialPoints;
             }
             // FULL_EP → backend calculates or sends 0 depending on logic, keeping existing flow
        }

        addToCart(product, 1, finalPurchaseType, epointsUsed);
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <Link to="/" className="inline-flex items-center text-gray-500 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white rounded-xl overflow-hidden h-[500px] flex items-center justify-center p-6 border border-gray-200 shadow-sm">
                    <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain" 
                    />
                </div>

                <div>
                    <h1 className="text-4xl font-bold mb-2">{product.name}</h1>

                    <div className="flex items-center mb-4 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1 font-semibold">4.5</span>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl mb-6">
                        {isDiscounted ? (
                            <div className="mb-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-red-600">₹{offerPrice}</span>
                                    <span className="text-xl text-gray-400 line-through">₹{price}</span>
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                                        {discount}% OFF
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    *Special Offer Price. e-Points redemption is not applicable on this item.
                                </p>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold mb-4">₹{price}</div>
                        )}

                        {!isDiscounted && (
                            <>
                                {/* NORMAL */}
                                <label className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        checked={purchaseType === 'NORMAL'}
                                        onChange={() => setPurchaseType('NORMAL')}
                                    />
                                    Normal Purchase
                                </label>

                                {/* PARTIAL */}
                                <label className="flex flex-col gap-2 mt-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={purchaseType === 'PARTIAL_EP'}
                                            onChange={() => {
                                                setPurchaseType('PARTIAL_EP');
                                                setPartialPoints(Math.ceil(price * 0.5));
                                            }}
                                        />
                                        Partial e-Points
                                    </div>

                                    {purchaseType === 'PARTIAL_EP' && (
                                        <input
                                            type="number"
                                            min="0"
                                            max={Math.ceil(price)}
                                            value={partialPoints}
                                            onChange={(e) =>
                                                setPartialPoints(Math.min(+e.target.value || 0, Math.ceil(price)))
                                            }
                                            className="border p-2 rounded"
                                        />
                                    )}
                                </label>

                                {/* FULL */}
                                <label className="flex items-center gap-3 mt-2">
                                    <input
                                        type="radio"
                                        checked={purchaseType === 'FULL_EP'}
                                        onChange={() => setPurchaseType('FULL_EP')}
                                    />
                                    Full e-Points ({Math.ceil(price)})
                                </label>
                            </>
                        )}
                    </div>

                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex gap-6 text-sm text-gray-500 mb-6">
                        <span className="flex items-center"><ShieldCheck className="mr-1" /> Warranty</span>
                        <span className="flex items-center"><Truck className="mr-1" /> Free Delivery</span>
                    </div>

                    {/* ✅ FIXED BUTTON */}
                    <Button
                        size="lg"
                        disabled={!resolvedUserId}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
