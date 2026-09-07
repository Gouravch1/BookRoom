import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const BASE_URL = "https://mangalia-bookroom-78744507079.asia-south1.run.app";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT automatically
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bookroom_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("bookroom_token");
        localStorage.removeItem("bookroom_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bookroom_token");
}

export function setToken(token: string): void {
  localStorage.setItem("bookroom_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("bookroom_token");
  localStorage.removeItem("bookroom_user");
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data !== null) {
      const rec = data as Record<string, unknown>;
      const msg = rec.message || rec.error;
      if (typeof msg === "string" && msg.trim()) return msg;
      if (Array.isArray(rec.errors) && rec.errors.length > 0) {
        const first = rec.errors[0];
        if (typeof first === "string") return first;
        if (typeof first === "object" && first !== null) {
          const firstObj = first as Record<string, unknown>;
          if (typeof firstObj.defaultMessage === "string") return firstObj.defaultMessage;
          if (typeof firstObj.message === "string") return firstObj.message;
        }
      }
    }

    if (status === 401) return "Invalid email or password.";
    if (status === 403) return "You don't have access to this resource.";
    if (status === 404) return "Resource not found.";
    if (status === 409) return "Email or account already exists.";
    if (status === 400) return "Invalid request. Please check your input.";
    if (status && status >= 500) return "Server error. Please try again later.";
  }
  return "An unexpected error occurred.";
}

// For multipart uploads — do not set Content-Type (browser does it)
export function multipartConfig(): AxiosRequestConfig {
  return {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
}
