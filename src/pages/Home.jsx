
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
// import { CATEGORIES } from '../data/mockData'; // REMOVED
import ProductCard from '../components/ProductCard';
import OfferSlider from '../components/OfferSlider';
import Button from '../components/Button';
import { getAllProducts } from '../services/productService';
import { getAllCategories } from '../services/categoryService';

import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    // State for New Arrivals and Offers
    const [newArrivals, setNewArrivals] = useState([]);
    const [offerProducts, setOfferProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const productRes = await getAllProducts();
                const allProducts = productRes.data;
                
                // Offers: discountPercent > 0
                const offers = allProducts.filter(p => p.discountPercent > 0);
                setOfferProducts(offers);

                setNewArrivals(allProducts.slice(0, 4));

                // Fetch Categories
                const categoryRes = await getAllCategories();
                setCategories(categoryRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    // Helper to get category image (Backend doesn't have image on Category entity yet based on previous check)
    // We might need a placeholder or logic to pick an image from a product in that category.
    // For now, let's use a placeholder or check if I missed image field in Category.java.
    // Category.java had: categoryId, categoryName, parentCategory. No image.
    // I can use a consistent placeholder or random Unsplash one for demo.
    const getCategoryImage = (cat) => {
        const name = cat.categoryName.toLowerCase().replace(/\s+/g, '');
        // Map based on file names found in static/images
        const imageMap = {
            'electronics': 'electronic.jpg',
            'fashion': 'fashion.jpg',
            'homeappliance': 'home.jpg',
            'beauty&personalcare': 'beautyandpersonalcare.jpg', 
            'beautyandpersonalcare': 'beautyandpersonalcare.jpg',
            'toysandbabyproducts': 'toys.jpg',
            'groceries': 'groceries.jpg',
            'decor': 'decor.jpg', 
            'stationary': 'stationery.jpg'
        };

        const filename = imageMap[name];
        if (filename) {
            return `http://localhost:8080/images/${filename}`;
        }
        
        // Fallback
        return 'https://images.unsplash.com/photo-1472851294608-4155121100f9?w=800&auto=format&fit=crop&q=80';
    };

    return (
        <div className="space-y-12">

            {/* Hero Section */}
            <section className="relative rounded-2xl overflow-hidden bg-gray-900 text-white shadow-2xl">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80"
                        alt="Shopping Banner"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                <div className="relative z-10 p-12 md:p-20 flex flex-col items-start justify-center min-h-[500px]">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                       {t('heroTitle')}
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-lg">
                        {t('heroSubtitle')}
                    </p>
                    <Link to="/emart-card">
                        <Button variant="primary" size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-500 border-none">
                            {t('getCard')}
                        </Button>
                    </Link>
                </div>
            </section>
            
            {/* Offer Slider */}
            {offerProducts.length > 0 && (
                <OfferSlider products={offerProducts} />
            )}

            {/* Categories */}
            <section className="px-4">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('shopCategory')}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('categorySub')}
                    </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8">
                    {categories.map((cat) => (
                        <Link key={cat.categoryId} to={`/catalog?category=${cat.categoryId}`} className="group relative w-64 h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <img
                                src={getCategoryImage(cat)}
                                alt={cat.categoryName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white text-2xl font-bold mb-2">{cat.categoryName}</h3>
                                <div className="flex items-center text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                                    <span>Explore</span>
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Home;
