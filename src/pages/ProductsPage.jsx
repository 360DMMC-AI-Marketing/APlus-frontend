import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../utils/constants";
import { useCartStore } from "../store/cartStore";
import { getProducts } from "../api/products";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl text-neutral mb-1">
            Medical Supplies
          </h1>
          <p className="text-gray-500">
            Browse our comprehensive catalog of certified medical equipment
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/products/${product.id}`} className="relative">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  />
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow">
                    SAMPLE - Testing Only
                  </span>
                </Link>
                <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-neutral hover:text-primary cursor-pointer mb-1">{product.name}</h3>
                </Link>
                <p className="text-lg font-bold text-primary mb-3">${Number(product.price).toFixed(2)}</p>

                <button className="w-full btn-medical text-sm py-2" onClick={() => {
                  addItem({
                    id: product.id,
                    name: product.name || '',
                    price: Number(product.price) || 0,
                    stock: product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0,
                    supplier: product.supplierName || product.supplier || '',
                    supplierId: product.supplierId || product.supplier_id || '',
                    image: product.images?.[0] || '/placeholder.svg',
                    category: product.category || '',
                  }, 1);
                  toast.success(`${product.name} added to cart`);
                }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">No products found</div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
