import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VendorLayout from './components/VendorLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AboutPage from './pages/AboutPage';
import CustomerProfile from './pages/CustomerProfile';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VendorAgreementPage from './pages/VendorAgreementPage';
import CommissionPolicyPage from './pages/CommissionPolicyPage';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCompliance from './pages/admin/AdminCompliance'; // B-03 fix: was imported but never routed

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorSettings from './pages/vendor/VendorSettings';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, vendorOnly = false }) => {
  const { user, isAdmin, isVendor } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (vendorOnly && !isVendor()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          
          {/* Public Routes with Navbar + Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <HomePage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/login" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <LoginPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/register" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <RegisterPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/products" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <ProductsPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/products/:id" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <ProductDetailPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/about" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <AboutPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/privacy-policy" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <PrivacyPolicyPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/terms-of-service" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <TermsOfServicePage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/vendor-agreement" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <VendorAgreementPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/commission-policy" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <CommissionPolicyPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/forgot-password" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <ForgotPasswordPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/reset-password" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <ResetPasswordPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/verify-email" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <EmailVerificationPage />
              </main>
              <Footer />
            </>
          } />

          {/* Protected Customer Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <CartPage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <CheckoutPage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          <Route path="/payment" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <PaymentPage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          <Route path="/order-confirmation/:orderId" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <OrderConfirmationPage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <OrderHistoryPage />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-grow">
                  <CustomerProfile />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          } />

          {/* Vendor Portal Routes */}
          <Route path="/vendor" element={
            <ProtectedRoute vendorOnly>
              <VendorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<VendorDashboard />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="analytics" element={<VendorAnalytics />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="compliance" element={<AdminCompliance />} /> {/* B-03 fix: was missing */}
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow flex items-center justify-center py-20">
                <div className="text-center">
                  <h1 className="text-6xl font-display text-primary mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="btn-medical">
                    Go to Homepage
                  </a>
                </div>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
