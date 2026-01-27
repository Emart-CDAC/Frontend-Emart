import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { CATEGORIES } from '../data/mockData'; // REMOVED
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';
import { getAllProducts, searchProducts } from '../services/productService';
import { getAllCategories, getSubCategoriesByCategoryId } from '../services/categoryService';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategoryId = parseInt(searchParams.get('category'));

    // State-Driven Navigation
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [products, setProducts] = useState([]); // Master list from backend
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filters
    const [priceRange, setPriceRange] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const searchQuery = searchParams.get('search');

                if (searchQuery) {
                    // Search Mode
                    console.log("Searching for:", searchQuery);
                    const searchRes = await searchProducts(searchQuery);
                    setProducts(searchRes.data);
                    setSearchTerm(searchQuery); // Set local filter input too
                } else {
                    // Normal Catalog Mode
                    const productRes = await getAllProducts();
                    setProducts(productRes.data);
                }

                // Fetch Categories
                const categoryRes = await getAllCategories();
                const mappedCategories = categoryRes.data.map(c => ({
                    id: c.categoryId,
                    name: c.categoryName,
                    subcategories: []
                }));
                setCategories(mappedCategories);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchInitialData();
    }, [searchParams]); // Re-run when URL params change (e.g. searching again)

    // Load initial category from URL
    useEffect(() => {
        if (initialCategoryId && categories.length > 0) {
            const cat = categories.find(c => c.id === initialCategoryId);
            if (cat) {
                handleCategorySelect(cat);
            }
        }
    }, [initialCategoryId, categories]); // Dependencies updated


    // Update Products when state changes
    useEffect(() => {
        let results = products;

        if (activeCategory) {
            results = results.filter(p => p.subCategory?.category?.categoryId === activeCategory.id);
        }

        if (activeSubcategory) {
            results = results.filter(p => p.subCategory?.subCategoryId === activeSubcategory.id);
        }

        if (priceRange) {
            // Backend fields are normalPrice or ecardPrice.
            results = results.filter(p => {
                const price = p.normalPrice !== undefined ? p.normalPrice : (p.price?.normal || 0);
                return price <= parseInt(priceRange);
            });
        }

        if (searchTerm) {
            results = results.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(results);

    }, [products, activeCategory, activeSubcategory, priceRange, searchTerm]);

    const handleCategorySelect = async (category) => {
        if (activeCategory?.id === category.id) {
            // Already active, maybe just reset subcat?
            // setActiveSubcategory(null); 
        } else {
            setActiveCategory(category);
            setActiveSubcategory(null); // Reset subcat

            // Fetch Subcategories if not present
            if (!category.subcategories || category.subcategories.length === 0) {
                try {
                    const res = await getSubCategoriesByCategoryId(category.id);
                    // Map backend subcategory: { subCategoryId, brand, category, ... } 
                    // to frontend: { id: subCategoryId, name: brand? Wait. SubCategory name? }
                    // Viewing SubCategory.java: only "brand" and "sponsors". 
                    // Wait, where is the subcategory Name?
                    // Ah, SubCategory table might be relying on "Brand" as the name? Or maybe I missed a field.
                    // Let's assume Brand is the name for now, or check if there is a 'name' field I missed.
                    // Re-checking SubCategory.java: private String brand; private boolean sponsors;
                    // No 'name'. So 'Brand' essentially acts as the subcategory discriminator here?
                    // Or maybe 'SubCategory' implies specific types like 'Smartphones' -> Brand: Apple?
                    // The mock data had "Smartphones", "Laptops". 
                    // This data model seems to map Category -> SubCategory (which has Brand).
                    // This implies the navigation is Category -> Brand.
                    // Let's use 'brand' as the name for the sidebar list.

                    const subcats = res.data.map(sc => ({
                        id: sc.subCategoryId,
                        name: sc.brand || `SubCategory ${sc.subCategoryId}`,
                        ...sc
                    }));

                    // Update categories state with new subcats to persist them
                    setCategories(prev => prev.map(c =>
                        c.id === category.id ? { ...c, subcategories: subcats } : c
                    ));

                    // Also update the active category reference to include these new subcats immediately for UI
                    setActiveCategory({ ...category, subcategories: subcats });

                } catch (err) {
                    console.error("Error fetching subcategories:", err);
                }
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar */}
            <Sidebar
                categories={categories}
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
