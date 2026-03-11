import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Package, Store, ArrowRight } from 'lucide-react';
import { mockOrders, mockProducts, mockPendingUsers, mockPendingVendors } from '../../utils/mockData';

const AdminDashboard = () => {
  const pendingVendorCount = mockPendingVendors.filter(v => v.status === 'pending').length;

  const stats = [
    {
      label: 'Total Revenue',
      value: '$' + mockOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2),
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Products',
      value: mockProducts.length,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Pending Vendors',
      value: pendingVendorCount,
      icon: Store,
      color: 'from-orange-500 to-orange-600',
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

      {/* Pending Vendor Approvals — full width */}
      <div className="glass-card p-6 animate-slide-up animate-delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-neutral">Pending Vendor Applications</h2>
          <Link to="/admin/vendors" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPendingVendors.filter(v => v.status === 'pending').map((vendor) => (
            <div key={vendor.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-neutral">{vendor.name}</p>
                  <p className="text-sm text-gray-500">{vendor.email}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vendor.categories.map(c => (
                      <span key={c} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">{c}</span>
                    ))}
                  </div>
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
          {mockPendingVendors.filter(v => v.status === 'pending').length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm col-span-3">No pending applications</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="glass-card p-6 animate-slide-up animate-delay-400">
        <h2 className="font-display text-2xl text-neutral mb-6">Low Stock Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts.filter(p => p.stock < 30).slice(0, 6).map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral truncate">{product.name}</p>
                <p className="text-sm text-red-600 font-semibold">Stock: {product.stock} units</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
