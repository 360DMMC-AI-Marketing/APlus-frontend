import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Package, Truck, Shield, ArrowLeft, Plus, Minus, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { mockProducts } from '../utils/mockData';
import { useCartStore } from '../store/cartStore';
import { getPricing } from './vendor/VendorProducts';

// FDA badge color/label mapping
const getFdaBadge = (fdaStatus) => {
  if (!fdaStatus) return null;
  if (fdaStatus.includes('Approved')) return { label: 'FDA Approved', color: 'bg-green-100 text-green-800 border-green-300' };
  if (fdaStatus.includes('510(k)')) return { label: 'FDA 510(k) Cleared', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  if (fdaStatus.includes('EPA')) return { label: 'EPA Registered', color: 'bg-teal-100 text-teal-800 border-teal-300' };
  if (fdaStatus.includes('OSHA')) return { label: 'OSHA/ANSI Certified', color: 'bg-orange-100 text-orange-800 border-orange-300' };
  return { label: fdaStatus, color: 'bg-gray-100 text-gray-800 border-gray-300' };
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null); // null = primary
  const addItem = useCartStore((state) => state.addItem);
  
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral mb-2">Product not found</h2>
          <Link to="/products" className="text-primary hover:text-primary/80">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Build the full supplier list: primary + others
  const allSuppliers = [
    { supplierId: product.supplierId, supplier: product.supplier, price: product.price, stock: product.stock, rating: 4.8, isPrimary: true },
    ...(product.otherSuppliers || []).map(s => ({ ...s, isPrimary: false })),
  ].sort((a, b) => a.price - b.price);

  const activeSupplier = selectedSupplierId
    ? allSuppliers.find(s => s.supplierId === selectedSupplierId) || allSuppliers[0]
    : allSuppliers[0];

  const handleAddToCart = () => {
    addItem({ ...product, price: activeSupplier.price, supplier: activeSupplier.supplier, supplierId: activeSupplier.supplierId }, quantity);
    navigate('/cart');
  };

  const incrementQuantity = () => { if (quantity < activeSupplier.stock) setQuantity(quantity + 1); };
  const decrementQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };

  const fdaBadge = getFdaBadge(product.fdaStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="glass-card p-6 relative">
              <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
              {/* FDA Badge overlay on image */}
              {fdaBadge && (
                <div className="absolute top-8 left-8">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${fdaBadge.color}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {fdaBadge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in animate-delay-200">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="badge-status bg-primary/10 text-primary">{product.category}</span>
              {/* FDA Badge inline */}
              {fdaBadge && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${fdaBadge.color}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {fdaBadge.label}
                  {product.fdaNumber && <span className="opacity-70">#{product.fdaNumber}</span>}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl text-neutral mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* ─── Multi-Supplier Price Comparison ─── */}
            {allSuppliers.length > 1 ? (
              <div className="mb-6 bg-white rounded-xl border-2 border-primary/20 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-primary/10">
                  <h3 className="font-semibold text-sm text-secondary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Compare Prices — {allSuppliers.length} Suppliers
                  </h3>
                  <button onClick={() => setShowAllSuppliers(!showAllSuppliers)} className="text-xs text-primary font-semibold flex items-center gap-1">
                    {showAllSuppliers ? 'Collapse' : 'Expand all'}
                    {showAllSuppliers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {(showAllSuppliers ? allSuppliers : allSuppliers.slice(0, 2)).map((s, idx) => {
                    const isSelected = activeSupplier.supplierId === s.supplierId;
                    const isCheapest = idx === 0;
                    return (
                      <button
                        key={s.supplierId}
                        onClick={() => setSelectedSupplierId(s.supplierId)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors text-left ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary' : 'border-gray-300'}`}>
                            {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-neutral">{s.supplier}</span>
                              {isCheapest && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">Best Price</span>}
                              {s.isPrimary && !isCheapest && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">Featured</span>}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-500">{s.rating}</span>
                              <span className="text-xs text-gray-400 ml-1">{s.stock} in stock</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-neutral'}`}>${s.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>

                {!showAllSuppliers && allSuppliers.length > 2 && (
                  <button onClick={() => setShowAllSuppliers(true)} className="w-full py-2.5 text-xs text-primary font-semibold hover:bg-primary/5 transition-colors border-t border-gray-100">
                    + {allSuppliers.length - 2} more supplier{allSuppliers.length - 2 > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            ) : (
              /* Single supplier — price block with discount support */
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mb-6">
                {(() => {
                  const { hasDiscount, displayPrice, originalPrice, discountPct } = getPricing(product);
                  return hasDiscount ? (
                    <div className="mb-2">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-4xl font-bold text-primary">${displayPrice.toFixed(2)}</span>
                        <span className="text-xl text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                        <span className="px-2.5 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">-{discountPct}% OFF</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">You save ${(originalPrice - displayPrice).toFixed(2)} per unit</p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-bold text-primary">${displayPrice.toFixed(2)}</span>
                      <span className="text-gray-500">per unit</span>
                    </div>
                  );
                })()}
                <p className="text-sm text-gray-600">Supplier: <span className="font-semibold">{product.supplier}</span></p>
                <p className="text-sm text-gray-600">Stock: <span className="font-semibold text-green-600">{product.stock} units available</span></p>
              </div>
            )}

            {/* Active Supplier Summary (when multi-supplier) */}
            {allSuppliers.length > 1 && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Selected supplier</p>
                  <p className="text-sm font-semibold text-neutral">{activeSupplier.supplier}</p>
                  <p className="text-xs text-gray-500">{activeSupplier.stock} units available</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-primary">${activeSupplier.price.toFixed(2)}</span>
                  <p className="text-xs text-gray-500">per unit</p>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={decrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => { const val = parseInt(e.target.value); if (val >= 1 && val <= activeSupplier.stock) setQuantity(val); }}
                  className="w-20 text-center input-medical"
                  min="1"
                  max={activeSupplier.stock}
                />
                <button onClick={incrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Total: <span className="font-bold text-primary">${(activeSupplier.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button onClick={handleAddToCart} className="w-full btn-medical mb-6">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — {activeSupplier.supplier}
            </button>

            {/* Product Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-neutral">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-neutral mb-4">Specifications</h3>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className="text-sm font-semibold text-neutral mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Trust Badges — includes FDA if present */}
            <div className={`mt-6 grid gap-4 ${fdaBadge ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {fdaBadge && (
                <div className={`text-center p-4 bg-white rounded-lg shadow-sm border-2 ${fdaBadge.color.includes('green') ? 'border-green-200' : 'border-blue-200'}`}>
                  <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${fdaBadge.color.includes('green') ? 'text-green-600' : 'text-blue-600'}`} />
                  <p className="text-xs font-bold text-gray-700">{fdaBadge.label}</p>
                  {product.fdaNumber && <p className="text-xs text-gray-400 mt-0.5">#{product.fdaNumber}</p>}
                </div>
              )}
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Quality Assured</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Fast Delivery</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">Secure Packaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
