import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronUp, ChevronDown, ShieldCheck, RefreshCw } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { useCartStore } from "../store/cartStore";
import { getProducts } from "../api/products";
import { inferCategory } from "../utils/inferCategory";

const CATEGORY_COLORS = [
  "bg-rose-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-lime-600",
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All Products";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const { categories } = useCategories();

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        const enriched = (Array.isArray(list) ? list : []).map((p) => ({
          ...p,
          category: inferCategory(p),
        }));
        setProducts(enriched);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let results = products.filter((product) => {
      const name = product.name || "";
      const desc = product.description || "";
      const supplier = product.supplierName || product.supplier || "";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Products" ||
        product.category === selectedCategory;

      const matchesPrice =
        !selectedPriceRange ||
        (product.price >= selectedPriceRange.min &&
          product.price < selectedPriceRange.max);

      const stock = product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0;
      const matchesStock = !inStockOnly || stock > 0;

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
        results = [...results].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );
        break;
      case "stock":
        results = [...results].sort(
          (a, b) => (b.stockQuantity ?? b.stock_quantity ?? b.stock ?? 0) - (a.stockQuantity ?? a.stock_quantity ?? a.stock ?? 0),
        );
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

  // Get color for a category
  const getCategoryColor = (categoryName) => {
    const idx = categories.findIndex((c) => c.name === categoryName);
    return CATEGORY_COLORS[idx >= 0 ? idx % CATEGORY_COLORS.length : 0];
  };

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="font-display text-4xl text-neutral mb-1">
            Medical Supplies
          </h1>
          <p className="text-gray-500">
            Browse our comprehensive catalog of certified medical equipment
          </p>
        </div>

        {/* Search + Sort Row */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none transition-colors text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:outline-none text-sm font-medium text-neutral min-w-[180px] cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="stock">In Stock First</option>
          </select>
        </div>

        {/* Main Layout: Sidebar + Products */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-neutral">Filters</h2>
                {(selectedCategory !== "All Products" || selectedPriceRange || inStockOnly || sortBy !== "default") && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All Products");
                      setSelectedPriceRange(null);
                      setInStockOnly(false);
                      setSortBy("default");
                      setSearchQuery("");
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Clear all filters"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-neutral py-2 border-b border-gray-100 mb-2"
                >
                  Category
                  {categoryOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {categoryOpen && (
                  <div className="space-y-1">
                    {/* All Products */}
                    <button
                      onClick={() => setSelectedCategory("All Products")}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        selectedCategory === "All Products"
                          ? "bg-primary text-white font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>All Products</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          selectedCategory === "All Products"
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {products.length}
                      </span>
                    </button>

                    {/* Dynamic Categories */}
                    {categories.map((cat) => {
                      const count = categoryCounts[cat.name] || 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            selectedCategory === cat.name
                              ? "bg-primary text-white font-semibold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              selectedCategory === cat.name
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mt-4">
                <button
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-neutral py-2 border-b border-gray-100 mb-2"
                >
                  Price Range
                  {priceOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {priceOpen && (
                  <div className="space-y-1">
                    {[
                      { label: "Under $25", min: 0, max: 25 },
                      { label: "$25 – $50", min: 25, max: 50 },
                      { label: "$50 – $100", min: 50, max: 100 },
                      { label: "$100 – $200", min: 100, max: 200 },
                      { label: "Over $200", min: 200, max: Infinity },
                    ].map((range) => {
                      const isSelected =
                        selectedPriceRange?.min === range.min &&
                        selectedPriceRange?.max === range.max;
                      return (
                        <label
                          key={range.label}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="priceRange"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedPriceRange(isSelected ? null : range)
                            }
                            className="w-4 h-4 text-primary"
                          />
                          {range.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="mt-4">
                <button
                  onClick={() => setAvailabilityOpen(!availabilityOpen)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-neutral py-2 border-b border-gray-100 mb-2"
                >
                  Availability
                  {availabilityOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {availabilityOpen && (
                  <label className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                    <div
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        inStockOnly ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          inStockOnly ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-600">In stock only</span>
                  </label>
                )}
              </div>
            </div>
          </aside>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Product Count */}
            <p className="text-gray-500 mb-4">
              <span className="font-semibold text-neutral">{filteredProducts.length}</span>{" "}
              products
            </p>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const supplier = product.supplierName || product.supplier || "";
                  const rawFda = product.specifications?.fda_status || product.fdaStatus || product.fda_status || "";
                  const fdaStatus = rawFda === "510k" ? "FDA 510(k)" : rawFda === "approved" ? "FDA Approved" : rawFda;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
                    >
                      <Link to={`/products/${product.id}`} className="block relative">
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {product.category && (
                          <span className="absolute top-3 left-3 bg-white text-primary border border-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                            {product.category}
                          </span>
                        )}
                        {fdaStatus && (
                          <span className="absolute top-10 left-3 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {fdaStatus}
                          </span>
                        )}
                      </Link>

                      <div className="p-4 flex flex-col flex-1">
                        <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded mb-1 w-fit">
                          SAMPLE - Not For Purchase
                        </span>
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        {supplier && (
                          <p className="text-xs text-gray-500 mb-3">
                            {supplier}
                          </p>
                        )}

                        <div className="mt-auto">
                          <div className="flex items-end justify-between mb-3">
                            <span className="text-lg font-bold text-primary">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0} in stock
                            </span>
                          </div>

                          <Link
                            to={`/products/${product.id}`}
                            className="block w-full text-center border-2 border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">No products found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
