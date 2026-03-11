import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Package, BarChart2 } from 'lucide-react';
import { mockProducts, mockVendors } from '../../utils/mockData';
import { useAuthStore } from '../../store/authStore';

const VendorAnalytics = () => {
  const { user } = useAuthStore();
  const vendor = mockVendors.find(v => v.id === user?.vendorId) || mockVendors[0];
  const supplierIdMap = { 'VEN-001': 'SUP-001', 'VEN-002': 'SUP-002', 'VEN-003': 'SUP-003' };
  const legacyId = supplierIdMap[vendor.id];
  const vendorProducts = mockProducts.filter(p => p.supplierId === legacyId);

  // Simulated monthly data
  const monthlyRevenue = [
    { month: 'Aug', revenue: 820, orders: 9 },
    { month: 'Sep', revenue: 1340, orders: 14 },
    { month: 'Oct', revenue: 980, orders: 11 },
    { month: 'Nov', revenue: 1760, orders: 19 },
    { month: 'Dec', revenue: 2100, orders: 23 },
    { month: 'Jan', revenue: 1450, orders: 16 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  const categoryBreakdown = vendorProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-500', 'bg-orange-400'];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${vendor.totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', change: '+12.5%' },
          { label: 'Net Earnings', value: `$${(vendor.totalSales * (1 - vendor.commissionRate / 100)).toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', change: '+10.2%' },
          { label: 'Total Orders', value: '25', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', change: '+4 this month' },
          { label: 'Active Products', value: vendorProducts.length, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', change: null },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-5">
            <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-neutral">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            {kpi.change && <p className="text-xs text-green-500 mt-1">{kpi.change}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-neutral">Monthly Revenue</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart2 className="w-4 h-4" />
            Last 6 months
          </div>
        </div>
        <div className="flex items-end gap-3 h-48">
          {monthlyRevenue.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-gray-600">${m.revenue}</p>
              <div
                className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500 min-h-[8px]"
                style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
              />
              <p className="text-xs text-gray-500">{m.month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-col: category breakdown + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Products by Category</h2>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown).map(([cat, count], i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{cat}</span>
                  <span className="text-gray-500">{count} product{count > 1 ? 's' : ''}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colors[i % colors.length]}`}
                    style={{ width: `${(count / vendorProducts.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products by price */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Top Products by Price</h2>
          <div className="space-y-3">
            {[...vendorProducts].sort((a, b) => b.price - a.price).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <p className="font-bold text-primary text-sm">${p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission summary */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-4">Commission & Payout Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
            <p className="text-3xl font-bold text-neutral">{vendor.commissionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Per transaction</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Pending Payout</p>
            <p className="text-3xl font-bold text-orange-700">${vendor.pendingPayout.toFixed(2)}</p>
            <p className="text-xs text-orange-400 mt-1">Due next Monday</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-600 mb-1">Lifetime Earnings</p>
            <p className="text-3xl font-bold text-green-700">
              ${(vendor.totalSales * (1 - vendor.commissionRate / 100)).toFixed(2)}
            </p>
            <p className="text-xs text-green-400 mt-1">After platform fees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
