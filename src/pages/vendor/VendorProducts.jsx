import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Download, CheckCircle, X, Tag, AlertTriangle } from 'lucide-react';
import { mockProducts, mockVendors } from '../../utils/mockData';
import { useAuthStore } from '../../store/authStore';

// ─── Helper: compute effective price & discount info ───────────────────────────
export const getPricing = (product) => {
  const original = product.originalPrice ?? null;
  const current  = product.price;
  if (original && original > current) {
    const pct = Math.round(((original - current) / original) * 100);
    return { hasDiscount: true, displayPrice: current, originalPrice: original, discountPct: pct };
  }
  return { hasDiscount: false, displayPrice: current, originalPrice: null, discountPct: 0 };
};

// ─── Reusable price display used in the table ─────────────────────────────────
const PriceCell = ({ product }) => {
  const { hasDiscount, displayPrice, originalPrice, discountPct } = getPricing(product);
  if (!hasDiscount) {
    return <span className="font-semibold text-neutral">${displayPrice.toFixed(2)}</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">${displayPrice.toFixed(2)}</span>
        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">-{discountPct}%</span>
      </div>
      <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
    </div>
  );
};

const CATEGORIES = ['Surgical Supplies', 'Personal Protection', 'Laboratory', 'Patient Care', 'Emergency Medical'];

const EMPTY_FORM = {
  name: '', category: '', price: '', originalPrice: '',
  discountEnabled: false, discountType: 'percent', discountValue: '',
  stock: '', description: '', imagePreview: '', imageFile: null,
};

const VendorProducts = () => {
  const { user } = useAuthStore();
  const vendor = mockVendors.find(v => v.id === user?.vendorId) || mockVendors[0];
  const supplierIdMap = { 'VEN-001': 'SUP-001', 'VEN-002': 'SUP-002', 'VEN-003': 'SUP-003' };
  const legacyId = supplierIdMap[vendor.id];

  const [products, setProducts]             = useState(mockProducts.filter(p => p.supplierId === legacyId));
  const [searchQuery, setSearchQuery]       = useState('');
  const [showAddModal, setShowAddModal]     = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [formError, setFormError]           = useState('');

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvResults, setCsvResults]     = useState(null);
  const [csvError, setCsvError]         = useState('');
  const csvInputRef = useRef(null);

  // ── CSV ───────────────────────────────────────────────────────────────────
  const CSV_TEMPLATE = `name,category,price,stock,description\nSurgical Gloves Box 50,Personal Protection,14.99,100,Nitrile exam gloves latex-free\nIV Administration Set,Surgical Supplies,8.99,250,Sterile IV set with precision flow control`;

  const downloadCsvTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product_import_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.trim().split('\n');
      if (lines.length < 2) { setCsvError('CSV must have a header row and at least one data row.'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const required = ['name', 'category', 'price', 'stock'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) { setCsvError(`Missing required columns: ${missing.join(', ')}`); return; }
      const parsed = [], errors = [];
      lines.slice(1).forEach((line, i) => {
        if (!line.trim()) return;
        const cols = line.split(',').map(c => c.trim());
        const row = {};
        headers.forEach((h, idx) => row[h] = cols[idx] || '');
        if (!row.name) { errors.push(`Row ${i + 2}: Missing product name`); return; }
        if (!CATEGORIES.includes(row.category)) { errors.push(`Row ${i + 2}: Invalid category "${row.category}"`); return; }
        const price = parseFloat(row.price);
        if (isNaN(price) || price <= 0) { errors.push(`Row ${i + 2}: Invalid price "${row.price}"`); return; }
        const stock = parseInt(row.stock);
        if (isNaN(stock) || stock < 0) { errors.push(`Row ${i + 2}: Invalid stock "${row.stock}"`); return; }
        parsed.push({ id: 'csv-' + Date.now() + '-' + i, name: row.name, category: row.category, price, stock, description: row.description || '', supplierId: legacyId, supplier: vendor.name, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', features: [], specifications: {} });
      });
      setCsvResults({ parsed, errors });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importCsvProducts = () => {
    if (!csvResults?.parsed?.length) return;
    setProducts(prev => [...prev, ...csvResults.parsed]);
    setShowCsvModal(false);
    setCsvResults(null);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEdit = (product) => {
    const { hasDiscount, originalPrice } = getPricing(product);
    setForm({
      name:            product.name,
      category:        product.category,
      price:           hasDiscount ? originalPrice.toString() : product.price.toString(),
      originalPrice:   originalPrice ? originalPrice.toString() : '',
      discountEnabled: hasDiscount,
      discountType:    'newprice',
      discountValue:   hasDiscount ? product.price.toString() : '',
      stock:           product.stock.toString(),
      description:     product.description || '',
      imagePreview:    product.image || '',
      imageFile:       null,
    });
    setFormError('');
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, imagePreview: reader.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  // ── Compute final price from discount form fields ─────────────────────────
  const computeFinalPrice = () => {
    const basePrice = parseFloat(form.price);
    if (!form.discountEnabled || isNaN(basePrice)) return { finalPrice: basePrice, computedOriginal: null };
    const val = parseFloat(form.discountValue);
    if (isNaN(val) || val <= 0) return { finalPrice: basePrice, computedOriginal: null };
    if (form.discountType === 'percent') {
      if (val >= 100) return { finalPrice: basePrice, computedOriginal: null };
      return { finalPrice: parseFloat((basePrice * (1 - val / 100)).toFixed(2)), computedOriginal: basePrice };
    }
    if (form.discountType === 'amount') {
      const d = parseFloat((basePrice - val).toFixed(2));
      if (d <= 0) return { finalPrice: basePrice, computedOriginal: null };
      return { finalPrice: d, computedOriginal: basePrice };
    }
    if (form.discountType === 'newprice') {
      if (val >= basePrice) return { finalPrice: basePrice, computedOriginal: null };
      return { finalPrice: val, computedOriginal: basePrice };
    }
    return { finalPrice: basePrice, computedOriginal: null };
  };

  const { finalPrice, computedOriginal } = computeFinalPrice();

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    setFormError('');
    if (!form.name.trim())  { setFormError('Product name is required.'); return; }
    if (!form.category)     { setFormError('Please select a category.'); return; }
    const basePrice = parseFloat(form.price);
    if (isNaN(basePrice) || basePrice <= 0) { setFormError('Enter a valid price greater than 0.'); return; }
    if (form.discountEnabled) {
      const val = parseFloat(form.discountValue);
      if (isNaN(val) || val <= 0) { setFormError('Enter a valid discount value.'); return; }
      if (form.discountType === 'percent' && val >= 100) { setFormError('Discount percentage must be less than 100%.'); return; }
      if ((form.discountType === 'amount' || form.discountType === 'newprice') && val >= basePrice) {
        setFormError('Discounted price must be less than the original price.'); return;
      }
    }
    const productData = {
      name:          form.name.trim(),
      category:      form.category,
      price:         form.discountEnabled ? finalPrice : basePrice,
      originalPrice: form.discountEnabled ? computedOriginal : undefined,
      stock:         parseInt(form.stock) || 0,
      description:   form.description.trim(),
    };
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id
        ? { ...p, ...productData, image: form.imagePreview || p.image }
        : p
      ));
    } else {
      setProducts(prev => [...prev, {
        id: 'new-' + Date.now(),
        ...productData,
        supplierId: legacyId,
        supplier:   vendor.name,
        image:      form.imagePreview || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        features:   [],
        specifications: {},
      }]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this product from your store?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const discountedCount = products.filter(p => getPricing(p).hasDiscount).length;

  return (
    <div className="space-y-6">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCsvModal(true)} className="flex items-center gap-2 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-semibold whitespace-nowrap">
            <Upload className="w-4 h-4" /> Bulk Import CSV
          </button>
          <button onClick={openAdd} className="btn-medical flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-neutral">{products.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Products</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{discountedCount}</p>
          <p className="text-xs text-gray-500 mt-1">On Sale</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{products.filter(p => p.stock < 20).length}</p>
          <p className="text-xs text-gray-500 mt-1">Low Stock</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{products.filter(p => p.stock === 0).length}</p>
          <p className="text-xs text-gray-500 mt-1">Out of Stock</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                        {getPricing(product).hasDiscount && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">%</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral truncate max-w-xs">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">{product.description?.slice(0, 60)}{product.description?.length > 60 ? '...' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4"><PriceCell product={product} /></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-orange-500' : 'text-green-600'}`}>
                      {product.stock < 20 && product.stock > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No products found</div>}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up my-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl text-neutral">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-medical" placeholder="e.g. Surgical Gloves Box 100" />
              </div>

              {/* Category + Base Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-medical">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">
                    {form.discountEnabled ? 'Original Price ($) *' : 'Price ($) *'}
                  </label>
                  <input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-medical" placeholder="29.99" />
                </div>
              </div>

              {/* ── Discount Section ──────────────────────────────────────── */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-neutral">Add Discount / Sale Price</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discountEnabled: !f.discountEnabled, discountValue: '' }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.discountEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${form.discountEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {form.discountEnabled && (
                  <div className="space-y-3 pt-1">
                    {/* Discount type selector */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Discount Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'percent',  label: '% Off',        hint: 'e.g. 20%'   },
                          { val: 'amount',   label: '$ Amount Off',  hint: 'e.g. $5 off' },
                          { val: 'newprice', label: 'New Price',     hint: 'e.g. $24.99' },
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, discountType: opt.val, discountValue: '' }))}
                            className={`p-2.5 rounded-lg border-2 text-center transition-all ${form.discountType === opt.val ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                          >
                            <p className="text-xs font-bold">{opt.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{opt.hint}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discount value input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                        {form.discountType === 'percent'  && 'Discount Percentage'}
                        {form.discountType === 'amount'   && 'Amount Off ($)'}
                        {form.discountType === 'newprice' && 'New Sale Price ($)'}
                      </label>
                      <div className="relative">
                        {form.discountType !== 'percent' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                        )}
                        <input
                          type="number"
                          min="0.01"
                          step={form.discountType === 'percent' ? '1' : '0.01'}
                          max={form.discountType === 'percent' ? '99' : undefined}
                          value={form.discountValue}
                          onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                          className={`input-medical ${form.discountType !== 'percent' ? 'pl-7' : ''}`}
                          placeholder={form.discountType === 'percent' ? '20' : form.discountType === 'amount' ? '5.00' : '24.99'}
                        />
                        {form.discountType === 'percent' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                        )}
                      </div>
                    </div>

                    {/* Live preview */}
                    {form.price && form.discountValue && computedOriginal && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1.5">Preview — how customers will see it:</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
                          <span className="text-sm text-gray-400 line-through">${computedOriginal.toFixed(2)}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                            -{Math.round(((computedOriginal - finalPrice) / computedOriginal) * 100)}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Saving ${(computedOriginal - finalPrice).toFixed(2)} per unit</p>
                      </div>
                    )}

                    {/* Remove discount button — only in edit mode when product already has a discount */}
                    {editingProduct && getPricing(editingProduct).hasDiscount && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          discountEnabled: false,
                          discountValue: '',
                          price: getPricing(editingProduct).originalPrice?.toString() || f.price,
                        }))}
                        className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-2 px-3 rounded-lg border border-red-200 transition-colors"
                      >
                        ✕ Remove discount &amp; restore original price
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Initial Stock</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-medical" placeholder="100" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Product Image</label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  {form.imagePreview ? (
                    <div className="relative">
                      <img src={form.imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg mx-auto" />
                      <p className="text-xs text-primary mt-2 text-center font-medium">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-sm text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-medical resize-none" rows={3} placeholder="Brief product description..." />
              </div>

              {/* Form error */}
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 btn-medical">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV Import Modal ─────────────────────────────────────────────────── */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl text-neutral flex items-center gap-2"><Upload className="w-6 h-6 text-primary" /> Bulk Import Products</h3>
              <button onClick={() => { setShowCsvModal(false); setCsvResults(null); setCsvError(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Required CSV columns:</p>
              <p className="text-xs text-blue-700 font-mono">name, category, price, stock, description (optional)</p>
              <p className="text-xs text-blue-600 mt-1">Categories: {CATEGORIES.join(', ')}</p>
              <button onClick={downloadCsvTemplate} className="mt-2 text-xs text-blue-700 underline flex items-center gap-1"><Download className="w-3 h-3" /> Download template CSV</button>
            </div>
            {!csvResults && (
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <Upload className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">Click to upload your CSV file</p>
                <p className="text-xs text-gray-400 mt-1">.csv files only</p>
                <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            )}
            {csvError && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{csvError}</div>}
            {csvResults && (
              <div className="space-y-3 mt-2">
                {csvResults.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 mb-1">⚠️ {csvResults.errors.length} row(s) with errors (will be skipped):</p>
                    <ul className="space-y-0.5">{csvResults.errors.map((e, i) => <li key={i} className="text-xs text-red-700">• {e}</li>)}</ul>
                  </div>
                )}
                {csvResults.parsed.length > 0 ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {csvResults.parsed.length} product(s) ready to import:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {csvResults.parsed.map((p, i) => (
                        <div key={i} className="flex justify-between text-xs text-green-800">
                          <span className="font-medium truncate max-w-xs">{p.name}</span>
                          <span className="text-green-600 ml-2">${p.price} · {p.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 text-center">No valid products to import.</p>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCsvModal(false); setCsvResults(null); setCsvError(''); }} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
              {csvResults?.parsed?.length > 0 && (
                <button onClick={importCsvProducts} className="flex-1 btn-medical">Import {csvResults.parsed.length} Product{csvResults.parsed.length > 1 ? 's' : ''}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
