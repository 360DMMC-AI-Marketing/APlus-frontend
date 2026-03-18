import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { mockProducts, categories } from "../utils/mockData";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getPricing } from "./vendor/VendorProducts";
import { getProducts } from "../api/products";

const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 – $50", min: 25, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A–Z", value: "name_asc" },
  { label: "In Stock First", value: "stock" },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-sm font-semibold text-neutral group-hover:text-primary transition-colors">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { user, isCustomer } = useAuthStore();

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data.data || data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeFilterCount = [
    selectedCategory !== "All Products",
    selectedPriceRange !== null,
    inStockOnly,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSelectedCategory("All Products");
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("default");
  };

  const filteredProducts = useMemo(() => {
    let results = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Products" ||
        product.category === selectedCategory;
      const matchesPrice =
        !selectedPriceRange ||
        (product.price >= selectedPriceRange.min &&
          product.price < selectedPriceRange.max);
      const matchesStock = !inStockOnly || product.stock > 0;
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    switch (sortBy) {
      case "price_asc":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock":
        results = [...results].sort((a, b) => b.stock - a.stock);
        break;
    }
    return results;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    inStockOnly,
    sortBy,
  ]);

  const Sidebar = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg text-neutral">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-primary font-semibold hover:text-primary/80 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Category">
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              {cat}
              <span
                className={`float-right text-xs ${selectedCategory === cat ? "text-white/70" : "text-gray-400"}`}
              >
                {cat === "All Products"
                  ? products.length
                  : products.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive = selectedPriceRange?.label === range.label;
            return (
              <button
                key={range.label}
                onClick={() => setSelectedPriceRange(isActive ? null : range)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isActive ? "border-primary" : "border-gray-300"}`}
                >
                  {isActive && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </span>
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 group">
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${inStockOnly ? "bg-primary" : "bg-gray-200"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-sm text-gray-700 font-medium">
            In stock only
          </span>
        </label>
      </FilterSection>
    </div>
  );

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-4xl text-neutral mb-1">
            Medical Supplies
          </h1>
          <p className="text-gray-500">
            Browse our comprehensive catalog of certified medical equipment
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm font-medium text-gray-700 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <Sidebar />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl text-neutral">Filters</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <Sidebar />
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full mt-6 btn-medical"
                >
                  Show {filteredProducts.length} products
                </button>
              </div>
            </div>
          )}

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Results count + active filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-neutral">
                  {filteredProducts.length}
                </span>{" "}
                product{filteredProducts.length !== 1 ? "s" : ""}
                {searchQuery && (
                  <>
                    {" "}
                    for "<span className="text-primary">{searchQuery}</span>"
                  </>
                )}
              </p>
              {selectedCategory !== "All Products" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All Products")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPriceRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">
                  {selectedPriceRange.label}
                  <button onClick={() => setSelectedPriceRange(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  In stock
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="card-medical animate-slide-up bg-white"
                    style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                  >
                    <Link to={`/products/${product.id}`}>
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {product.stock === 0 ? (
                          <div className="absolute top-2 right-2">
                            <span className="badge-status bg-gray-700 text-white text-xs">
                              Out of Stock
                            </span>
                          </div>
                        ) : (
                          product.stock < 20 && (
                            <div className="absolute top-2 right-2">
                              <span className="badge-status bg-accent text-white text-xs">
                                Low Stock
                              </span>
                            </div>
                          )
                        )}
                        {getPricing(product).hasDiscount && (
                          <div className="absolute bottom-2 right-2">
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                              -{getPricing(product).discountPct}% OFF
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold rounded-full">
                            {product.category}
                          </span>
                          {product.fdaStatus && (
                            <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {product.fdaStatus.includes("Approved")
                                ? "FDA Approved"
                                : product.fdaStatus.includes("510(k)")
                                  ? "FDA 510(k)"
                                  : product.fdaStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-neutral mb-1 hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mb-3">
                        {product.supplier}
                        {product.otherSuppliers?.length > 0 && (
                          <span className="ml-1 text-primary font-medium">
                            +{product.otherSuppliers.length} more supplier
                            {product.otherSuppliers.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        {(() => {
                          const {
                            hasDiscount,
                            displayPrice,
                            originalPrice,
                            discountPct,
                          } = getPricing(product);
                          return hasDiscount ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-primary">
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
                          ) : (
                            <p className="text-2xl font-bold text-primary">
                              ${displayPrice.toFixed(2)}
                            </p>
                          );
                        })()}
                        <p className="text-xs text-gray-400">
                          {product.stock} in stock
                        </p>
                      </div>
                      {user && isCustomer && isCustomer() ? (
                        <button
                          onClick={() => addItem(product, 1)}
                          disabled={product.stock === 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      ) : (
                        <Link
                          to={`/products/${product.id}`}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-semibold"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-semibold text-xl text-neutral mb-2">
                  No products found
                </h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <button onClick={clearAll} className="btn-medical px-6">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
