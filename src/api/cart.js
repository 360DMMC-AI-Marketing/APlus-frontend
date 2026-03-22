import { apiClient } from "./client";

export async function getBackendCart() {
  return apiClient("/cart");
}

export async function addCartItem(productId, quantity) {
  return apiClient.post("/cart/items", {
    productId: String(productId),
    quantity: parseInt(quantity, 10),
  });
}

export async function updateCartItem(itemId, quantity) {
  return apiClient.put(`/cart/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId) {
  return apiClient.del(`/cart/items/${itemId}`);
}

export async function clearBackendCart() {
  return apiClient.del("/cart");
}

// Sync frontend cart to backend cart
export async function syncCartToBackend(items) {
  // Clear existing backend cart first
  await clearBackendCart();

  // Add each frontend item to backend cart
  for (const item of items) {
    await addCartItem(
      item.id,
      item.quantity
    );
  }
}
