
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ categories, activeCategory, activeChildCategory, activeSubcategory, onSelectCategory, onSelectChildCategory, onSelectSubcategory }) => {
    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Categories
            </h2>

            <div className="space-y-1">
                {categories.map((category) => (
                    <div key={category.id} className="overflow-hidden">
                        {/* LEVEL 1: PARENT CATEGORY */}
                        <button
                            onClick={() => onSelectCategory(category)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory?.id === category.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span>{category.name}</span>
                            {activeCategory?.id === category.id ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        <AnimatePresence>
                            {activeCategory?.id === category.id && category.children && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pl-4"
                                >
                                    <div className="border-l-2 border-gray-100 pl-2 mt-1 space-y-1">
                                        
                                        {/* OPTION TO VIEW ALL IN PARENT */}
                                        <button
                                            onClick={() => { onSelectChildCategory(null); onSelectSubcategory(null); }}
                                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${!activeChildCategory
                                                ? 'text-blue-600 font-semibold'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            View All {category.name}
                                        </button>

                                        {/* LEVEL 2: CHILD CATEGORIES */}
                                        {category.children.map((child) => (
                                            <div key={child.id}>
                                                <button
                                                    onClick={() => onSelectChildCategory(child)}
                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${activeChildCategory?.id === child.id
                                                            ? 'text-blue-600 font-medium bg-blue-50'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {child.name}
                                                    {activeChildCategory?.id === child.id && (
                                                         <ChevronDown className="w-3 h-3 text-blue-500" />
                                                    )}
                                                </button>

                                                {/* LEVEL 3: BRANDS (SUBCATEGORIES) */}
                                                <AnimatePresence>
                                                    {activeChildCategory?.id === child.id && child.subcategories && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            className="pl-4 mt-1"
                                                        >
                                                            {child.subcategories.map((brand) => (
                                                                <button
                                                                    key={brand.id}
                                                                    onClick={() => onSelectSubcategory(brand)}
                                                                    className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${activeSubcategory?.id === brand.id
                                                                            ? 'text-blue-700 bg-blue-100 font-medium'
                                                                            : 'text-gray-500 hover:text-gray-700'
                                                                        }`}
                                                                >
                                                                    {brand.name}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
