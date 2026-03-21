import { apiClient } from "./client";

// Customer orders
export async function getOrders(params = {}) {
  return apiClient.get("/orders", params);
}

export async function getOrderById(id) {
  return apiClient(`/orders/${id}`);
}

// Create order from server-side cart
// Backend reads cart items internally — only shipping address needed
export async function createOrder(shippingAddress, notes = "") {
  return apiClient.post("/orders", {
    shipping_address: {
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip_code: shippingAddress.zip,
      country: shippingAddress.country || "US",
    },
    ...(notes && { notes }),
  });
}
