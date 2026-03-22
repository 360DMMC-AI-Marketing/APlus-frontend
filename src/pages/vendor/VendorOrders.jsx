import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getSupplierOrders, updateFulfillmentStatus } from '../../api/suppliers';

const VendorOrders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    getSupplierOrders()
      .then((res) => {
        const list = res.data || res.orders || res;
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => {
    const orderId = (order.orderNumber || order.order_number || order.id || '').toString().toLowerCase();
    const matchesSearch = orderId.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const statusStyle = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'in_transit' || status === 'shipped') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Backend status values: processing → shipped → delivered
  const nextStatus = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };

  const handleStatusUpdate = async (order, trackingNumber = '', carrier = '') => {
    const items = order.items || order.order_items || [];
    const currentStatus = order.status || (items[0]?.fulfillment_status) || 'pending';
    const newStatus = nextStatus[currentStatus];
    if (!newStatus || items.length === 0) return;

    // Shipping requires tracking info
    if (newStatus === 'shipped' && (!trackingNumber || !carrier)) {
      const tracking = prompt('Enter tracking number:');
      if (!tracking) return;
      const carrierChoice = prompt('Enter carrier (USPS, UPS, FedEx, DHL, Other):');
      if (!carrierChoice) return;
      return handleStatusUpdate(order, tracking, carrierChoice);
    }

    setUpdatingOrderId(order.id);
    try {
      const body = { fulfillmentStatus: newStatus };
      if (newStatus === 'shipped') {
        body.trackingNumber = trackingNumber;
        body.carrier = carrier;
      }

      await Promise.all(
        items.map((item) =>
          updateFulfillmentStatus(item.id, body)
        )
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totals = {
    revenue: filteredOrders.reduce((s, o) => s + Number(o.payoutAmount || o.supplier_payout || o.total_amount || 0), 0),
    commission: filteredOrders.reduce((s, o) => s + Number(o.commissionAmount || o.commission_amount || 0), 0),
  };

  if (loading) {
    return <div className="p-10 text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold text-neutral">{filteredOrders.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Orders</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold text-green-600">${totals.revenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Your Payout</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold text-gray-500">${totals.commission.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Platform Commission</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => {
            const items = order.items || order.order_items || [];
            const addr = order.shippingAddress || order.shipping_address || {};
            const payout = Number(order.payoutAmount || order.supplier_payout || order.total_amount || 0);
            const commission = Number(order.commissionAmount || order.commission_amount || 0);
            const orderId = order.orderNumber || order.order_number || order.id;

            return (
              <div key={order.id || idx} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-neutral">{orderId}</h3>
                      <span className={`badge-status text-xs ${statusStyle(order.status)}`}>
                        {(order.status || '').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt || order.created_at || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {addr.name && (
                      <p className="text-xs text-gray-400 mt-1">
                        Ship to: {addr.name}, {addr.city}, {addr.state}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">${payout.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Your payout</p>
                    {commission > 0 && <p className="text-xs text-gray-400 mt-0.5">-${commission.toFixed(2)} commission</p>}
                    {(() => {
                      const currentSt = order.status || (items[0]?.fulfillment_status) || 'pending';
                      const next = nextStatus[currentSt];
                      if (!next) return null;
                      return (
                        <button
                          onClick={() => handleStatusUpdate(order)}
                          disabled={updatingOrderId === order.id}
                          className="mt-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingOrderId === order.id
                            ? 'Updating...'
                            : `Mark ${next}`}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-700">
                          <span>{item.name || item.product_name} × {item.quantity}</span>
                          <span className="font-medium">${(Number(item.unit_price || item.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
