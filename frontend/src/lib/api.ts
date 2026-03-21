import type {
  ApiResponse,
  AuthTokens,
  User,
  Product,
  LoginInput,
  RegisterInput,
  CreateProductInput,
  UpdateProductInput,
  ProductsQuery,
  PaginationMeta,
  AuditLog,
  AuditQuery,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!access || !refresh) return null;
  return { accessToken: access, refreshToken: refresh };
}

function saveTokens(tokens: AuthTokens) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const tokens = getTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  // Rate limit exceeded
  if (res.status === 429) {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          json?.error?.message ??
          "Demasiadas solicitudes. Por favor, intenta de nuevo mas tarde.",
      },
    } as ApiResponse<T>;
  }

  // Try refresh if 401
  if (res.status === 401 && tokens?.refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (refreshRes.ok) {
      const refreshJson = await refreshRes.json();
      if (refreshJson.success) {
        saveTokens(refreshJson.data);
        headers["Authorization"] = `Bearer ${refreshJson.data.accessToken}`;
        const retryRes = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        return retryRes.json();
      }
    }
    clearTokens();
  }

  return json;
}

// Auth
export async function login(data: LoginInput) {
  const res = await request<AuthTokens & { user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) saveTokens(res.data);
  return res;
}

export async function register(data: RegisterInput) {
  const res = await request<AuthTokens & { user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) saveTokens(res.data);
  return res;
}

export function logout() {
  clearTokens();
}

export function isAuthenticated(): boolean {
  return !!getTokens()?.accessToken;
}

// Users
export function getUsers(page = 1, limit = 10) {
  return request<User[]>(`/users?page=${page}&limit=${limit}`);
}

export function getUserById(id: string) {
  return request<User>(`/users/${id}`);
}

export function updateUser(id: string, data: { name?: string; email?: string }) {
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: string) {
  return request<User>(`/users/${id}`, { method: "DELETE" });
}

// Products
export function getProducts(query: ProductsQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProductById(id: string) {
  return request<Product>(`/products/${id}`);
}

export function createProduct(data: CreateProductInput) {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: UpdateProductInput) {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string) {
  return request<Product>(`/products/${id}`, { method: "DELETE" });
}

// Audit
export function getAuditLogs(query: AuditQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.entity) params.set("entity", query.entity);
  if (query.action) params.set("action", query.action);
  if (query.userId) params.set("userId", query.userId);
  const qs = params.toString();
  return request<AuditLog[]>(`/audit${qs ? `?${qs}` : ""}`);
}

export function getEntityAuditLogs(entity: string, entityId: string, page = 1, limit = 20) {
  return request<AuditLog[]>(`/audit/${entity}/${entityId}?page=${page}&limit=${limit}`);
}

// Health
export function healthCheck() {
  return request<{ status: string }>("/health");
}

export { saveTokens, clearTokens, getTokens };
