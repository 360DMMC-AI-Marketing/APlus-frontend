import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle,
  ChevronDown,
  Shield,
  Truck,
  Package,
  Award,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { getProductById, getProducts } from "../api/products";

import { inferCategory } from "../utils/inferCategory";

const getFdaBadge = (fdaStatus) => {
  if (!fdaStatus) return null;
  const number = fdaStatus.match(/#\w+/)?.[0] || "";
  if (fdaStatus.includes("Approved"))
    return { label: "FDA Approved", number, color: "bg-green-100 text-green-800 border-green-300" };
  if (fdaStatus.includes("510(k)"))
    return { label: "FDA 510(k) Cleared", number, color: "bg-blue-100 text-blue-800 border-blue-300" };
  if (fdaStatus.includes("EPA"))
    return { label: "EPA Registered", number, color: "bg-teal-100 text-teal-800 border-teal-300" };
  if (fdaStatus.includes("OSHA"))
    return { label: "OSHA/ANSI Certified", number, color: "bg-orange-100 text-orange-800 border-orange-300" };
  return { label: fdaStatus, number, color: "bg-gray-100 text-gray-800 border-gray-300" };
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setQuantity(1);
    setSelectedSupplierId(null);
    setShowAllSuppliers(false);
    setSelectedImageIndex(0);
    setProduct(null);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const baseName = (name) =>
      (name || "").toLowerCase().replace(/\s*\(.*?\)/g, "").replace(/\s*\d+\s*(pcs|pc|pack|box|ml|g|kg)?$/i, "").trim();

    getProductById(id)
      .then((data) => {
        const raw = data.data || data;
        const enriched = { ...raw, category: inferCategory(raw) };
        setProduct(enriched);

        // Search for similar products using the base name
        const productBase = baseName(raw.name);
        const searchTerm = productBase.split(" ").slice(0, 3).join(" ");
        return getProducts({ search: searchTerm, limit: 20 }).then((searchData) => {
          const list = searchData.data || searchData;
          const similar = (Array.isArray(list) ? list : []).filter(
            (p) => p.id !== raw.id && p.status === "active" && p.name && baseName(p.name) === productBase
          );
          setSimilarProducts(similar);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center font-body text-gray-500">Loading product...</div>;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold font-body text-neutral mb-2">Product not found</h2>
          <Link to="/products" className="text-primary hover:text-primary/80 font-body">Back to Products</Link>
        </div>
      </div>
    );
  }

  const allSuppliers = [
    {
      productId: product.id,
      supplierId: product.supplierId,
      supplier: product.supplierName || product.supplier || "",
      price: product.price,
      stock: product.stockQuantity ?? product.stock ?? 0,
      rating: 4.8,
    },
    ...(product.otherSuppliers || []).map((s) => ({ ...s, productId: product.id })),
    ...similarProducts.map((p) => ({
      productId: p.id,
      supplierId: p.supplierId,
      supplier: p.supplierName || p.supplier || "",
      price: p.price,
      stock: p.stockQuantity ?? p.stock ?? 0,
      rating: 4.5,
    })),
  ].sort((a, b) => (a.price || 0) - (b.price || 0));

  const currentProductSupplier = allSuppliers.find((s) => s.productId === product.id) || allSuppliers[0];
  const activeSupplier = selectedSupplierId
    ? allSuppliers.find((s) => s.supplierId === selectedSupplierId) || currentProductSupplier
    : currentProductSupplier;

  const hasMultipleSuppliers = allSuppliers.length > 1;
  const visibleSuppliers = showAllSuppliers ? allSuppliers : allSuppliers.slice(0, 2);
  const hiddenCount = allSuppliers.length - 2;

  const handleAddToCart = () => {
    addItem(
      {
        id: activeSupplier.productId || product.id,
        name: product.name || "",
        price: Number(activeSupplier.price) || 0,
        stock: activeSupplier.stock ?? product.stock ?? 0,
        supplier: activeSupplier.supplier || "",
        supplierId: activeSupplier.supplierId || "",
        image: product.images?.[0] || "/placeholder.svg",
        category: product.category || "",
      },
      quantity,
    );
    // Stay on product page — user can navigate to cart via navbar icon
  };

  const incrementQuantity = () => {
    if (quantity < (activeSupplier.stock || 0)) setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const rawFda = product.specifications?.fda_status || product.fdaStatus || "";
  const fdaLabel = rawFda === "510k" ? "FDA 510(k) Cleared" : rawFda === "approved" ? "FDA Approved" : rawFda;
  const fdaBadge = getFdaBadge(fdaLabel);
  const specs = product.specifications || {};
  const description = product.description || "";

  // Build key features from description sentences + specifications
  const descFeatures = description
    .split(/\n|\.(?=\s)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 120);
  const specFeatures = Object.entries(specs)
    .filter(([key]) => key !== "fda_status")
    .map(([key, value]) => `${key}: ${value}`);
  const features = [...descFeatures, ...specFeatures].slice(0, 8);

  const totalPrice = (Number(activeSupplier.price) || 0) * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── LEFT: Image ── */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 relative">
              {fdaBadge && (
                <span className={`absolute top-6 left-6 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${fdaBadge.color}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {fdaBadge.label} {fdaBadge.number}
                </span>
              )}
              <img
                src={product.images?.[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-xl"
              />
            </div>
            {/* Thumbnail gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {product.category}
                </span>
              )}
              {fdaBadge && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${fdaBadge.color}`}>
                  <CheckCircle className="w-3 h-3" />
                  {fdaBadge.label} {fdaBadge.number}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl text-neutral leading-tight">
              {product.name}
            </h1>

            {/* Short description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              {description ? description.split("\n")[0] : "No description available."}
            </p>

            {/* ── Compare Prices ── */}
            {hasMultipleSuppliers ? (
              <div className="rounded-2xl border border-red-100 bg-[#fff5f5] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-neutral" />
                    <p className="text-[13px] font-bold text-neutral">
                      Compare Prices — {allSuppliers.length} Suppliers
                    </p>
                  </div>
                  <button onClick={() => setShowAllSuppliers(!showAllSuppliers)} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                    {showAllSuppliers ? "Show less" : "Expand all"} <ChevronDown className={`w-3 h-3 transition-transform ${showAllSuppliers ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Supplier rows */}
                <div className="bg-white divide-y divide-gray-100">
                  {visibleSuppliers.map((s, i) => {
                    const isActive = activeSupplier.supplierId === s.supplierId;
                    const isDifferentProduct = s.productId && s.productId !== product.id;
                    return (
                      <div
                        key={s.supplierId || i}
                        className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (isDifferentProduct) {
                            navigate(`/products/${s.productId}`);
                          } else {
                            setSelectedSupplierId(s.supplierId);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {isActive ? (
                            <div className="w-[18px] h-[18px] rounded-full bg-primary border-[3px] border-primary flex items-center justify-center flex-shrink-0">
                              <div className="w-[6px] h-[6px] rounded-full bg-white" />
                            </div>
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 bg-white flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral">{s.supplier}</span>
                              {i === 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Best Price</span>}
                              {i === 1 && allSuppliers.length > 2 && <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">Featured</span>}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-yellow-500">★</span>
                              <span className="text-xs text-gray-400">{s.rating || "4.5"}</span>
                              <span className="text-xs text-gray-400 ml-1">{s.stock} in stock</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-neutral">${Number(s.price || 0).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* More suppliers link */}
                {!showAllSuppliers && hiddenCount > 0 && (
                  <div className="border-t border-red-100 py-3 text-center bg-white">
                    <button
                      onClick={() => setShowAllSuppliers(true)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      + {hiddenCount} more supplier{hiddenCount > 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Single supplier */
              <div className="rounded-2xl border border-red-100 bg-[#fff5f5] p-5">
                <p className="text-4xl font-bold text-primary">
                  ${Number(activeSupplier.price || 0).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 ml-2">per unit</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Supplier: <span className="font-semibold text-neutral">{activeSupplier.supplier}</span>
                </p>
                <p className="text-sm">
                  Stock: <span className={`font-semibold ${activeSupplier.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {activeSupplier.stock > 0 ? `${activeSupplier.stock} units available` : "Out of stock"}
                  </span>
                </p>
              </div>
            )}

            {/* Selected supplier summary */}
            {hasMultipleSuppliers && (
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#f7f6f4] to-[#eeedea] px-5 py-4">
                <div>
                  <p className="text-[11px] text-gray-400">Selected supplier</p>
                  <p className="text-sm font-bold text-neutral mt-0.5">{activeSupplier.supplier}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{activeSupplier.stock} units available</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">${Number(activeSupplier.price || 0).toFixed(2)}</p>
                  <p className="text-[11px] text-gray-400 italic">per unit</p>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold font-body text-neutral mb-3">Quantity</p>
              <div className="flex items-center gap-5">
                <div className="inline-flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
                  <button onClick={decrementQuantity} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input value={quantity} readOnly className="w-14 h-11 text-center font-semibold text-neutral bg-gray-50 border-x border-gray-200" />
                  <button onClick={incrementQuantity} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Total: <span className="text-lg font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!activeSupplier.stock}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[15px]"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            {/* Key Features */}
            <div>
              <h3 className="font-display text-lg text-neutral mb-4">Key Features</h3>
              {features.length > 0 ? (
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No key features listed.</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {fdaBadge ? (
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle className="w-7 h-7 text-primary mb-2" />
                  <span className="text-xs font-semibold text-neutral leading-tight">{fdaBadge.label}</span>
                  {fdaBadge.number && <span className="text-[10px] text-gray-400 mt-0.5">{fdaBadge.number}</span>}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Shield className="w-7 h-7 text-primary mb-2" />
                  <span className="text-xs font-semibold text-neutral leading-tight">Certified Product</span>
                </div>
              )}
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Award className="w-7 h-7 text-primary mb-2" />
                <span className="text-xs font-semibold text-neutral leading-tight">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Truck className="w-7 h-7 text-primary mb-2" />
                <span className="text-xs font-semibold text-neutral leading-tight">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Package className="w-7 h-7 text-primary mb-2" />
                <span className="text-xs font-semibold text-neutral leading-tight">Secure Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
