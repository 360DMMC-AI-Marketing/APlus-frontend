import { apiClient } from "./client";

// Stripe
export async function createPaymentIntent(orderId) {
  return apiClient.post("/payments/intent", { orderId });
}

export async function confirmPayment(orderId) {
  return apiClient.post("/payments/confirm", { orderId });
}

// PayPal
export async function createPayPalOrder(orderId) {
  return apiClient.post("/payments/paypal/create-order", { orderId });
}

export async function capturePayPalPayment(orderId) {
  return apiClient.post("/payments/paypal/capture", { orderId });
}

// Net30
export async function createNet30Payment(orderId) {
  return apiClient.post("/payments/net30", { orderId });
}
