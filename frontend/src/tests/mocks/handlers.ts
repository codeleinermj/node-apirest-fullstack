import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:3000/api";

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const mockTokens = {
  accessToken: "fake-access-token",
  refreshToken: "fake-refresh-token",
};

export const handlers = [
  http.post(`${BASE_URL}/auth/login`, () =>
    HttpResponse.json({
      success: true,
      data: { ...mockTokens, user: mockUser },
    })
  ),

  http.post(`${BASE_URL}/auth/register`, () =>
    HttpResponse.json(
      { success: true, data: { ...mockTokens, user: mockUser } },
      { status: 201 }
    )
  ),

  http.post(`${BASE_URL}/auth/refresh`, () =>
    HttpResponse.json({
      success: true,
      data: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    })
  ),

  http.get(`${BASE_URL}/products`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    })
  ),

  http.get(`${BASE_URL}/users`, () =>
    HttpResponse.json({
      success: true,
      data: [mockUser],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  ),
];
