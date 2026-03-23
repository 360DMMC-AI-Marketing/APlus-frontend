const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle empty responses (204, or empty body)
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.message || data.error?.message || `API Error ${res.status}`,
      data
    );
  }

  return data;
}

// Convenience helpers
apiClient.get = (endpoint, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`${endpoint}${query ? `?${query}` : ""}`);
};

apiClient.post = (endpoint, body) =>
  apiClient(endpoint, { method: "POST", body: JSON.stringify(body) });

apiClient.put = (endpoint, body) =>
  apiClient(endpoint, { method: "PUT", body: JSON.stringify(body) });

apiClient.del = (endpoint) =>
  apiClient(endpoint, { method: "DELETE" });
