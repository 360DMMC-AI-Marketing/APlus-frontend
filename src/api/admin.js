import { apiClient } from "./client";

// ── Dashboard ──
export async function getAdminDashboard() {
  return apiClient("/admin/dashboard");
}

// ── Users ──
export async function getAdminUsers(params = {}) {
  return apiClient.get("/admin/users", params);
}

export async function getAdminPendingUserCount() {
  return apiClient("/admin/users/pending-count");
}

export async function approveUser(id) {
  return apiClient.put(`/admin/users/${id}/approve`);
}

export async function rejectUser(id) {
  return apiClient.put(`/admin/users/${id}/reject`);
}

// ── Orders ──
export async function getAdminOrders(params = {}) {
  return apiClient.get("/admin/orders", params);
}

export async function getAdminOrderStatusCounts() {
  return apiClient("/admin/orders/status-counts");
}

// ── Suppliers (Vendors) ──
export async function getAdminSuppliers(params = {}) {
  return apiClient.get("/admin/suppliers", params);
}

export async function reviewSupplier(id) {
  return apiClient.put(`/admin/suppliers/${id}/review`);
}

export async function approveSupplier(id, body = {}) {
  return apiClient.put(`/admin/suppliers/${id}/approve`, body);
}

export async function rejectSupplier(id, body = {}) {
  return apiClient.put(`/admin/suppliers/${id}/reject`, body);
}

// ── Products ──
export async function getAdminProducts(params = {}) {
  return apiClient.get("/admin/products", params);
}

export async function getAdminPendingProducts(params = {}) {
  return apiClient.get("/admin/products/pending", params);
}

export async function approveProduct(id) {
  return apiClient.put(`/admin/products/${id}/approve`);
}

export async function rejectProduct(id, body = {}) {
  return apiClient.put(`/admin/products/${id}/reject`, body);
}

export async function requestProductChanges(id, body = {}) {
  return apiClient.put(`/admin/products/${id}/request-changes`, body);
}

// ── Analytics ──
export async function getAdminRevenue(params = {}) {
  return apiClient.get("/admin/analytics/revenue", params);
}

export async function getAdminRevenueByCategory() {
  return apiClient("/admin/analytics/revenue/categories");
}

export async function getAdminRevenueTrend() {
  return apiClient("/admin/analytics/revenue/trend");
}

export async function getAdminOrderMetrics() {
  return apiClient("/admin/analytics/orders");
}

export async function getAdminTopProducts() {
  return apiClient("/admin/analytics/top-products");
}

export async function getAdminCommissionEarnings() {
  return apiClient("/admin/commissions/earnings");
}

export async function getAdminCommissionBySupplier() {
  return apiClient("/admin/commissions/by-supplier");
}
