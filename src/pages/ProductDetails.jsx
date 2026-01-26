
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { getProductById, getProductImageUrl } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    // Mock similar items (keep mock for now as backend doesn't support this specific query yet)
    // In a real app, you might fetch this based on categoryId after loading the main product
    const [similarItems, setSimilarItems] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductById(id);
                setProduct(response.data);

                // For now, clear similar items or keep them empty until we implement that endpoint
                // If we want to keep using mock data for similar items, we need to import PRODUCTS again, 
                // but let's keep it clean and maybe just hide the section or leave it empty for this step.
                setSimilarItems([]);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading product details...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const isCardHolder = user?.type === 'CARDHOLDER';
    // Backend Product model fields: normalPrice, ecardPrice
    const price = isCardHolder ? product.ecardPrice : product.normalPrice;
    const originalPrice = product.normalPrice;

    // Check if we have a valid image URL from backend or construct it
    const productImageUrl = getProductImageUrl(product.imageUrl);

    // Default missing backend fields
    const rating = 4.5; // Default/Mock
    const brand = product.subCategory?.brand || "Generic"; // Brand is on SubCategory
    const points = product.normalPrice; // Default points calculation
    const categoryId = product.subCategory?.category?.categoryId;

    return (
        <div className="max-w-7xl mx-auto">
            {categoryId && (
                <Link to={`/catalog?category=${categoryId}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Category
                </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery Mock */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <img src={productImageUrl} alt={product.name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=No+Image'; }} />
                    </div>
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center text-amber-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold ml-1 text-gray-900">{rating}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">{brand}</span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                        <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                            {isCardHolder && (
                                <span className="ml-3 text-lg text-gray-400 line-through">₹{originalPrice}</span>
                            )}
                        </div>

                        {isCardHolder ? (
                            <div className="space-y-2">
                                <p className="text-sm text-green-600 font-medium flex items-center">
                                    Member Savings: ₹{(originalPrice - price).toFixed(2)}
                                </p>
                                <p className="text-sm text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                                    Redeem with {points} pts
                                </p>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                <Link to="/register" className="text-blue-600 hover:underline">Join e-MART</Link> to save ₹{(originalPrice - (product.ecardPrice || product.normalPrice)).toFixed(2)} on this item!
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                                2 Year Warranty
                            </div>
                            <div className="flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-blue-500" />
                                Free Shipping
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                        </Button>
                        <Button variant="outline" size="lg">
                            Add to Wishlist
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
