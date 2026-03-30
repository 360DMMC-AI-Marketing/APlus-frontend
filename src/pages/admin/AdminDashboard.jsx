import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Package, Store, ArrowRight } from 'lucide-react';
import { getAdminDashboard, getAdminSuppliers, getAdminPendingProducts } from '../../api/admin';
import { resolveProductImages } from '../../utils/imageHelper';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      getAdminDashboard(),
      getAdminSuppliers({ status: 'pending' }),
      getAdminPendingProducts(),
    ])
      .then(([dashRes, vendorRes, productRes]) => {
        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value.data || dashRes.value);
        }
        if (vendorRes.status === 'fulfilled') {
          const vendors = vendorRes.value.data || vendorRes.value;
          setPendingVendors(Array.isArray(vendors) ? vendors : []);
        }
        if (productRes.status === 'fulfilled') {
          const products = productRes.value.products || productRes.value.data || productRes.value;
          const list = Array.isArray(products) ? products : [];
          Promise.all(list.map(async (p) => {
            const images = await resolveProductImages(p);
            return { ...p, images };
          })).then(setPendingProducts);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  const totalRevenue = dashboardData?.totalRevenue ?? dashboardData?.total_revenue ?? 0;
  const totalProducts = dashboardData?.totalProducts ?? dashboardData?.total_products ?? 0;
  const pendingVendorCount = pendingVendors.length;

  const stats = [
    {
      label: 'Total Revenue',
      value: '$' + Number(totalRevenue).toFixed(2),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Pending Products',
      value: pendingProducts.length,
      icon: Package,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      alert: pendingProducts.length > 0,
    },
    {
      label: 'Pending Vendors',
      value: pendingVendorCount,
      icon: Store,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      alert: pendingVendorCount > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-neutral mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Vendor Approvals */}
      <div className="glass-card p-6 animate-slide-up animate-delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-neutral">Pending Vendor Applications</h2>
          <Link to="/admin/vendors" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingVendors.map((vendor) => (
            <div key={vendor.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-neutral">{vendor.businessName || vendor.business_name || vendor.name}</p>
                  <p className="text-sm text-gray-500">{vendor.contactEmail || vendor.contact_email || vendor.email}</p>
                  {(vendor.productCategories || vendor.product_categories) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(vendor.productCategories || vendor.product_categories).map(c => (
                        <span key={c} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="badge-status bg-yellow-100 text-yellow-800 text-xs">Pending</span>
              </div>
              <Link
                to="/admin/vendors"
                className="block text-center w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
              >
                Review →
              </Link>
            </div>
          ))}
          {pendingVendors.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm col-span-3">No pending applications</p>
          )}
        </div>
      </div>

      {/* Pending Products */}
      <div className="glass-card p-6 animate-slide-up animate-delay-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-neutral">Pending Product Approvals</h2>
          <Link to="/admin/products" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingProducts.slice(0, 6).map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.supplierName || product.supplier?.business_name || product.supplier || 'Unknown vendor'}</p>
                <p className="text-sm font-semibold text-primary">${Number(product.price || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {pendingProducts.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm col-span-3">No pending products</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
