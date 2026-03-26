import { apiClient } from "./client";

export async function login(email, password) {
  const data = await apiClient.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", data.session.accessToken);
  localStorage.setItem("refreshToken", data.session.refreshToken);
  return data.user;
}

export async function register(userData) {
  return apiClient.post("/auth/register", userData);
}
