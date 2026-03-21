import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { getProducts, createProduct, deleteProduct } from "../../api/products";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.data || data;
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed to delete product");
    }
  };

  const handleAdd = async () => {
    try {
      const newProduct = {
        name: "New Product",
        category: "General",
        price: 0,
        stock: 0,
        description: "Placeholder product — edit details after creation.",
      };

      const data = await createProduct(newProduct);
      const created = data.data || data;

      setProducts((prev) => [created, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed to create product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const name = product.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-medical whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Supplier
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "https://via.placeholder.com/100"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-neutral">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="badge-status bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary">
                      ${Number(product.price || 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        product.stock < 20
                          ? "text-red-600"
                          : product.stock < 50
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock || 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.supplier || ""}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl mb-4">Add New Product</h2>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button onClick={handleAdd} className="flex-1 btn-medical">
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
