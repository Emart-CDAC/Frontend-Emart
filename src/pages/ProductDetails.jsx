
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === parseInt(id));
    const { user } = useAuth();
    const { addToCart } = useCart();

    if (!product) return <div className="text-center py-20">Product not found</div>;

    const isCardHolder = user?.type === 'CARDHOLDER';
    const price = isCardHolder ? product.price.cardHolder : product.price.normal;
    const originalPrice = product.price.normal;

    // Mock similar items (same category, different id)
    const similarItems = PRODUCTS.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 3);

    return (
        <div className="max-w-7xl mx-auto">
            <Link to={`/category/${product.categoryId}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Category
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery Mock */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500">
                                <img src={product.image} alt="thumbnail" className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center text-amber-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold ml-1 text-gray-900">{product.rating}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">{product.brand}</span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                        <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">${price}</span>
                            {isCardHolder && (
                                <span className="ml-3 text-lg text-gray-400 line-through">${originalPrice}</span>
                            )}
                        </div>

                        {isCardHolder ? (
                            <div className="space-y-2">
                                <p className="text-sm text-green-600 font-medium flex items-center">
                                    Member Savings: ${originalPrice - price}
                                </p>
                                {product.pointsRedemption && (
                                    <p className="text-sm text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                                        Redeem with {product.pointsRedemption.points} pts + ${product.pointsRedemption.cashComponent}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                <Link to="/register" className="text-blue-600 hover:underline">Join e-MART</Link> to save ${originalPrice - product.price.cardHolder} on this item!
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
                        <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
                            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                        </Button>
                        <Button variant="outline" size="lg">
                            Add to Wishlist
                        </Button>
                    </div>
                </div>
            </div>

            {/* Similar Items */}
            {similarItems.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarItems.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetails;
