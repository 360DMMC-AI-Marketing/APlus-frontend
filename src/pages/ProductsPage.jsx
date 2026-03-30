import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../utils/constants";
import { getProducts } from "../api/products";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X, CheckCircle } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 – $50", min: 25, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

// ── Collapsible filter section ──
const FilterSection = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3">
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
};

// ── Product Card ──
const ProductCard = ({ product }) => {
  const stock = product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0;
  const supplierName = product.supplierName || product.supplier || "";
  const fdaStatus = product.specifications?.fda_status || product.fdaStatus || null;
  const image = product.images?.[0] || "/placeholder.svg";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Image + badges */}
      <Link to={`/products/${product.id}`} className="relative block">
        <img src={image} alt={product.name} className="w-full h-48 object-cover" />
        {product.category && (
          <span className="absolute top-3 left-3 bg-white text-primary border border-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {product.category}
          </span>
        )}
        {fdaStatus && (
          <span className="absolute top-10 left-3 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {fdaStatus === "510k" ? "FDA 510(k)" : "FDA Approved"}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded mb-1 w-fit">
          SAMPLE - Not For Purchase
        </span>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {supplierName && (
          <p className="text-xs text-gray-500 mb-3">
            {supplierName}
            {product.supplierCount > 1 && (
              <span className="text-primary font-semibold"> +{product.supplierCount - 1} more supplier{product.supplierCount > 2 ? "s" : ""}</span>
            )}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <span className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-gray-400">{stock} in stock</span>
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
};

// ── Sidebar Filters ──
const Sidebar = ({
  categories,
  categoryCounts,
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  inStockOnly,
  setInStockOnly,
  totalCount,
}) => (
  <div className="w-full">
    <h2 className="text-lg font-bold text-gray-900 mb-5">Filters</h2>

    <FilterSection title="Category">
      <div className="space-y-1">
        <button
          onClick={() => setSelectedCategory("All Products")}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === "All Products"
              ? "bg-primary text-white font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span>All Products</span>
          <span className={selectedCategory === "All Products" ? "text-white/80" : "text-gray-400"}>{totalCount}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-white font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="truncate">{cat}</span>
            <span className={selectedCategory === cat ? "text-white/80" : "text-gray-400"}>{categoryCounts[cat] || 0}</span>
          </button>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Price Range">
      <div className="space-y-2">
        {PRICE_RANGES.map((range, i) => (
          <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
            <input
              type="radio"
              name="priceRange"
              checked={selectedPriceRange?.label === range.label}
              onChange={() => setSelectedPriceRange(range)}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            {range.label}
          </label>
        ))}
        {selectedPriceRange && (
          <button onClick={() => setSelectedPriceRange(null)} className="text-xs text-primary hover:underline mt-1">
            Clear price filter
          </button>
        )}
      </div>
    </FilterSection>

    <FilterSection title="Availability">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-gray-700">In stock only</span>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="toggle toggle-sm toggle-primary"
        />
      </label>
    </FilterSection>
  </div>
);

// ── Main Page ──
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Category list (without "All Products")
  const categoryList = CATEGORIES.filter((c) => c !== "All Products");

  // Category counts from actual data
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = product.name || "";
      const desc = product.description || "";
      const supplier = product.supplierName || product.supplier || "";

      const matchesSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Products" || product.category === selectedCategory;

      const matchesPrice =
        !selectedPriceRange ||
        (product.price >= selectedPriceRange.min && product.price < selectedPriceRange.max);

      const stock = product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0;
      const matchesStock = !inStockOnly || stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedPriceRange, inStockOnly]);

  const sidebarProps = {
    categories: categoryList,
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    selectedPriceRange,
    setSelectedPriceRange,
    inStockOnly,
    setInStockOnly,
    totalCount: products.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, description, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(selectedCategory !== "All Products" || selectedPriceRange || inStockOnly) && (
            <span className="w-2 h-2 bg-primary rounded-full"></span>
          )}
        </button>

        {/* Mobile filters drawer */}
        {showMobileFilters && (
          <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <Sidebar {...sidebarProps} />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <Sidebar {...sidebarProps} />
            </div>
          </aside>

          {/* Product grid */}
          <main className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4">
              <span className="text-primary font-bold text-base">{filteredProducts.length}</span> products
            </p>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSelectedPriceRange(null);
                    setInStockOnly(false);
                    setSearchQuery("");
                  }}
                  className="mt-4 text-primary font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
