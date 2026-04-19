import { apiClient } from "./client";

// ── Supplier Profile ──
export async function getSupplierProfile() {
  return apiClient("/suppliers/me");
}

export async function updateSupplierProfile(body) {
  return apiClient.put("/suppliers/me", body);
}

// ── Supplier Products ──
export async function getSupplierProducts(params = {}) {
  return apiClient.get("/suppliers/products", params);
}

export async function createSupplierProduct(body) {
  return apiClient.post("/suppliers/products", body);
}

export async function updateSupplierProduct(id, body) {
  return apiClient.put(`/suppliers/products/${id}`, body);
}

export async function deleteSupplierProduct(id) {
  return apiClient.del(`/suppliers/products/${id}`);
}

export async function uploadSupplierProductImage(productId, file) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/products/${productId}/images`,
    {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    }
  );

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

  if (!res.ok) {
    const msg = data.error?.message || data.message || `Upload failed (${res.status})`;
    console.error("Image upload failed:", res.status, data);
    throw new Error(msg);
  }

  return data;
}

export async function deleteSupplierProductImage(productId, imageIndex) {
  return apiClient.del(`/suppliers/products/${productId}/images/${imageIndex}`);
}

export async function getSupplierProductStats() {
  return apiClient("/suppliers/products/stats");
}

// ── Supplier Orders ──
export async function getSupplierOrders(params = {}) {
  return apiClient.get("/suppliers/me/orders", params);
}

export async function getSupplierOrderById(id) {
  return apiClient(`/suppliers/me/orders/${id}`);
}

export async function getSupplierOrderStats() {
  return apiClient("/suppliers/me/orders/stats");
}

// ── Supplier Analytics ──
export async function getSupplierDashboard() {
  return apiClient("/suppliers/analytics/dashboard");
}

export async function getSupplierAnalytics() {
  return apiClient("/suppliers/analytics/products");
}

export async function getSupplierTopProducts() {
  return apiClient("/suppliers/analytics/top-products");
}

export async function getSupplierRevenueTrend() {
  return apiClient("/suppliers/analytics/revenue-trend");
}

// ── Supplier Payouts ──
export async function getSupplierPayoutBalance() {
  return apiClient("/suppliers/me/payouts/balance");
}

export async function getSupplierPayoutSummary() {
  return apiClient("/suppliers/me/payouts/summary");
}

// ── Supplier Order Fulfillment ──
export async function updateFulfillmentStatus(itemId, body) {
  return apiClient.put(`/suppliers/me/orders/items/${itemId}/fulfillment`, body);
}

// ── Supplier Inventory ──
export async function getSupplierLowStock() {
  return apiClient("/suppliers/inventory/low-stock");
}
