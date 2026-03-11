import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, ShoppingBag, Package, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { mockProducts, mockOrders, mockVendors } from '../../utils/mockData';
import { useAuthStore } from '../../store/authStore';

const VendorDashboard = () => {
  const { user } = useAuthStore();

  // Find vendor record (match by vendorId or fall back to first active vendor for demo)
  const vendor = mockVendors.find(v => v.id === user?.vendorId) || mockVendors[0];

  // Vendor's products (map old supplierId to new vendorId naming for mock data compat)
  const supplierIdMap = { 'VEN-001': 'SUP-001', 'VEN-002': 'SUP-002', 'VEN-003': 'SUP-003' };
  const legacyId = supplierIdMap[vendor.id];
  const vendorProducts = mockProducts.filter(p => p.supplierId === legacyId);

  // Vendor's order slices
  const vendorOrders = mockOrders.flatMap(order =>
    order.supplierOrders?.filter(so => so.supplierId === legacyId) || []
  );

  const stats = [
    {
      label: 'Total Revenue',
      value: '$' + vendor.totalSales.toFixed(2),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+12.5% this month',
    },
    {
      label: 'Pending Payout',
      value: '$' + vendor.pendingPayout.toFixed(2),
      icon: Clock,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: 'Due next Monday',
    },
    {
      label: 'Active Products',
      value: vendorProducts.length,
      icon: Package,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: null,
    },
    {
      label: 'Total Orders',
      value: vendorOrders.length,
      icon: ShoppingBag,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: null,
    },
  ];

  const lowStockProducts = vendorProducts.filter(p => p.stock < 30);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <h1 className="font-display text-3xl mb-1">Welcome back, {vendor.name}!</h1>
        <p className="text-white/80 text-sm">Here's an overview of your store performance</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            Commission: {vendor.commissionRate}%
          </span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            ✓ Verified Vendor
          </span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            {vendor.categories.join(' · ')}
          </span>
        </div>
      </div>

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
              {stat.change && <TrendingUp className="w-4 h-4 text-green-500" />}
            </div>
            <h3 className="text-3xl font-bold text-neutral mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            {stat.change && <p className="text-xs text-gray-400 mt-1">{stat.change}</p>}
          </div>
        ))}
      </div>

      {/* Orders + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-neutral">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {vendorOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {vendorOrders.map((order, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral text-sm">Order #{idx + 1}</p>
                    <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                    <p className="text-xs text-gray-400">Commission: ${order.commission.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${order.supplierPayout.toFixed(2)}</p>
                    <span className={`badge-status text-xs ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Products */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-neutral">My Products</h2>
            <Link to="/vendor/products" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1">
              Manage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {vendorProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  product.stock < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Breakdown */}
      <div className="glass-card p-6">
        <h2 className="font-display text-2xl text-neutral mb-6">Earnings Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 mb-1 font-medium">Gross Sales</p>
            <p className="text-2xl font-bold text-blue-900">${vendor.totalSales.toFixed(2)}</p>
            <p className="text-xs text-blue-500 mt-1">All-time total</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600 mb-1 font-medium">Platform Fee ({vendor.commissionRate}%)</p>
            <p className="text-2xl font-bold text-red-900">
              ${(vendor.totalSales * (vendor.commissionRate / 100)).toFixed(2)}
            </p>
            <p className="text-xs text-red-500 mt-1">Deducted from payouts</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-600 mb-1 font-medium">Net Earnings</p>
            <p className="text-2xl font-bold text-green-900">
              ${(vendor.totalSales * (1 - vendor.commissionRate / 100)).toFixed(2)}
            </p>
            <p className="text-xs text-green-500 mt-1">After platform fees</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="glass-card p-6 border border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-display text-xl text-neutral">Low Stock Alert</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-neutral text-sm truncate">{product.name}</p>
                  <p className="text-xs text-orange-600 font-semibold">Only {product.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
