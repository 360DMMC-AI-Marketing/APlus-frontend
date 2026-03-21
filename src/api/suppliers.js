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

export async function getSupplierProductStats() {
  return apiClient("/suppliers/products/stats");
}

// ── Supplier Orders ──
export async function getSupplierOrders(params = {}) {
  return apiClient.get("/suppliers/me/orders", params);
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
