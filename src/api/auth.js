import { apiClient } from "./client";

export async function login(email, password, captchaToken) {
  const body = { email, password };
  if (captchaToken) body.captchaToken = captchaToken;
  const data = await apiClient.post("/auth/login", body);
  localStorage.setItem("accessToken", data.session.accessToken);
  localStorage.setItem("refreshToken", data.session.refreshToken);
  return data.user;
}

export async function register(userData, captchaToken) {
  const body = { ...userData };
  if (captchaToken) body.captchaToken = captchaToken;
  return apiClient.post("/auth/register", body);
}
