import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Store, ShoppingBag, Eye } from 'lucide-react';
import {
  getAdminRevenue,
  getAdminRevenueTrend,
  getAdminRevenueByCategory,
  getAdminOrderMetrics,
  getAdminTopProducts,
  getAdminCommissionBySupplier,
  getAdminSuppliers,
} from '../../api/admin';
import { getProducts } from '../../api/products';
import { useCategories } from '../../hooks/useCategories';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();

  const [revenue, setRevenue] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderMetrics, setOrderMetrics] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [totalProductCount, setTotalProductCount] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);

  useEffect(() => {
    setLoading(true);

    // Map UI period labels to backend values
    const periodMap = { '7d': 'week', '30d': 'month', '90d': 'quarter', 'all': 'all' };
    const backendPeriod = periodMap[period] || period;

    Promise.allSettled([
      getAdminRevenue({ period: backendPeriod }),
      getAdminRevenueTrend({ period: 'monthly' }),
      getAdminOrderMetrics({ period: backendPeriod }),
      getAdminTopProducts({ limit: 6 }),
      getAdminCommissionBySupplier(),
      getProducts({ limit: 1 }),
      getAdminSuppliers({ status: 'approved', limit: 100 }),
      getAdminRevenueByCategory(),
    ])
      .then(([revRes, trendRes, ordersRes, topRes, commRes, prodRes, supRes, catRes]) => {
        // Revenue: backend returns { current: { totalSales, totalCommission, netPlatformRevenue, orderCount }, previous: {...}, changePercent: {...} }
        if (revRes.status === 'fulfilled') {
          setRevenue(revRes.value);
        }

        // Trend: backend returns [{ date, revenue, commission, orders }]
        if (trendRes.status === 'fulfilled') {
          const d = revRes.value?.data || trendRes.value;
          setRevenueTrend(Array.isArray(d) ? d : []);
        }

        // Order metrics: backend returns { totalOrders, paidOrders, averageOrderValue, conversionRate }
        if (ordersRes.status === 'fulfilled') {
          setOrderMetrics(ordersRes.value);
        }

        // Top products: backend returns [{ productId, productName, category, supplierName, totalSold, totalRevenue }]
        if (topRes.status === 'fulfilled') {
          const d = topRes.value;
          setTopProducts(Array.isArray(d) ? d.slice(0, 6) : []);
        }

        // Commission by supplier
        if (commRes.status === 'fulfilled') {
          const d = commRes.value.data || commRes.value;
          setVendorPerformance(Array.isArray(d) ? d : []);
        }

        // Products: just get total count from pagination
        if (prodRes.status === 'fulfilled') {
          setTotalProductCount(prodRes.value.pagination?.total || 0);
        }

        // Suppliers
        if (supRes.status === 'fulfilled') {
          const d = supRes.value.suppliers || supRes.value.data || supRes.value;
          setSuppliers(Array.isArray(d) ? d : []);
        }

        // Category revenue breakdown
        if (catRes.status === 'fulfilled') {
          const d = catRes.value.data || catRes.value;
          setCategoryRevenue(Array.isArray(d) ? d : []);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  // Extract revenue data from nested response
  const current = revenue.current || {};
  const totalSales = Number(current.totalSales || 0);
  const platformCommission = Number(current.totalCommission || current.netPlatformRevenue || 0);
  const totalOrders = Number(current.orderCount || orderMetrics.totalOrders || 0);
  const avgOrderValue = Number(orderMetrics.averageOrderValue || (totalOrders > 0 ? totalSales / totalOrders : 0));
  const activeVendors = suppliers.length;

  // Build monthly chart data from trend
  const monthlyData = revenueTrend.map(m => ({
    label: m.date || m.month || m.label || '',
    revenue: Number(m.revenue || 0),
    orders: Number(m.orders || 0),
    commission: Number(m.commission || 0),
  }));
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxOrders = Math.max(...monthlyData.map(m => m.orders), 1);

  const kpis = [
    { label: 'Platform Revenue', value: `$${platformCommission.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Commission earned', icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Total GMV', value: `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Gross merchandise value', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Total Orders', value: totalOrders, sub: 'Processed orders', icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Active Vendors', value: activeVendors, sub: 'Approved suppliers', icon: Store, bg: 'bg-orange-50', color: 'text-orange-600' },
    { label: 'Products Listed', value: totalProductCount, sub: 'Across all vendors', icon: Package, bg: 'bg-teal-50', color: 'text-teal-600' },
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

      {/* Revenue + Orders Charts */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="font-display text-xl text-neutral mb-6">Revenue Trend</h2>
            <div className="flex items-end gap-3 h-44">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-xs font-semibold text-gray-600">${m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue.toFixed(0)}</p>
                  <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg" style={{ height: `${(m.revenue / maxRevenue) * 140}px`, minHeight: 6 }} />
                  <p className="text-[10px] text-gray-400">{m.label.length > 10 ? m.label.slice(5) : m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-xl text-neutral mb-6">Orders Trend</h2>
            <div className="flex items-end gap-3 h-44">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-xs font-semibold text-gray-600">{m.orders}</p>
                  <div className="w-full bg-gradient-to-t from-secondary/80 to-secondary rounded-t-lg" style={{ height: `${(m.orders / maxOrders) * 140}px`, minHeight: 6 }} />
                  <p className="text-[10px] text-gray-400">{m.label.length > 10 ? m.label.slice(5) : m.label}</p>
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
                {(() => {
                  const totalGmv = vendorPerformance.reduce((s, vv) => s + Number(vv.totalSales || vv.total_sales || 0), 0);
                  return vendorPerformance.map((v, i) => {
                    const sales = Number(v.totalSales || v.total_sales || 0);
                    const commission = Number(v.platformCommission || v.commission_amount || v.commissionEarned || 0);
                    const rate = Number(v.commissionRate || v.commission_rate || 0);
                    const share = totalGmv > 0 ? (sales / totalGmv) * 100 : 0;
                    return (
                      <tr key={v.supplierId || v.id || i} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                            <p className="font-semibold text-neutral text-sm">{v.supplierName || v.business_name || v.name}</p>
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
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Top Products by Revenue</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral truncate">{p.productName || p.name}</p>
                  <p className="text-xs text-gray-400">{p.supplierName || p.supplier_name || ''} · {p.category || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">${Number(p.totalRevenue || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{p.totalSold || 0} sold</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No product data</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Category Breakdown</h2>
          {(() => {
            const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-pink-400', 'bg-cyan-400', 'bg-rose-400', 'bg-emerald-400', 'bg-indigo-400'];
            // Build a map from backend data
            const revenueMap = {};
            categoryRevenue.forEach(c => { revenueMap[c.category] = c; });
            // Merge all known categories with backend data
            const allCats = categories.map(cat => ({
              category: cat.name,
              totalSales: Number(revenueMap[cat.name]?.totalSales || 0),
              orderCount: Number(revenueMap[cat.name]?.orderCount || 0),
              unitsSold: Number(revenueMap[cat.name]?.unitsSold || 0),
            }));
            // Add any backend categories not in the known list
            categoryRevenue.forEach(c => {
              if (!allCats.find(a => a.category === c.category)) {
                allCats.push({ category: c.category, totalSales: Number(c.totalSales || 0), orderCount: Number(c.orderCount || 0), unitsSold: Number(c.unitsSold || 0) });
              }
            });
            const sorted = allCats.sort((a, b) => b.totalSales - a.totalSales);
            const maxSales = Math.max(...sorted.map(c => c.totalSales), 1);
            return sorted.map((cat, i) => (
              <div key={cat.category} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat.category}</span>
                  <span className="text-gray-400">{cat.orderCount} orders · {cat.unitsSold} units · ${cat.totalSales.toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${cat.totalSales > 0 ? (cat.totalSales / maxSales) * 100 : 0}%`, minWidth: cat.totalSales > 0 ? '4px' : '0' }} />
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
