import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, MessageSquare, Filter } from "lucide-react";
import {
  getAdminProducts,
  approveProduct,
  rejectProduct,
  requestProductChanges,
} from "../../api/admin";
import { resolveProductImages } from "../../utils/imageHelper";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "needs_revision", label: "Needs Revision" },
  { value: "inactive", label: "Inactive" },
];

const statusStyle = (status) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "pending": case "pending_review": return "bg-yellow-100 text-yellow-800";
    case "rejected": return "bg-red-100 text-red-800";
    case "needs_revision": return "bg-orange-100 text-orange-800";
    case "inactive": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-800";
  }
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // productId being actioned
  const [feedbackModal, setFeedbackModal] = useState(null); // { productId, type: 'reject' | 'changes' }
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts({ limit: 100 });
      const list = data.products || data.data || data;
      const prods = Array.isArray(list) ? list : [];

      // Resolve raw storage paths to signed URLs
      Promise.all(
        prods.map(async (p) => {
          const images = await resolveProductImages(p);
          return { ...p, images };
        })
      ).then(setProducts);

      setProducts(prods); // show immediately, images resolve in background
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── ACTIONS ──
  const handleApprove = async (productId) => {
    setActionLoading(productId);
    try {
      await approveProduct(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: "active" } : p))
      );
    } catch (err) {
      alert(err?.data?.message || err.message || "Failed to approve product");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!feedbackModal) return;
    setActionLoading(feedbackModal.productId);
    try {
      await rejectProduct(feedbackModal.productId, { reason: feedbackText });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === feedbackModal.productId ? { ...p, status: "rejected" } : p
        )
      );
      setFeedbackModal(null);
      setFeedbackText("");
    } catch (err) {
      alert(err?.data?.message || err.message || "Failed to reject product");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedbackModal) return;
    setActionLoading(feedbackModal.productId);
    try {
      await requestProductChanges(feedbackModal.productId, { feedback: feedbackText });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === feedbackModal.productId ? { ...p, status: "needs_revision" } : p
        )
      );
      setFeedbackModal(null);
      setFeedbackText("");
    } catch (err) {
      alert(err?.data?.message || err.message || "Failed to request changes");
    } finally {
      setActionLoading(null);
    }
  };

  // ── FILTER ──
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = products.filter((p) => p.status === "pending" || p.status === "pending_review").length;

  if (loading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-yellow-700">{pendingCount}</span>
          </div>
          <div>
            <p className="font-semibold text-yellow-800">Products awaiting approval</p>
            <p className="text-sm text-yellow-600">Review and approve vendor-submitted products</p>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="ml-auto px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors"
          >
            View Pending
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, SKU, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", count: products.length, color: "text-neutral" },
          { label: "Active", count: products.filter((p) => p.status === "active").length, color: "text-green-600" },
          { label: "Pending", count: pendingCount, color: "text-yellow-600" },
          { label: "Rejected", count: products.filter((p) => p.status === "rejected").length, color: "text-red-600" },
          { label: "Revision", count: products.filter((p) => p.status === "needs_revision").length, color: "text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">No products found</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stock = product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0;
                  const isPending = product.status === "pending" || product.status === "pending_review";
                  const isActioning = actionLoading === product.id;

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 ${isPending ? "bg-yellow-50/30" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-neutral">{product.name}</p>
                            <p className="text-xs text-gray-400">SKU: {product.sku || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${stock < 20 ? "text-red-600" : "text-green-600"}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.supplierName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(product.status)}`}>
                          {(product.status || "draft").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(product.id)}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => { setFeedbackModal({ productId: product.id, type: "changes" }); setFeedbackText(""); }}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                title="Request Changes"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Revise
                              </button>
                              <button
                                onClick={() => { setFeedbackModal({ productId: product.id, type: "reject" }); setFeedbackText(""); }}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {product.status === "needs_revision" && (
                            <span className="text-xs text-orange-600 italic">Awaiting vendor revision</span>
                          )}
                          {product.status === "active" && (
                            <span className="text-xs text-green-600 font-medium">Live</span>
                          )}
                          {product.status === "rejected" && (
                            <span className="text-xs text-red-500 italic">Rejected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FEEDBACK MODAL (Reject / Request Changes) ── */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="font-display text-xl text-neutral">
                {feedbackModal.type === "reject" ? "Reject Product" : "Request Changes"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {feedbackModal.type === "reject"
                  ? "Provide a reason for rejection. The vendor will be notified."
                  : "Describe what changes are needed. The vendor can revise and resubmit."}
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="input-medical resize-none"
                rows="4"
                placeholder={
                  feedbackModal.type === "reject"
                    ? "Reason for rejection..."
                    : "What changes are needed..."
                }
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => { setFeedbackModal(null); setFeedbackText(""); }}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={feedbackModal.type === "reject" ? handleReject : handleRequestChanges}
                disabled={!feedbackText.trim() || actionLoading}
                className={`px-5 py-2.5 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  feedbackModal.type === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : feedbackModal.type === "reject" ? "Reject Product" : "Request Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
