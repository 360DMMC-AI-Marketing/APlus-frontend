import { apiClient } from "./client";

export async function getProducts(params = {}) {
  return apiClient.get("/products", params);
}

export async function getProductById(id) {
  return apiClient(`/products/${id}`);
}

export async function createProduct(body) {
  return apiClient.post("/products", body);
}

export async function updateProduct(id, body) {
  return apiClient.put(`/products/${id}`, body);
}

export async function deleteProduct(id) {
  return apiClient.del(`/products/${id}`);
}
