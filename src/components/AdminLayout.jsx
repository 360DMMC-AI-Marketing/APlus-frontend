import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package as ProductIcon, Users, Store, BarChart2, Shield, LogOut, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/APMD Logo_WHITE.png';
import { getAdminSuppliers } from '../api/admin';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getAdminSuppliers({ status: 'pending', limit: 1 })
      .then((data) => {
        const suppliers = data.data || data;
        setPendingCount(Array.isArray(suppliers) ? suppliers.length : data.total || 0);
      })
      .catch(() => setPendingCount(0));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/admin/products', icon: ProductIcon, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/vendors', icon: Store, label: 'Vendors', badge: pendingCount > 0 ? pendingCount : null },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/compliance', icon: Shield, label: 'Compliance' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <img src={logo} alt="APlusMedDepot" className="h-8 w-auto object-contain" />
                <div>
                  <span className="font-display text-lg text-white">APlusMedDepot</span>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="mb-3 px-4 py-2 bg-gray-800 rounded-lg">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 lg:flex-none">
                <h2 className="text-2xl font-display text-neutral">
                  {menuItems.find(item => isActive(item.path))?.label || 'Admin'}
                </h2>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
