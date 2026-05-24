import axios from "axios";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Add auth token to requests (interceptor)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && !config.url?.includes("/auth/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH FUNCTIONS ====================
export async function login(username: string, password: string) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  
  const res = await api.post("/api/v1/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

export async function register(email: string, password: string, username?: string, full_name?: string) {
  const res = await api.post("/api/v1/auth/register", {
    email, password, username, full_name
  });
  return res.data;
}

// ==================== SEO FUNCTIONS ====================
export async function generateSEO(topic: string, target_audience: string, key_points: string[] = []) {
  const res = await api.post("/api/v1/seo/optimize", {
    topic,
    target_audience,
    key_points,
  });
  return res.data;
}

// ==================== UTILS ====================
export function getAuthToken() {
  return typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  return getAuthToken() !== null;
}

export function useAuth() {
  return {
    user: {
      id: 1,
      name: "Demo User",
      email: "demo@example.com",
    },
  };
}