import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { getProductById, getProductImageUrl } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const { addToCart } = useCart();

    // ✅ SINGLE source of truth
    const resolvedUserId = user?.id;
    // Check eligibility
    const isCardHolder = user?.type === 'CARDHOLDER';

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

    const price = product?.normalPrice || 0;
    const discount = product?.discountPercent || 0;
    const isDiscounted = discount > 0;
    const offerPrice = isDiscounted ? Math.ceil(price - (price * discount / 100)) : price;

    // Handle incoming state from ProductCard
    useEffect(() => {
        if (product && !isDiscounted && isCardHolder && location.state?.redeemEpoints) {
            setPurchaseType('PARTIAL_EP');
            setPartialPoints(Math.ceil(price * 0.37));
        }
    }, [product, isDiscounted, isCardHolder, location.state, price]);

    const imageUrl = product ? getProductImageUrl(product.imageUrl) : '';

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
                // FIXED 37%
                epointsUsed = Math.ceil(price * 0.37);
             } else if (purchaseType === 'FULL_EP') {
                 // Backend handles calculation usually but let's be explicit
                 epointsUsed = Math.ceil(price);
             }
        }

        addToCart(product, 1, finalPurchaseType, epointsUsed);
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!product) return null;

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

                        {!isDiscounted && isCardHolder && (
                            <>
                                {/* NORMAL */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={purchaseType === 'NORMAL'}
                                        onChange={() => setPurchaseType('NORMAL')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    Normal Purchase
                                </label>

                                {/* PARTIAL */}
                                <label className="flex flex-col gap-2 mt-3 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={purchaseType === 'PARTIAL_EP'}
                                            onChange={() => {
                                                setPurchaseType('PARTIAL_EP');
                                                setPartialPoints(Math.ceil(price * 0.37));
                                            }}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        Partial e-Points
                                    </div>

                                    {purchaseType === 'PARTIAL_EP' && (
                                        <div className="ml-7 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                                            <p className="font-bold text-blue-800">37% e-Points applied (fixed)</p>
                                            <p className="text-blue-600 mt-1">
                                                Points used: <span className="font-mono font-bold">{Math.ceil(price * 0.37)}</span>
                                            </p>
                                            <p className="text-blue-600">
                                                Payable: <span className="font-mono font-bold">₹{Math.floor(price * 0.63)}</span> <span className="text-xs">+ taxes</span>
                                            </p>
                                        </div>
                                    )}
                                </label>

                                {/* FULL */}
                                <label className="flex items-center gap-3 mt-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={purchaseType === 'FULL_EP'}
                                        onChange={() => setPurchaseType('FULL_EP')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    Full e-Points ({Math.ceil(price)} pts)
                                </label>
                            </>
                        )}
                        
                        {!isCardHolder && !isDiscounted && (
                             <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-500 italic">
                                 e-Points redemption available for e-MART Card holders only.
                             </div>
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
