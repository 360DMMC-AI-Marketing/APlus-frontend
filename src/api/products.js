import { apiRequest } from "../utils/api";

export function getProducts() {
  return apiRequest("/products");
}
