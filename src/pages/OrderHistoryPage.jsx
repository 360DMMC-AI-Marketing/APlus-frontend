import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, Download, RefreshCw } from 'lucide-react';
import { mockOrders } from '../utils/mockData';

// Generate a simple HTML invoice and trigger browser print-to-PDF
const downloadInvoice = (order) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; color: #1a1a2e; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0066ff; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 900; color: #0066ff; }
    .logo span { color: #ff6600; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; color: #1a1a2e; }
    .invoice-meta p { color: #666; font-size: 14px; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f4ff; padding: 10px 14px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
    td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row td { font-weight: bold; background: #f7f9ff; border-top: 2px solid #0066ff; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .badge-delivered { background: #d1fae5; color: #065f46; }
    .badge-transit { background: #dbeafe; color: #1e40af; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">APlusMed<span>Depot</span></div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${order.id}</strong></p>
      <p>Date: ${new Date(order.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
      <p>Status: <span class="badge badge-${order.status === 'delivered' ? 'delivered' : 'transit'}">${order.status === 'delivered' ? 'Delivered' : 'In Transit'}</span></p>
    </div>
  </div>

  <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
    <div class="section">
      <h3>Bill To</h3>
      <p><strong>${order.shippingAddress.name}</strong></p>
      <p>${order.shippingAddress.company}</p>
      <p>${order.shippingAddress.street}</p>
      <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
    </div>
    <div class="section">
      <h3>Ship To</h3>
      <p><strong>${order.shippingAddress.name}</strong></p>
      <p>${order.shippingAddress.company}</p>
      <p>${order.shippingAddress.street}</p>
      <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Supplier</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="color:#666; font-size:13px">${item.supplier || 'APlusMedDepot'}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">$${item.price.toFixed(2)}</td>
        <td style="text-align:right"><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
      </tr>`).join('')}
      <tr class="total-row">
        <td colspan="4" style="text-align:right">ORDER TOTAL</td>
        <td style="text-align:right; color:#0066ff; font-size:16px">$${order.total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    APlusMedDepot · B2B Medical Supplies Marketplace · support@aplusmed.com<br/>
    This invoice was generated automatically. For questions, contact your account manager.
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
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (mockOrders.length === 0) {
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
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-neutral mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-neutral">{order.id}</h3>
                      <span className={`badge-status ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-neutral">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="p-6 bg-gray-50 rounded-b-xl">
                <h4 className="font-semibold text-sm text-neutral mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.company}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-6 border-t border-gray-100 flex gap-3">
                {order.status === 'in_transit' && (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
