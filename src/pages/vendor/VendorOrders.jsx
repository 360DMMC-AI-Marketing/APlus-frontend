import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { mockOrders, mockVendors } from '../../utils/mockData';
import { useAuthStore } from '../../store/authStore';

const VendorOrders = () => {
  const { user } = useAuthStore();
  const vendor = mockVendors.find(v => v.id === user?.vendorId) || mockVendors[0];
  const supplierIdMap = { 'VEN-001': 'SUP-001', 'VEN-002': 'SUP-002', 'VEN-003': 'SUP-003' };
  const legacyId = supplierIdMap[vendor.id];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Build flat list of vendor-relevant order slices with parent order data
  const vendorOrders = mockOrders
    .flatMap((order, idx) =>
      (order.supplierOrders?.filter(so => so.supplierId === legacyId) || []).map(so => ({
        ...so,
        orderId: order.id,
        orderDate: order.date,
        shippingAddress: order.shippingAddress,
        displayIndex: idx + 1,
      }))
    )
    .filter(order => {
      const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const statusStyle = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'in_transit') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const totals = {
    revenue: vendorOrders.reduce((s, o) => s + o.supplierPayout, 0),
    commission: vendorOrders.reduce((s, o) => s + o.commission, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold text-neutral">{vendorOrders.length}</p>
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
      {vendorOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {vendorOrders.map((order, idx) => (
            <div key={idx} className="glass-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-neutral">{order.orderId}</h3>
                    <span className={`badge-status text-xs ${statusStyle(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {order.shippingAddress && (
                    <p className="text-xs text-gray-400 mt-1">
                      Ship to: {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">${order.supplierPayout.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Your payout</p>
                  <p className="text-xs text-gray-400 mt-0.5">−${order.commission.toFixed(2)} commission</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
