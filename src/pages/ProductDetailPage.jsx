import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { getPricing } from "./vendor/VendorProducts";
import { getProducts } from "../api/products";

// FDA badge color/label mapping
const getFdaBadge = (fdaStatus) => {
  if (!fdaStatus) return null;
  if (fdaStatus.includes("Approved"))
    return {
      label: "FDA Approved",
      color: "bg-green-100 text-green-800 border-green-300",
    };
  if (fdaStatus.includes("510(k)"))
    return {
      label: "FDA 510(k) Cleared",
      color: "bg-blue-100 text-blue-800 border-blue-300",
    };
  if (fdaStatus.includes("EPA"))
    return {
      label: "EPA Registered",
      color: "bg-teal-100 text-teal-800 border-teal-300",
    };
  if (fdaStatus.includes("OSHA"))
    return {
      label: "OSHA/ANSI Certified",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    };
  return {
    label: fdaStatus,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  };
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        const found = list.find((p) => String(p.id) === String(id));
        setProduct(found);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral mb-2">
            Product not found
          </h2>
          <Link to="/products" className="text-primary hover:text-primary/80">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const allSuppliers = [
    {
      supplierId: product.supplierId,
      supplier: product.supplier,
      price: product.price,
      stock: product.stock,
      rating: 4.8,
      isPrimary: true,
    },
    ...(product.otherSuppliers || []).map((s) => ({ ...s, isPrimary: false })),
  ].sort((a, b) => a.price - b.price);

  const activeSupplier = selectedSupplierId
    ? allSuppliers.find((s) => s.supplierId === selectedSupplierId) ||
      allSuppliers[0]
    : allSuppliers[0];

  const handleAddToCart = () => {
    addItem(
      {
        ...product,
        price: activeSupplier.price,
        supplier: activeSupplier.supplier,
        supplierId: activeSupplier.supplierId,
      },
      quantity,
    );
    navigate("/cart");
  };

  const incrementQuantity = () => {
    if (quantity < activeSupplier.stock) setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const fdaBadge = getFdaBadge(product.fdaStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="glass-card p-6 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {fdaBadge && (
                <div className="absolute top-8 left-8">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${fdaBadge.color}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {fdaBadge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl text-neutral mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                ${activeSupplier.price.toFixed(2)}
              </span>
              <p className="text-sm text-gray-600">
                {activeSupplier.stock} in stock
              </p>
            </div>

            <div className="mb-6">
              <button onClick={decrementQuantity}>-</button>
              <input value={quantity} readOnly />
              <button onClick={incrementQuantity}>+</button>
            </div>

            <button onClick={handleAddToCart} className="btn-medical">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
