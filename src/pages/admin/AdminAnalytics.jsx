import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Package, Store, ShoppingBag, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { mockOrders, mockProducts, mockVendors, mockPendingVendors } from '../../utils/mockData';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('30d');

  const totalRevenue = mockOrders.reduce((s, o) => s + o.total, 0);
  const platformCommission = mockVendors.reduce((s, v) => s + (v.totalSales * (v.commissionRate / 100)), 0);
  const activeVendors = mockVendors.filter(v => v.status === 'approved').length;

  const monthlyData = [
    { month: 'Aug', revenue: 3200, orders: 28, visitors: 412, vendors: 2 },
    { month: 'Sep', revenue: 4800, orders: 41, visitors: 589, vendors: 2 },
    { month: 'Oct', revenue: 3900, orders: 35, visitors: 503, vendors: 3 },
    { month: 'Nov', revenue: 6100, orders: 54, visitors: 740, vendors: 3 },
    { month: 'Dec', revenue: 7400, orders: 67, visitors: 892, vendors: 3 },
    { month: 'Jan', revenue: 5300, orders: 49, visitors: 674, vendors: 3 },
  ];
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));
  const maxVisitors = Math.max(...monthlyData.map(m => m.visitors));

  const topProducts = [...mockProducts].sort((a, b) => b.price * (100 - b.stock) - a.price * (100 - a.stock)).slice(0, 6);

  const vendorPerformance = mockVendors.map(v => ({
    ...v,
    commissionEarned: v.totalSales * (v.commissionRate / 100),
  })).sort((a, b) => b.totalSales - a.totalSales);

  const kpis = [
    { label: 'Platform Revenue', value: `$${platformCommission.toFixed(0)}`, sub: 'Commission earned', icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600', change: '+18%', up: true },
    { label: 'Total GMV', value: `$${totalRevenue.toFixed(0)}`, sub: 'Gross merchandise value', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600', change: '+12%', up: true },
    { label: 'Total Orders', value: mockOrders.length, sub: 'Processed orders', icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600', change: '+5', up: true },
    { label: 'Active Vendors', value: activeVendors, sub: `${mockPendingVendors.filter(v => v.status === 'pending').length} pending`, icon: Store, bg: 'bg-orange-50', color: 'text-orange-600', change: null },
    { label: 'Products Listed', value: mockProducts.length, sub: 'Across all vendors', icon: Package, bg: 'bg-teal-50', color: 'text-teal-600', change: null },
    { label: 'Avg Order Value', value: `$${(totalRevenue / (mockOrders.length || 1)).toFixed(2)}`, sub: 'Per transaction', icon: Eye, bg: 'bg-pink-50', color: 'text-pink-600', change: '+3%', up: true },
  ];

  return (
    <div className="space-y-6">

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {['7d', '30d', '90d', 'all'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === p ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : p === '90d' ? 'Last 90 days' : 'All time'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              {kpi.change && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${kpi.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {kpi.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-neutral">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Visitors Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-6">Monthly Revenue</h2>
          <div className="flex items-end gap-3 h-44">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-gray-600">${(m.revenue / 1000).toFixed(1)}k</p>
                <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg" style={{ height: `${(m.revenue / maxRevenue) * 140}px`, minHeight: 6 }} />
                <p className="text-xs text-gray-400">{m.month}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visitors Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-6">Monthly Site Visitors</h2>
          <div className="flex items-end gap-3 h-44">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-gray-600">{m.visitors}</p>
                <div className="w-full bg-gradient-to-t from-secondary/80 to-secondary rounded-t-lg" style={{ height: `${(m.visitors / maxVisitors) * 140}px`, minHeight: 6 }} />
                <p className="text-xs text-gray-400">{m.month}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Performance */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-5">Vendor Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendorPerformance.map((v, i) => {
                const totalGmv = vendorPerformance.reduce((s, vv) => s + vv.totalSales, 0);
                const share = totalGmv > 0 ? (v.totalSales / totalGmv) * 100 : 0;
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-neutral text-sm">{v.name}</p>
                          <p className="text-xs text-gray-400">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-green-600 text-sm">${v.totalSales.toFixed(2)}</td>
                    <td className="py-3 pr-4 font-semibold text-blue-600 text-sm">${v.commissionEarned.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{v.totalProducts}</td>
                    <td className="py-3 pr-4 text-sm font-medium text-neutral">{v.commissionRate}%</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-10">{share.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Top Products by Value</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">${p.price}</p>
                  <p className="text-xs text-gray-400">{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Category Breakdown</h2>
          {(() => {
            const cats = mockProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
            const total = mockProducts.length;
            const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];
            return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => (
              <div key={cat} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat}</span>
                  <span className="text-gray-400">{count} products · {((count / total) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
