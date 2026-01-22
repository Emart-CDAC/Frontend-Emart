
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ categories, activeCategory, activeSubcategory, onSelectCategory, onSelectSubcategory }) => {
    // Local state for expanded items to allow multiple expansions if needed
    // But per requirements, clicking a category expands it.

    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Categories
            </h2>

            <div className="space-y-1">
                {categories.map((category) => (
                    <div key={category.id} className="overflow-hidden">
                        <button
                            onClick={() => onSelectCategory(category)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory?.id === category.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span>{category.name}</span>
                            {category.subcategories && (
                                activeCategory?.id === category.id ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        <AnimatePresence>
                            {activeCategory?.id === category.id && category.subcategories && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                                    <div className="pl-4 pr-2 py-1 space-y-1">
                                        <button
                                            onClick={() => onSelectSubcategory(null)} // Select "All" in category
                                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${!activeSubcategory
                                                    ? 'bg-blue-100 text-blue-800 font-medium'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            View All
                                        </button>
                                        {category.subcategories.map((sub) => (
                                            <button
                                                key={sub.id}
                                                onClick={() => onSelectSubcategory(sub)}
                                                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeSubcategory?.id === sub.id
                                                        ? 'bg-blue-100 text-blue-800 font-medium'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {sub.name}
                                            </button>
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
