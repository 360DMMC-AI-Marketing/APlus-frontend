import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import {
  getSupplierProducts,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct,
  uploadSupplierProductImage,
  deleteSupplierProductImage,
} from "../../api/suppliers";
import { resolveProductImages, getProductImageSrc } from "../../utils/imageHelper";
import { PRODUCT_CATEGORIES as CATEGORIES } from "../../utils/constants";

// ─── Pricing helper ─────────────────────────
export const getPricing = (product) => {
  const original = product.originalPrice ?? null;
  const current = product.price ?? 0;

  if (original && original > current) {
    const pct = Math.round(((original - current) / original) * 100);
    return {
      hasDiscount: true,
      displayPrice: current,
      originalPrice: original,
      discountPct: pct,
    };
  }

  return {
    hasDiscount: false,
    displayPrice: current,
    originalPrice: null,
    discountPct: 0,
  };
};

// ─── Price Cell ─────────────────────────
const PriceCell = ({ product }) => {
  const { hasDiscount, displayPrice, originalPrice, discountPct } =
    getPricing(product);

  if (!hasDiscount) {
    return (
      <span className="font-semibold text-neutral">
        ${Number(displayPrice).toFixed(2)}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">
          ${Number(displayPrice).toFixed(2)}
        </span>
        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
          -{discountPct}%
        </span>
      </div>
      <span className="text-xs text-gray-400 line-through">
        ${Number(originalPrice).toFixed(2)}
      </span>
    </div>
  );
};

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  originalPrice: "",
  stockQuantity: "",
  description: "",
  fdaStatus: "",
};

const FDA_OPTIONS = [
  { value: "", label: "None" },
  { value: "510k", label: "FDA 510(k)" },
  { value: "approved", label: "FDA Approved" },
];



const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Image upload state
  const [productImages, setProductImages] = useState([]); // existing images (URLs)
  const [pendingFiles, setPendingFiles] = useState([]); // files to upload after create
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getSupplierProducts();
      const list = data.products || data.data || data;
      const prods = Array.isArray(list) ? list : [];

      // Resolve raw storage paths to signed URLs
      const resolved = await Promise.all(
        prods.map(async (p) => {
          const images = await resolveProductImages(p);
          return { ...p, images };
        })
      );

      setProducts(resolved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── FILTER ──
  const filtered = products.filter((p) => {
    const name = p.name || "";
    const category = p.category || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingProduct(null);
    setProductImages([]);
    setPendingFiles([]);
    setError("");
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      stockQuantity: product.stockQuantity ?? product.stock_quantity ?? "",
      description: product.description || "",
      fdaStatus: product.specifications?.fda_status || "",
    });
    setProductImages(product.images || []);
    setPendingFiles([]);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductImages([]);
    setPendingFiles([]);
    setError("");
  };

  // ── IMAGE HANDLERS ──
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const totalCount = productImages.length + pendingFiles.length + files.length;
    if (totalCount > 5) {
      setError("Maximum 5 images per product");
      return;
    }
    for (const f of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB");
        return;
      }
    }
    setPendingFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageIndex) => {
    if (!editingProduct) return;
    try {
      await deleteSupplierProductImage(editingProduct.id, imageIndex);
      setProductImages((prev) => prev.filter((_, i) => i !== imageIndex));
      // Update in products list too
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, images: p.images.filter((_, i) => i !== imageIndex) }
            : p
        )
      );
    } catch (err) {
      setError(err?.data?.message || err.message || "Failed to remove image");
    }
  };

  const uploadImages = async (productId) => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of pendingFiles) {
        await uploadSupplierProductImage(productId, file);
      }
      setPendingFiles([]);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Some images failed to upload");
    } finally {
      setUploading(false);
    }
  };

  // ── SAVE (CREATE / UPDATE) ──
  // Backend expects snake_case in request body
  const handleSave = async () => {
    if (!form.name.trim()) { setError("Product name is required"); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Valid price is required"); return; }

    setSaving(true);
    setError("");

    try {
      let savedProductId = null;

      if (editingProduct) {
        savedProductId = editingProduct.id;
        // Update — send snake_case fields
        const updateData = {
          name: form.name,
          price: Number(form.price),
          stock_quantity: Number(form.stockQuantity) || 0,
          description: form.description || "",
          category: form.category || undefined,
          original_price: form.originalPrice ? Number(form.originalPrice) : null,
          specifications: { fda_status: form.fdaStatus || null },
        };

        // For active products, backend only allows price and stock updates
        if (editingProduct.status === "active") {
          await updateSupplierProduct(editingProduct.id, {
            price: updateData.price,
            stock_quantity: updateData.stock_quantity,
            original_price: updateData.original_price,
          });
        } else {
          if (form.sku) updateData.sku = form.sku;
          await updateSupplierProduct(editingProduct.id, updateData);
        }
      } else {
        // Create — send snake_case fields
        const sku = form.sku.trim() || `SKU-${Date.now()}`;
        const createData = {
          name: form.name,
          sku: sku,
          price: Number(form.price),
          stock_quantity: Number(form.stockQuantity) || 0,
          description: form.description || "",
          category: form.category || undefined,
          original_price: form.originalPrice ? Number(form.originalPrice) : undefined,
          specifications: form.fdaStatus ? { fda_status: form.fdaStatus } : undefined,
        };

        const data = await createSupplierProduct(createData);
        const created = data.data || data;
        savedProductId = created.id;
      }

      // Upload any pending images
      if (pendingFiles.length > 0 && savedProductId) {
        try {
          await uploadImages(savedProductId);
        } catch (uploadErr) {
          // Product was saved but images failed — show error but don't close modal
          setError(`Product saved, but image upload failed: ${uploadErr.message}`);
          fetchProducts();
          setSaving(false);
          return;
        }
      }

      // Refresh the list to get updated data and image URLs
      fetchProducts();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteSupplierProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err.message || "Failed to delete product");
    }
  };

  const discountedCount = products.filter(
    (p) => getPricing(p).hasDiscount
  ).length;

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <button onClick={openAdd} className="btn-medical flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-neutral">{products.length}</p>
          <p className="text-xs text-gray-500">Total Products</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.status === "active").length}
          </p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {products.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-xs text-gray-500">Pending Approval</p>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          {products.length === 0 ? "No products yet. Click 'Add Product' to get started." : "No products match your search."}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const stock = p.stockQuantity ?? p.stock_quantity ?? p.stock ?? 0;
                const statusColor =
                  p.status === "active" ? "bg-green-100 text-green-800" :
                  p.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  p.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800";

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "/placeholder.svg"}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-neutral text-sm">{p.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-400">SKU: {p.sku || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.category || "—"}</td>
                    <td className="px-6 py-4">
                      <PriceCell product={p} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${stock < 20 ? "text-red-600" : "text-neutral"}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {(p.status || "draft").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-xl text-neutral">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {editingProduct?.status === "active" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  This product is active. Only price and stock can be updated.
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-medical"
                  placeholder="e.g. Nitrile Gloves (Box of 100)"
                  disabled={editingProduct?.status === "active"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input-medical"
                    placeholder="e.g. GLV-NIT-100"
                    disabled={!!editingProduct}
                  />
                  {!editingProduct && (
                    <p className="text-xs text-gray-400 mt-1">Letters, numbers, hyphens only. Auto-generated if empty.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-medical"
                    disabled={editingProduct?.status === "active"}
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">FDA Status</label>
                  <select
                    value={form.fdaStatus}
                    onChange={(e) => setForm({ ...form, fdaStatus: e.target.value })}
                    className="input-medical"
                  >
                    {FDA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-medical"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="input-medical"
                    placeholder="For discount display"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                  className="input-medical"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-medical resize-none"
                  rows="3"
                  placeholder="Product description..."
                  disabled={editingProduct?.status === "active"}
                />
              </div>

              {/* ── IMAGE UPLOAD ── */}
              <div>
                <label className="block text-sm font-semibold text-neutral mb-2">
                  Product Images
                  <span className="text-gray-400 font-normal ml-1">({productImages.length + pendingFiles.length}/5)</span>
                </label>

                {/* Existing images (when editing) */}
                {productImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {productImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending files preview */}
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {pendingFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => removePendingFile(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center rounded-b-lg py-0.5">
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {productImages.length + pendingFiles.length < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors w-full justify-center"
                    >
                      <Upload className="w-4 h-4" />
                      Click to upload images
                    </button>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP. Max 5MB each.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="btn-medical disabled:opacity-50"
              >
                {saving || uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploading ? "Uploading images..." : "Saving..."}
                  </span>
                ) : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
