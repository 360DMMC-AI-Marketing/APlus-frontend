const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshPromise = null;

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem("accessToken", data.session.accessToken);
      localStorage.setItem("refreshToken", data.session.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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
    // On 401, try refreshing the token and retry once
    if (res.status === 401 && !options._retried) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return apiClient(endpoint, { ...options, _retried: true });
      }
      // Refresh failed — clear auth and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
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
