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
  try {
    await clearBackendCart();
  } catch (err) {
    console.error("[Cart] Clear failed:", err.status, err.message, err.data);
  }

  // Add each frontend item to backend cart
  for (const item of items) {
    try {
      console.log("[Cart] Adding item:", item.id, "qty:", item.quantity);
      await addCartItem(item.id, item.quantity);
    } catch (err) {
      console.error("[Cart] Add item failed:", item.id, err.status, err.message, err.data);
      throw err;
    }
  }
}
