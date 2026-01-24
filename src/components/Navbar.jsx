import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/mockData';
import Button from './Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef(null);

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

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

            {/* Categories */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium">
                Categories
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border">
                {CATEGORIES.map((cat) => (
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

            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              className="w-64 px-4 py-1.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* RIGHT SECTION */}
            <div ref={profileRef} className="relative flex items-center gap-4">

              {/* Hello Username (ONLY after login) */}
              {user && (
                <span className="hidden md:block text-sm text-gray-700">
                  Hello,&nbsp;
                  <span className="font-semibold">
                    {displayName}
                  </span>
                </span>
              )}

              {/* Cart */}
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

              {/* Profile Icon */}
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
                  ) : (
                    <>
                      {/* USER INFO */}
                      <div className="mb-3">
                        <p className="font-bold text-gray-900">
                          {displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      {/* e-Points */}
                      <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg text-sm mb-4">
                        <span className="text-blue-700 font-medium">
                          e-Points
                        </span>
                        <span className="font-bold text-blue-900">
                          {user.ePoints ?? 0}
                        </span>
                      </div>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenProfile(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
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
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                onClick={() => setIsMenuOpen(false)}
                className="block"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
