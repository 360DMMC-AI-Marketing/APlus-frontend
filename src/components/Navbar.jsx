import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Store } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAdmin, isVendor, isCustomer } = useAuthStore();
  const itemsCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* <img src={logo} alt="APlusMedDepot logo" className="h-14 w-auto object-contain" /> */}
            <span className="font-display text-2xl text-secondary">
              {/* APlusMed<span className="text-primary">Depot</span> */}
               <span className="text-primary">APlus</span><span className="text-lightblue">MedDepot</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-secondary transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">Products</Link>
            <Link to="/about" className="text-gray-700 hover:text-secondary transition-colors">About Us</Link>
            {isAdmin && isAdmin() && (
              <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}
            {isVendor && isVendor() && (
              <Link to="/vendor" className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1">
                <Store className="w-4 h-4" /> Vendor Portal
              </Link>
            )}
            {!user && (
              <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1">
                <Store className="w-4 h-4" /> Sell on APlusMed
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart — customer only */}
            {user && isCustomer && isCustomer() && (
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{(user.firstName || user.name || user.email || '?')[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-gray-700 max-w-[120px] truncate">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || user.email}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-neutral truncate">{user.email}</p>
                    </div>
                    {isAdmin() && (
                      <Link to="/admin" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /><span>Admin Panel</span>
                      </Link>
                    )}
                    {isVendor && isVendor() && (
                      <Link to="/vendor" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <Store className="w-4 h-4" /><span>Vendor Portal</span>
                      </Link>
                    )}
                    {isCustomer && isCustomer() && (
                      <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" /><span>My Profile</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /><span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-secondary hover:text-secondary/80 font-semibold transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-down border-t border-gray-100 space-y-1">
            <Link to="/" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link to="/about" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            {user && isCustomer && isCustomer() && (
              <Link to="/cart" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Cart {itemsCount > 0 && `(${itemsCount})`}
              </Link>
            )}
            {user ? (
              <>
                {isAdmin() && <Link to="/admin" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
                {isVendor && isVendor() && <Link to="/vendor" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Vendor Portal</Link>}
                {isCustomer && isCustomer() && <Link to="/profile" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 text-gray-700 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
