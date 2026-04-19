import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Package, BarChart2 } from 'lucide-react';
import { getSupplierProfile, getSupplierProducts, getSupplierRevenueTrend, getSupplierDashboard } from '../../api/suppliers';
import { resolveProductImages } from '../../utils/imageHelper';
import { useCategories } from '../../hooks/useCategories';

const VendorAnalytics = () => {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [dashboard, setDashboard] = useState({});
  const [vendorProducts, setVendorProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      getSupplierProfile(),
      getSupplierDashboard(),
      getSupplierProducts(),
      getSupplierRevenueTrend(),
    ])
      .then(([profRes, dashRes, prodRes, trendRes]) => {
        if (profRes.status === 'fulfilled') {
          const d = profRes.value;
          setVendor(d.data || d);
        }
        if (dashRes.status === 'fulfilled') {
          setDashboard(dashRes.value || {});
        }
        if (prodRes.status === 'fulfilled') {
          const d = prodRes.value.products || prodRes.value.data || prodRes.value;
          const prods = Array.isArray(d) ? d : [];
          Promise.all(prods.map(async (p) => {
            const images = await resolveProductImages(p);
            return { ...p, images };
          })).then(setVendorProducts);
        }
        if (trendRes.status === 'fulfilled') {
          const d = trendRes.value.data || trendRes.value;
          setRevenueTrend(Array.isArray(d) ? d : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  const commissionRate = Number(vendor?.commissionRate || vendor?.commission_rate || 0);
  const pendingPayout = Number(vendor?.currentBalance || vendor?.current_balance || vendor?.pending_payout || 0);

  // Use dashboard stats (from backend) for accurate KPIs
  const revenueThisMonth = Number(dashboard.revenueThisMonth || 0);
  const ordersThisMonth = Number(dashboard.ordersThisMonth || 0);
  const activeProducts = Number(dashboard.activeProducts || vendorProducts.length || 0);
  const avgOrderValue = Number(dashboard.averageOrderValue || 0);

  // Build chart data from trend — backend returns { date, revenue, orderCount }
  const monthlyRevenue = revenueTrend.map(m => ({
    label: m.date || m.month || m.label || '',
    revenue: Number(m.revenue || m.total || 0),
    orders: Number(m.orderCount || m.orders || 0),
  }));
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  // Build category counts from vendor's products, then merge with all categories
  const productCatCounts = vendorProducts.reduce((acc, p) => {
    const cat = p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryBreakdown = {};
  categories.forEach(cat => { categoryBreakdown[cat.name] = productCatCounts[cat.name] || 0; });
  // Add any product categories not in the known list
  Object.entries(productCatCounts).forEach(([cat, count]) => {
    if (!(cat in categoryBreakdown)) categoryBreakdown[cat] = count;
  });

  const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-500', 'bg-orange-400'];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue This Month', value: `$${revenueThisMonth.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Net Earnings', value: `$${(revenueThisMonth * (1 - commissionRate / 100)).toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Orders This Month', value: ordersThisMonth, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Products', value: activeProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-5">
            <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-neutral">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {monthlyRevenue.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-neutral">Revenue Trend</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart2 className="w-4 h-4" />
              Last {monthlyRevenue.length} periods
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-gray-600">${m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue.toFixed(0)}</p>
                <div
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500 min-h-[8px]"
                  style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
                />
                <p className="text-[10px] text-gray-500">{m.label.length > 10 ? m.label.slice(5) : m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-col: category breakdown + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    style={{ width: `${(count / (vendorProducts.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(categoryBreakdown).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No products yet</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-5">Top Products by Price</h2>
          <div className="space-y-3">
            {[...vendorProducts].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <img src={p.images?.[0] || '/placeholder.svg'} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <p className="font-bold text-primary text-sm">${Number(p.price).toFixed(2)}</p>
              </div>
            ))}
            {vendorProducts.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No products yet</p>}
          </div>
        </div>
      </div>

      {/* Commission summary */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-4">Commission & Payout Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
            <p className="text-3xl font-bold text-neutral">{commissionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Per transaction</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-orange-700">${pendingPayout.toFixed(2)}</p>
            <p className="text-xs text-orange-400 mt-1">Available for payout</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-600 mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-green-700">${avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-green-400 mt-1">This month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
