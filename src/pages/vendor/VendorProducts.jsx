import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  X,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/products";

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
  category: "",
  price: "",
  originalPrice: "",
  discountEnabled: false,
  discountType: "percent",
  discountValue: "",
  stock: "",
  description: "",
  imagePreview: "",
  imageFile: null,
};

const VendorProducts = () => {
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [csvResults, setCsvResults] = useState(null);
  const csvInputRef = useRef(null);

  // ✅ FETCH ONLY VENDOR PRODUCTS
  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        const safeList = Array.isArray(list) ? list : [];

        const filtered = safeList.filter(
          (p) => String(p.supplierId) === String(user?.vendorId)
        );

        setProducts(filtered); // ✅ FIXED (no fallback)
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── CSV IMPORT ──
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.trim().split("\n");
      const parsed = [];

      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",");

        parsed.push({
          id: "csv-" + Date.now() + "-" + i,
          name: cols[0],
          category: cols[1],
          price: parseFloat(cols[2]),
          stock: parseInt(cols[3]),
          description: cols[4] || "",
          supplierId: user?.vendorId, // ✅ FIX
        });
      });

      setCsvResults({ parsed });
    };

    reader.readAsText(file);
  };

  const importCsvProducts = () => {
    setProducts((prev) => [...prev, ...csvResults.parsed]);
    setCsvResults(null);
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
    setShowAddModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({ ...product, imagePreview: product.image });
    setShowAddModal(true);
  };

  // ── SAVE (CREATE / UPDATE) ──
  const handleSave = async () => {
    const productData = {
      name: form.name,
      category: form.category,
      price: Number(form.price) || 0,
      originalPrice: form.discountEnabled
        ? Number(form.originalPrice) || 0
        : undefined,
      stock: Number(form.stock) || 0,
      description: form.description || "",
      supplierId: user?.vendorId, // ✅ FIX
    };

    try {
      if (editingProduct) {
        const data = await updateProduct(editingProduct.id, productData);
        const updated = data.data || data;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...updated } : p
          )
        );
      } else {
        const data = await createProduct(productData);
        const created = data.data || data;

        setProducts((prev) => [created, ...prev]);
      }

      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save product"
      );
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete product"
      );
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
      <div className="flex justify-between">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded"
        />
        <button onClick={openAdd} className="btn-medical">
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div>Total: {products.length}</div>
        <div>On Sale: {discountedCount}</div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.name || "Unnamed"}</td>
              <td>{p.category || "-"}</td>
              <td>
                <PriceCell product={p} />
              </td>
              <td>{p.stock || 0}</td>
              <td>
                <button onClick={() => openEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorProducts;
