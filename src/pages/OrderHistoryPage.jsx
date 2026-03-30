import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, Download, RefreshCw } from 'lucide-react';
import { getOrders, getOrderById } from '../api/orders';

// Fetch full order detail then generate HTML invoice for print-to-PDF
const downloadInvoice = async (order) => {
  let fullOrder = order;
  if (!order.items && !order.order_items) {
    try {
      const data = await getOrderById(order.id);
      fullOrder = data.order || data;
    } catch {
      fullOrder = order;
    }
  }
  generateInvoiceHtml(fullOrder);
};

const generateInvoiceHtml = (order) => {
  const addr = order.shipping_address || order.shippingAddress || {};
  const items = order.items || order.order_items || [];
  const total = Number(order.total_amount || order.total || 0);
  const orderId = order.order_number || order.id;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${orderId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; color: #1a1a2e; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0066ff; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 900; color: #0066ff; }
    .logo span { color: #ff6600; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; color: #1a1a2e; }
    .invoice-meta p { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f4ff; padding: 10px 14px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
    td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row td { font-weight: bold; background: #f7f9ff; border-top: 2px solid #0066ff; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">APlusMed<span>Depot</span></div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${orderId}</strong></p>
      <p>Date: ${new Date(order.created_at || order.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
    </div>
  </div>

  <div style="margin-bottom: 32px;">
    <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px;">Ship To</h3>
    <p><strong>${addr.name || ''}</strong></p>
    <p>${addr.company || ''}</p>
    <p>${addr.street || ''}</p>
    <p>${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
      <tr>
        <td>${item.name || item.product_name || ''}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">$${Number(item.unit_price || item.price || 0).toFixed(2)}</td>
        <td style="text-align:right"><strong>$${(Number(item.unit_price || item.price || 0) * item.quantity).toFixed(2)}</strong></td>
      </tr>`).join('')}
      <tr class="total-row">
        <td colspan="3" style="text-align:right">ORDER TOTAL</td>
        <td style="text-align:right; color:#0066ff; font-size:16px">$${total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    APlusMedDepot · B2B Medical Supplies Marketplace · support@aplusmed.com
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getOrders()
      .then(async (data) => {
        const list = data.orders || data.data || data;
        const orderList = Array.isArray(list) ? list : [];
        // Fetch full details (with items) for each order
        const detailed = await Promise.all(
          orderList.map(async (order) => {
            try {
              const detail = await getOrderById(order.id);
              const full = detail.order || detail.data || detail;
              return { ...order, ...full };
            } catch {
              return order;
            }
          })
        );
        setOrders(detailed);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fully_shipped':
      case 'partially_shipped': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'awaiting_fulfillment':
      case 'payment_confirmed': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
      case 'refunded': return <Package className="w-5 h-5 text-red-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'fully_shipped': return 'Shipped';
      case 'partially_shipped': return 'Partially Shipped';
      case 'awaiting_fulfillment': return 'Processing';
      case 'payment_confirmed': return 'Payment Confirmed';
      case 'payment_processing': return 'Payment Processing';
      case 'pending_payment': return 'Pending Payment';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'fully_shipped':
      case 'partially_shipped': return 'bg-blue-100 text-blue-800';
      case 'awaiting_fulfillment':
      case 'payment_confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 animate-slide-up">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="font-display text-3xl text-neutral mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders. Start shopping to see your order history here.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 btn-medical">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-neutral mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order, index) => {
            const total = Number(order.total_amount || order.total || 0);
            const orderId = order.order_number || order.id;
            const itemCount = order.item_count || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-neutral">{orderId}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {(() => {
                  const items = order.items || order.order_items || [];
                  if (items.length === 0) return null;
                  return (
                    <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral text-sm">{item.name || item.product_name}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-neutral text-sm">
                            ${(Number(item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {order.shipping_address && (
                  <div className="px-6 py-4 bg-gray-50">
                    <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                    </p>
                  </div>
                )}

                <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
                  {(order.status === 'fully_shipped' || order.status === 'partially_shipped') && (
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      Track Shipment
                    </button>
                  )}
                  <button
                    onClick={() => downloadInvoice(order)}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Invoice
                  </button>
                  {order.status === 'delivered' && (
                    <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Reorder
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
