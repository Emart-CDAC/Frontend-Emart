
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategoryId = parseInt(searchParams.get('category'));

    // State-Driven Navigation
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filters
    const [priceRange, setPriceRange] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Load initial state from URL if present (Shim for strict routing rule compatibility)
    useEffect(() => {
        if (initialCategoryId) {
            const cat = CATEGORIES.find(c => c.id === initialCategoryId);
            if (cat) setActiveCategory(cat);
        } else {
            // Default to first category if none selected, or show all? 
            // Valid requirement: "Initial State: Show all main categories" -> but Sidebar design suggests one active.
            // Let's default to the first one for "Store" feel, or null to show Landing.
            // Requirement says "Show all main categories" initially.
        }
    }, [initialCategoryId]);

    // Update Products when state changes
    useEffect(() => {
        let results = PRODUCTS;

        if (activeCategory) {
            results = results.filter(p => p.categoryId === activeCategory.id);
        }

        if (activeSubcategory) {
            results = results.filter(p => p.subcategoryId === activeSubcategory.id);
        }

        if (priceRange) {
            results = results.filter(p => p.price.normal <= parseInt(priceRange));
        }

        if (searchTerm) {
            results = results.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(results);

        // Update URL silently without reload (optional, good for bookmarking)
        // const params = {};
        // if (activeCategory) params.category = activeCategory.id;
        // setSearchParams(params, { replace: true });

    }, [activeCategory, activeSubcategory, priceRange, searchTerm]);

    const handleCategorySelect = (category) => {
        if (activeCategory?.id === category.id) {
            // Toggle off? Or stay on? usually stay. 
            // Requirement: "Progressive Category Navigation"
        } else {
            setActiveCategory(category);
            setActiveSubcategory(null); // Reset subcat
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar */}
            <Sidebar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                activeSubcategory={activeSubcategory}
                onSelectCategory={handleCategorySelect}
                onSelectSubcategory={setActiveSubcategory}
            />

            {/* Main Content Area */}
            <div className="flex-1 min-h-[600px]">
                {/* Breadcrumbs & Header */}
                <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}>Home</span>
                        {activeCategory && (
                            <>
                                <span className="mx-2">/</span>
                                <span className="font-medium text-gray-900">{activeCategory.name}</span>
                            </>
                        )}
                        {activeSubcategory && (
                            <>
                                <span className="mx-2">/</span>
                                <span className="font-medium text-gray-900">{activeSubcategory.name}</span>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {activeSubcategory ? activeSubcategory.name : activeCategory ? activeCategory.name : 'All Products'}
                        </h1>

                        {/* Quick Filters */}
                        <div className="flex gap-4">
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 text-sm"
                            />
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-32 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Grid with Animations */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-50 rounded-xl"
                    >
                        <p className="text-gray-500">No products found matching your selection.</p>
                        <button onClick={() => { setPriceRange(''); setSearchTerm('') }} className="text-blue-600 mt-2 hover:underline">Clear Filters</button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
