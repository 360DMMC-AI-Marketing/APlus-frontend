import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Package, Store, ShoppingBag, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getAdminRevenue,
  getAdminRevenueTrend,
  getAdminRevenueByCategory,
  getAdminOrderMetrics,
  getAdminTopProducts,
  getAdminCommissionEarnings,
  getAdminCommissionBySupplier,
  getAdminSuppliers,
} from '../../api/admin';
import { getProducts } from '../../api/products';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const [revenue, setRevenue] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderMetrics, setOrderMetrics] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getAdminRevenue({ period }),
      getAdminRevenueTrend(),
      getAdminOrderMetrics(),
      getAdminTopProducts(),
      getAdminCommissionBySupplier(),
      getProducts(),
      getAdminSuppliers({ status: 'approved' }),
    ])
      .then(([revRes, trendRes, ordersRes, topRes, commRes, prodRes, supRes]) => {
        if (revRes.status === 'fulfilled') setRevenue(revRes.value.data || revRes.value);
        if (trendRes.status === 'fulfilled') {
          const d = trendRes.value.data || trendRes.value;
          setRevenueTrend(Array.isArray(d) ? d : []);
        }
        if (ordersRes.status === 'fulfilled') setOrderMetrics(ordersRes.value.data || ordersRes.value);
        if (topRes.status === 'fulfilled') {
          const d = topRes.value.data || topRes.value;
          setTopProducts(Array.isArray(d) ? d.slice(0, 6) : []);
        }
        if (commRes.status === 'fulfilled') {
          const d = commRes.value.data || commRes.value;
          setVendorPerformance(Array.isArray(d) ? d : []);
        }
        if (prodRes.status === 'fulfilled') {
          const d = prodRes.value.data || prodRes.value;
          setProducts(Array.isArray(d) ? d : []);
        }
        if (supRes.status === 'fulfilled') {
          const d = supRes.value.data || supRes.value;
          setSuppliers(Array.isArray(d) ? d : []);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  const totalRevenue = Number(revenue.total_revenue || revenue.totalRevenue || 0);
  const platformCommission = Number(revenue.commission_total || revenue.platformCommission || 0);
  const activeVendors = suppliers.length;
  const totalOrders = Number(orderMetrics.total_orders || orderMetrics.totalOrders || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Build monthly data from trend or use empty
  const monthlyData = revenueTrend.length > 0
    ? revenueTrend.map(m => ({
        month: m.month || m.label,
        revenue: Number(m.revenue || m.total || 0),
        orders: Number(m.orders || 0),
        visitors: Number(m.visitors || 0),
      }))
    : [];
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxVisitors = Math.max(...monthlyData.map(m => m.visitors), 1);

  // Category breakdown from products
  const catBreakdown = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const kpis = [
    { label: 'Platform Revenue', value: `$${platformCommission.toFixed(0)}`, sub: 'Commission earned', icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Total GMV', value: `$${totalRevenue.toFixed(0)}`, sub: 'Gross merchandise value', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Total Orders', value: totalOrders, sub: 'Processed orders', icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Active Vendors', value: activeVendors, sub: 'Approved suppliers', icon: Store, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Products Listed', value: products.length, sub: 'Across all vendors', icon: Package, bg: 'bg-teal-50', color: 'text-teal-600' },
    { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, sub: 'Per transaction', icon: Eye, bg: 'bg-pink-50', color: 'text-pink-600' },
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
            </div>
            <p className="text-2xl font-bold text-neutral">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      )}

      {/* Vendor Performance */}
      {vendorPerformance.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Vendor Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendorPerformance.map((v, i) => {
                  const totalGmv = vendorPerformance.reduce((s, vv) => s + Number(vv.total_sales || vv.totalSales || 0), 0);
                  const sales = Number(v.total_sales || v.totalSales || 0);
                  const commission = Number(v.commission_amount || v.commissionEarned || 0);
                  const rate = Number(v.commission_rate || v.commissionRate || 0);
                  const share = totalGmv > 0 ? (sales / totalGmv) * 100 : 0;
                  return (
                    <tr key={v.id || i} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                          <div>
                            <p className="font-semibold text-neutral text-sm">{v.business_name || v.name}</p>
                            <p className="text-xs text-gray-400">{v.contact_email || v.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-green-600 text-sm">${sales.toFixed(2)}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-600 text-sm">${commission.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-sm font-medium text-neutral">{rate}%</td>
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
      )}

      {/* Top Products + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Top Products by Value</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <img src={p.images?.[0] || p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.supplier_name || p.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">${Number(p.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{p.stock_quantity ?? p.stock} in stock</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No product data</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Category Breakdown</h2>
          {(() => {
            const total = products.length || 1;
            const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];
            return Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => (
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
          {Object.keys(catBreakdown).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No category data</p>}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
