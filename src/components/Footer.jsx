import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/APMD LOGO_WHITE.png';

const Footer = () => {
  const { user } = useAuthStore();

  return (
    <footer className="bg-neutral text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="APlusMedDepot logo" className="h-10 w-auto object-contain" />
              <span className="font-display text-xl">
                <span className="text-white">APlusMedDepot</span>
                {/* <span className="text-primary">APlus</span><span className="text-lightblue">MedDepot</span> */}
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for quality medical supplies and equipment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-primary transition-colors">
                    Become a Vendor
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Conditional: For Customers (logged in) OR For You (not logged in) */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{user ? 'My Account' : 'Get Started'}</h3>
            <ul className="space-y-2 text-sm">
              {user ? (
                <>
                  <li>
                    <Link to="/orders" className="text-gray-300 hover:text-primary transition-colors">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-gray-300 hover:text-primary transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="text-gray-300 hover:text-primary transition-colors">
                      Shopping Cart
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-300 hover:text-primary transition-colors">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="text-gray-300 hover:text-primary transition-colors">
                      Browse Products
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a href="mailto:support@aplusmeddepot.com" className="text-gray-300 hover:text-primary transition-colors">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                 125 Fairfield Way, Suite 103<br />
                  Bloomingdale, IL 60108 USA
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:1-800-555-0199" className="text-gray-300 hover:text-primary transition-colors">
                  1-866-513-1132
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:support@aplusmeddepot.com" className="text-gray-300 hover:text-primary transition-colors">
                  support@aplusmeddepot.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; 2024 APlusMedDepot. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
              <a href="mailto:support@aplusmeddepot.com" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
