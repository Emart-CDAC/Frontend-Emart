
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';

const Category = () => {
    const { id } = useParams();
    const categoryId = parseInt(id);
    const category = CATEGORIES.find(c => c.id === categoryId);

    const [products, setProducts] = useState([]);
    const [priceFilter, setPriceFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');

    useEffect(() => {
        // Filter products by category
        const filtered = PRODUCTS.filter(p => p.categoryId === categoryId);
        setProducts(filtered);
    }, [categoryId]);

    const displayedProducts = products.filter(p => {
        // Mock filtering logic
        const matchesPrice = priceFilter ? p.price.normal <= parseInt(priceFilter) : true;
        const matchesBrand = brandFilter ? p.brand.toLowerCase().includes(brandFilter.toLowerCase()) : true;
        return matchesPrice && matchesBrand;
    });

    if (!category) return <div className="text-center py-10">Category not found</div>;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="font-bold text-lg mb-4">Filters</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Max Price</label>
                            <Input
                                type="number"
                                placeholder="e.g. 1000"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Brand</label>
                            <Input
                                type="text"
                                placeholder="e.g. Sony"
                                value={brandFilter}
                                onChange={(e) => setBrandFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400">
                        Showing {displayedProducts.length} results
                    </div>
                </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                    <p className="text-gray-500 mt-2">Explore our collection of {category.name}</p>
                </div>

                {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No products found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Category;
