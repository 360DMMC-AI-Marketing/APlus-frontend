import { apiClient } from "./client";

export async function getProfile() {
  return apiClient("/users/me");
}

export async function updateProfile(body) {
  return apiClient.put("/users/me", body);
}

export async function changePassword(body) {
  return apiClient.post("/users/me/change-password", body);
}

export async function getCreditStatus() {
  return apiClient("/users/me/credit");
}
