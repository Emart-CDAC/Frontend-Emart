import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut, Package, CreditCard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/mockData';
import Button from './Button';

import { getAllCategories } from '../services/categoryService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [categories, setCategories] = useState([]); // Real categories

  const profileRef = useRef(null);
  
  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const res = await getAllCategories();
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories logic", err);
        }
    };
    fetchCats();
  }, []);

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/catalog?search=${searchQuery}`);
      setSearchQuery(''); 
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve username safely
  const displayName =
    user?.username ||
    user?.fullName ||
    (user?.email ? user.email.split('@')[0] : '');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="/e-MART_logo.png"
              alt="e-MART Logo"
              className="h-28 w-auto"
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>

            {user?.type === 'ADMIN' && (
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Admin
              </Link>
            )}

            {/* Auth Buttons
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Hello, <span className="font-semibold">{user.fullName || user.email || 'User'}</span>
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
              </div> */}
            {/* )} */}

            {/* Categories */}
            <div className="relative group h-full flex items-center">
              <Link 
                to="/catalog"
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Categories
              </Link>
              <div className="absolute left-0 top-full w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border -mt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.categoryId}
                    to={`/catalog?category=${cat.categoryId}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {cat.categoryName}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-64 px-4 py-1.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* RIGHT SECTION */}
            <div ref={profileRef} className="relative flex items-center gap-4">
              {user && (
                <span className="hidden md:block text-sm text-gray-700">
                  Hello,&nbsp;
                  <span className="font-semibold">{displayName}</span>
                </span>
              )}

              <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setOpenProfile((prev) => !prev)}
                className="text-gray-600 hover:text-blue-600"
              >
                <UserIcon className="h-7 w-7" />
              </button>

              {/* Profile Dropdown */}
              {openProfile && (
                <div className="absolute right-0 top-14 w-64 bg-white shadow-xl rounded-xl border p-4 z-50">
                  {!user ? (
                    <>
                      <div className="space-y-3">
                        <p className="font-semibold text-gray-900">Welcome</p>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate('/login');
                          }}
                        >
                          Login
                        </Button>
                      </div>

                      {/* Nested Mobile Menu content from original snippet */}
                      {isMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 mt-4">
                          <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            {CATEGORIES.map(cat => (
                              <Link key={cat.id} to={`/category/${cat.id}`} className="block px-3 py-2 rounded-md text-base" onClick={() => setIsMenuOpen(false)}>
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-3">
                        <p className="font-bold text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg text-sm mb-4">
                        <span className="text-blue-700 font-medium">e-Points</span>
                        <span className="font-bold text-blue-900">{user.ePoints ?? 0}</span>
                      </div>

                      <Link
                        to="/orders"
                        onClick={() => setOpenProfile(false)}
                        className="w-full flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg mb-1"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        My Orders
                      </Link>

                      <Link
                        to="/emart-card"
                        onClick={() => setOpenProfile(false)}
                        className="w-full flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg mb-1"
                      >
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        e-MART Card
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenProfile(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* BOTTOM MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block">Home</Link>
              {categories.map((cat) => (
                <Link
                  key={cat.categoryId}
                  to={`/catalog?category=${cat.categoryId}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  {cat.categoryName}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;