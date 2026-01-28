import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { CATEGORIES } from '../data/mockData'; // REMOVED
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';
import { getAllProducts, searchProducts } from '../services/productService';
import { getAllCategories, getSubCategoriesByCategoryId, getChildCategories } from '../services/categoryService';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategoryId = parseInt(searchParams.get('category'));

    // State-Driven Navigation
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeChildCategory, setActiveChildCategory] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [products, setProducts] = useState([]); // Master list from backend
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filters
    const [priceRange, setPriceRange] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Initial Data (Only on mount or search change)
    useEffect(() => {
        const fetchMasterData = async () => {
             // Always fetch categories on mount
             try {
                const categoryRes = await getAllCategories();
                const mappedCategories = categoryRes.data.map(c => ({
                    id: c.categoryId,
                    name: c.categoryName,
                    subcategories: []
                }));
                // Only set if empty to avoid overwriting existing subcats during re-renders
                setCategories(prev => prev.length === 0 ? mappedCategories : prev);
             } catch (err) {
                 console.error("Error fetching categories:", err);
             }
        };

        const fetchProductsData = async () => {
             const searchQuery = searchParams.get('search');
             try {
                if (searchQuery) {
                    console.log("Searching for:", searchQuery);
                    const searchRes = await searchProducts(searchQuery);
                    setProducts(searchRes.data);
                    setSearchTerm(searchQuery);
                } else {
                    const productRes = await getAllProducts();
                    setProducts(productRes.data);
                }
             } catch (err) {
                 console.error("Error fetching products:", err);
             }
        };

        fetchMasterData();
        fetchProductsData();

    }, [searchParams.get('search')]); // Only re-run if SEARCH string changes, not category

    // Sync Active Category with URL
    useEffect(() => {
        if (initialCategoryId && categories.length > 0) {
            const cat = categories.find(c => c.id === initialCategoryId);
            if (cat) {
                 // Only trigger select if it's different to avoid loops/redundata
                 if (activeCategory?.id !== cat.id) {
                     handleSyncCategory(cat);
                 }
            }
        } else if (!initialCategoryId && activeCategory) {
            // URL cleared, so clear state
            setActiveCategory(null);
            setActiveSubcategory(null);
        }
    }, [initialCategoryId, categories]);


    // Update Products when state changes
    useEffect(() => {
        let results = products;

        if (activeCategory) {
            results = results.filter(p => 
                p.subCategory?.category?.categoryId === activeCategory.id || 
                p.subCategory?.category?.parentCategory?.categoryId === activeCategory.id ||
                p.subCategory?.category?.parentCategory?.categoryId === activeCategory.id
            );
        }

        if (activeChildCategory) {
            results = results.filter(p => p.subCategory?.category?.categoryId === activeChildCategory.id);
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

    }, [products, activeCategory, activeChildCategory, activeSubcategory, priceRange, searchTerm]);

    // Internal logic to load subcategories and set state (Called by Effect)
    const handleSyncCategory = async (category) => {
        setActiveCategory(category);
        setActiveChildCategory(null);
        setActiveSubcategory(null); 

        // 1. Fetch Children Categories (Level 2)
        if (!category.children) {
            try {
                const res = await getChildCategories(category.id);
                const children = res.data.map(c => ({
                    id: c.categoryId,
                    name: c.categoryName,
                    subcategories: [] // These will hold Brands later
                }));

                setCategories(prev => prev.map(c =>
                    c.id === category.id ? { ...c, children: children } : c
                ));
                setActiveCategory({ ...category, children: children });
            } catch (err) {
                console.error("Error fetching child categories:", err);
            }
        }
    };

    const handleChildCategorySelect = async (child) => {
        setActiveChildCategory(child);
        setActiveSubcategory(null);

        // 2. Fetch Brands (Level 3) for this Child
        if (!child.subcategories || child.subcategories.length === 0) {
            try {
                const res = await getSubCategoriesByCategoryId(child.id);
                const brands = res.data.map(sc => ({
                    id: sc.subCategoryId,
                    name: sc.brand || `Brand ${sc.subCategoryId}`,
                    ...sc
                }));
                
                // Let's update the specific child in the activeCategory.children array
                const updatedChildren = activeCategory.children.map(c => 
                    c.id === child.id ? { ...c, subcategories: brands } : c
                );
                
                const updatedCategory = { ...activeCategory, children: updatedChildren };
                
                setActiveCategory(updatedCategory);
                
                setCategories(prev => prev.map(c => 
                    c.id === activeCategory.id ? updatedCategory : c
                ));

            } catch (err) {
                console.error("Error fetching brands:", err);
            }
        }
    }

    // User Click Action -> Just Updates URL
    const handleCategorySelect = (category) => {
        setSearchParams(prev => {
            prev.set('category', category.id);
            return prev;
        });
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar */}
            <Sidebar
                categories={categories}
                activeCategory={activeCategory}
                activeChildCategory={activeChildCategory}
                activeSubcategory={activeSubcategory}
                onSelectCategory={handleCategorySelect}
                onSelectChildCategory={handleChildCategorySelect}
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
