export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  sortBy?: "price" | "title" | "createdAt";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface AuditLog {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: "Product" | "User";
  entityId: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  changes: Record<string, { from: unknown; to: unknown }> | null;
  createdAt: string;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  entity?: "Product" | "User";
  action?: "CREATE" | "UPDATE" | "DELETE";
  userId?: string;
}
