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
import { getProducts } from "../../api/products";

// ─── Helper: compute effective price & discount info ───────────────────────────
export const getPricing = (product) => {
  const original = product.originalPrice ?? null;
  const current = product.price;
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

// ─── Reusable price display ─────────────────────────────────
const PriceCell = ({ product }) => {
  const { hasDiscount, displayPrice, originalPrice, discountPct } =
    getPricing(product);
  if (!hasDiscount) {
    return (
      <span className="font-semibold text-neutral">
        ${displayPrice.toFixed(2)}
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">
          ${displayPrice.toFixed(2)}
        </span>
        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
          -{discountPct}%
        </span>
      </div>
      <span className="text-xs text-gray-400 line-through">
        ${originalPrice.toFixed(2)}
      </span>
    </div>
  );
};

const CATEGORIES = [
  "Surgical Supplies",
  "Personal Protection",
  "Laboratory",
  "Patient Care",
  "Emergency Medical",
];

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
  const [formError, setFormError] = useState("");

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvResults, setCsvResults] = useState(null);
  const [csvError, setCsvError] = useState("");
  const csvInputRef = useRef(null);

  // ✅ FETCH PRODUCTS
  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;

        // filter vendor products (safe fallback if mismatch)
        const filtered = list.filter(
          (p) => String(p.supplierId) === String(user?.vendorId),
        );

        setProducts(filtered.length ? filtered : list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── CSV (unchanged) ──
  const CSV_TEMPLATE = `name,category,price,stock,description\nSurgical Gloves Box 50,Personal Protection,14.99,100,Nitrile exam gloves latex-free`;

  const downloadCsvTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        });
      });

      setCsvResults({ parsed, errors: [] });
    };
    reader.readAsText(file);
  };

  const importCsvProducts = () => {
    setProducts((prev) => [...prev, ...csvResults.parsed]);
    setShowCsvModal(false);
  };

  // ── Filtering ──
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  const handleSave = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...form } : p,
        ),
      );
    } else {
      setProducts((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const discountedCount = products.filter(
    (p) => getPricing(p).hasDiscount,
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
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>
                <PriceCell product={p} />
              </td>
              <td>{p.stock}</td>
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
