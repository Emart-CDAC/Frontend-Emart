
import { ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { getProductImageUrl } from '../services/productService'; // Import from service

const ProductCard = ({ product }) => {
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

    // Removed local helper in favor of centralized one


    const isCardHolder = user?.type === 'CARDHOLDER';

    // Determine price based on schema (Backend: flat fields, Mock: nested object)
    const normalPrice = product.normalPrice !== undefined ? product.normalPrice : product.price?.normal;
    const cardPrice = product.ecardPrice !== undefined ? product.ecardPrice : product.price?.cardHolder;

    const price = isCardHolder ? cardPrice : normalPrice;
    const originalPrice = normalPrice;

    const imageUrl = getProductImageUrl(product.imageUrl || product.image);
    const rating = product.rating || 4.5; // Default if missing
    // Backend has brand on subCategory
    const brand = product.brand || product.subCategory?.brand || "Generic";

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full"
        >
            <Link to={`/product/${product.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-200">
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                        <span className="text-xs font-bold text-gray-700">{rating}</span>
                    </div>
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{brand}</p>

                <div className="mt-auto">
                    {isCardHolder && (
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-gray-400 line-through">${originalPrice}</span>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Save ${(originalPrice - price).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-gray-900">${price}</span>
                        {isCardHolder && product.pointsRedemption && (
                            <span className="text-xs text-blue-600 font-medium">
                                Or {product.pointsRedemption.points} pts + ${product.pointsRedemption.cashComponent}
                            </span>
                        )}
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
