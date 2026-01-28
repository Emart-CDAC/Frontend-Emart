
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

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent link navigation
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    const isCardHolder = user?.type === 'CARDHOLDER';

    // Determine pricing
    const discountPercent = product.discountPercent || 0;
    const normalPrice = product.normalPrice !== undefined ? product.normalPrice : (product.price?.normal || 0);
    
    // Calculate effective price (Frontend calculation to match Backend logic)
    let effectivePrice = normalPrice;
    if (discountPercent > 0) {
        effectivePrice = normalPrice - (normalPrice * discountPercent / 100);
    }

    // Cardholder logic: If card price is lower than effective price, they might pay that? 
    // Or does discount override? Assuming discount applies to normal price.
    // Let's display effective price as the main selling price.
    const priceToDisplay = effectivePrice;
    const isDiscounted = discountPercent > 0;

    const imageUrl = getProductImageUrl(product.imageUrl || product.image);
    const rating = product.rating || 4.5;
    const brand = product.brand || product.subCategory?.brand || "Generic";

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full group"
        >
            <Link to={`/product/${product.id}`} className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                />
                
                {/* Discount Badge */}
                {isDiscounted && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md">
                        {discountPercent}% OFF
                    </div>
                )}
                
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center shadow-sm border border-gray-100">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                    <span className="text-xs font-bold text-gray-700">{rating}</span>
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-grow relative">
                <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-gray-900 font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 text-lg">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3">{brand}</p>

                <div className="mt-auto pt-3 border-t border-dashed border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            {isDiscounted ? (
                                <>
                                    <span className="text-xs text-gray-400 line-through font-medium">₹{normalPrice}</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{priceToDisplay.toFixed(2)}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-gray-900">₹{normalPrice}</span>
                            )}
                        </div>
                        
                         {/* Optional points display if needed, removing card holder specific for now to focus on discount */}
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        className="w-full rounded-xl py-2.5 font-semibold shadow-none bg-gray-900 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all"
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
