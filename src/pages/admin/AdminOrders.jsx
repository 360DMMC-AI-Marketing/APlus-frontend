import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, X, Package, CreditCard, Truck, MapPin } from 'lucide-react';
import { getAdminOrders, getAdminOrderById } from '../../api/admin';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getAdminOrders({ limit: 100 })
      .then((data) => {
        const list = data.data || data;
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewOrder = async (orderId) => {
    setDetailLoading(true);
    try {
      const data = await getAdminOrderById(orderId);
      setSelectedOrder(data.order || data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderId = order.orderNumber || order.order_number || order.id || '';
    const customerName = order.customerName || '';
    const matchesSearch =
      orderId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'fully_shipped':
      case 'partially_shipped': return 'bg-blue-100 text-blue-800';
      case 'awaiting_fulfillment':
      case 'payment_confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'payment_processing':
      case 'pending_payment': return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => (status || '').replace(/_/g, ' ');

  if (loading) {
    return <div className="p-10 text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="awaiting_fulfillment">Awaiting Fulfillment</option>
            <option value="partially_shipped">Partially Shipped</option>
            <option value="fully_shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-neutral text-sm">{order.orderNumber || order.order_number || order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt || order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-neutral text-sm">{order.customerName || '—'}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary">${Number(order.totalAmount || order.total_amount || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-status ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      )}

      {/* Order Detail Modal */}
      {(selectedOrder || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !detailLoading && setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="p-12 text-center text-gray-500">Loading order details...</div>
            ) : selectedOrder && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="font-display text-xl text-neutral">Order Details</h2>
                    <p className="text-sm text-gray-500 font-mono mt-1">{selectedOrder.orderNumber || selectedOrder.order_number || selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-block mt-1 badge-status ${getStatusColor(selectedOrder.status)}`}>
                        {formatStatus(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Payment</p>
                      <p className="text-sm font-semibold text-neutral mt-1">{formatStatus(selectedOrder.paymentStatus || selectedOrder.payment_status)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-primary mt-1">${Number(selectedOrder.totalAmount || selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-neutral mt-1">
                        {new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {selectedOrder.customer && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Customer
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-neutral">
                          {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                        </p>
                        <p className="text-gray-500">{selectedOrder.customer.email}</p>
                        {selectedOrder.customer.phone && <p className="text-gray-500">{selectedOrder.customer.phone}</p>}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip_code}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  {selectedOrder.items?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" /> Items ({selectedOrder.items.length})
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Price</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-semibold text-neutral">{item.productName || item.product_name || item.name}</p>
                                  <p className="text-xs text-gray-400">{item.supplierName || item.supplier_name || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                                <td className="px-4 py-3 text-right text-sm">${Number(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold">${Number(item.subtotal || (item.unitPrice || item.unit_price || 0) * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Status History */}
                  {selectedOrder.statusHistory?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" /> Status History
                      </h3>
                      <div className="space-y-2">
                        {selectedOrder.statusHistory.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              {entry.fromStatus && (
                                <>
                                  <span className="text-gray-400">{formatStatus(entry.fromStatus)}</span>
                                  <span className="text-gray-300">→</span>
                                </>
                              )}
                              <span className="font-semibold text-neutral">{formatStatus(entry.toStatus)}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.changedAt || entry.changed_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
