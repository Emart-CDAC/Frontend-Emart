
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/mockData';
import Button from './Button';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-blue-600">e-MART</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>

                        <div className="relative group">
                            <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
                                Categories
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                                {CATEGORIES.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/catalog?category=${cat.id}`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>


                        {user?.type === 'ADMIN' && (
                            <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                                Admin
                            </Link>
                        )}

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-700">
                                    Hello, <span className="font-semibold">{user.name}</span>
                                    {user.type === 'CARDHOLDER' && <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Member</span>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-1" /> Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <motion.span
                                    key={cartCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1.2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        {user?.type === 'ADMIN' && (
                            <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                        )}
                        {CATEGORIES.map(cat => (
                            <Link
                                key={cat.id}
                                to={`/category/${cat.id}`}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        {!user && (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                            </>
                        )}
                        {user && (
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false) }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
