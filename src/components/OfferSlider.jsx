import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const OfferSlider = ({ products }) => {
    if (!products || products.length === 0) return null;

    // Duplicate products to create seamless loop effect if few products
    const displayProducts = products.length < 5 ? [...products, ...products, ...products] : products;

    return (
        <section className="py-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl overflow-hidden my-12 relative">
             <div className="px-8 mb-6 flex items-center justify-between relative z-10">
                <div>
                     <span className="text-red-500 font-bold tracking-wider uppercase text-sm">Limited Time Deals</span>
                     <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Mega Offers ⚡</h2>
                </div>
             </div>

            <div className="relative w-full overflow-hidden">
                <div className="flex w-max animate-scroll hover:pause px-4">
                    {displayProducts.map((product, index) => (
                        <div key={`${product.id}-${index}`} className="w-72 mx-4 flex-shrink-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                     {/* Duplicate set for seamless scrolling */}
                     {displayProducts.map((product, index) => (
                        <div key={`duplicate-${product.id}-${index}`} className="w-72 mx-4 flex-shrink-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default OfferSlider;
