import axios from "axios";

// ==================== API CONFIG ====================

// Railway backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://youtube-ai-platform-production.up.railway.app";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ==================== REQUEST INTERCEPTOR ====================

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    // Skip auth routes
    if (token && !config.url?.includes("/auth/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ==================== RESPONSE INTERCEPTOR ====================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error);

    // Auto logout on 401
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH FUNCTIONS ====================

// LOGIN
export async function login(
  username: string,
  password: string
) {
  const params = new URLSearchParams();

  params.append("username", username);
  params.append("password", password);

  const res = await api.post(
    "/api/v1/auth/auth/login",
    params,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  // Save tokens + user
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "access_token",
      res.data.access_token
    );

    localStorage.setItem(
      "refresh_token",
      res.data.refresh_token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );
  }

  return res.data;
}

// REGISTER
export async function register(
  email: string,
  password: string,
  username?: string,
  full_name?: string
) {
  const res = await api.post(
    "/api/v1/auth/auth/register",
    {
      email,
      password,
      username,
      full_name,
    }
  );

  return res.data;
}

// ==================== SEO FUNCTIONS ====================

export async function generateSEO(
  topic: string,
  target_audience: string,
  key_points: string[] = []
) {
  const res = await api.post(
    "/api/v1/seo/optimize",
    {
      topic,
      target_audience,
      key_points,
    }
  );

  return res.data;
}

// ==================== AUTH UTILS ====================

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function getUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const userStr = localStorage.getItem("user");

  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

export function isAuthenticated() {
  return !!getAuthToken();
}

// ==================== AUTH HOOK ====================

export function useAuth() {
  return {
    user: getUser(),
    token: getAuthToken(),
    isAuthenticated: isAuthenticated(),
  };
}