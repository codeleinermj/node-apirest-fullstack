import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { mockUser, mockTokens } from "../mocks/handlers";
import {
  login,
  logout,
  isAuthenticated,
  getProducts,
  getTokens,
} from "@/lib/api";

const BASE_URL = "http://localhost:3000/api";

beforeEach(() => {
  localStorage.clear();
});

// --- login ---
describe("login()", () => {
  it("saves tokens to localStorage on success", async () => {
    const res = await login({ email: "test@example.com", password: "pass" });
    expect(res.success).toBe(true);
    expect(localStorage.getItem("accessToken")).toBe(mockTokens.accessToken);
    expect(localStorage.getItem("refreshToken")).toBe(mockTokens.refreshToken);
  });

  it("returns error message and does not save tokens on failure", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
          },
          { status: 401 }
        )
      )
    );

    const res = await login({ email: "wrong@example.com", password: "bad" });
    expect(res.success).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});

// --- logout ---
describe("logout()", () => {
  it("clears tokens from localStorage", async () => {
    await login({ email: "test@example.com", password: "pass" });
    expect(localStorage.getItem("accessToken")).not.toBeNull();
    logout();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});

// --- isAuthenticated ---
describe("isAuthenticated()", () => {
  it("returns false when no tokens stored", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true after login", async () => {
    await login({ email: "test@example.com", password: "pass" });
    expect(isAuthenticated()).toBe(true);
  });

  it("returns false after logout", async () => {
    await login({ email: "test@example.com", password: "pass" });
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});

// --- 401 → refresh → retry ---
describe("request() — 401 auto-refresh", () => {
  it("refreshes token and retries the original request on 401", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "fake-refresh-token");

    let callCount = 0;
    server.use(
      http.get(`${BASE_URL}/products`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            {
              success: false,
              error: { code: "UNAUTHORIZED", message: "Token expired" },
            },
            { status: 401 }
          );
        }
        return HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      })
    );

    const res = await getProducts();
    expect(res.success).toBe(true);
    expect(callCount).toBe(2);
    expect(localStorage.getItem("accessToken")).toBe("new-access-token");
  });

  it("clears tokens if refresh fails", async () => {
    localStorage.setItem("accessToken", "expired-token");
    localStorage.setItem("refreshToken", "invalid-refresh");

    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Token expired" },
          },
          { status: 401 }
        )
      ),
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Invalid refresh token" },
          },
          { status: 401 }
        )
      )
    );

    await getProducts();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});

// --- 429 rate limit ---
describe("request() — 429 rate limit", () => {
  it("returns RATE_LIMIT_EXCEEDED error on 429", async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message:
                "Demasiadas solicitudes. Por favor, intenta de nuevo mas tarde.",
            },
          },
          { status: 429 }
        )
      )
    );

    const res = await getProducts();
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("RATE_LIMIT_EXCEEDED");
    }
  });
});

// --- getTokens ---
describe("getTokens()", () => {
  it("returns null when localStorage is empty", () => {
    expect(getTokens()).toBeNull();
  });

  it("returns tokens object when both tokens exist", async () => {
    await login({ email: "test@example.com", password: "pass" });
    const tokens = getTokens();
    expect(tokens).not.toBeNull();
    expect(tokens?.accessToken).toBe(mockTokens.accessToken);
    expect(tokens?.refreshToken).toBe(mockTokens.refreshToken);
  });
});
