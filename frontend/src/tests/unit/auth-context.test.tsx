import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getTokens: vi.fn(),
  clearTokens: vi.fn(),
  saveTokens: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER" as const,
  createdAt: "",
  updatedAt: "",
};

// Fake JWT: header.base64(payload).signature
function makeToken(payload: object) {
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

// Helper component that exposes auth state
function AuthState() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="role">{user?.role ?? "none"}</span>
    </div>
  );
}

// Helper component that exposes auth actions
function AuthActions() {
  const { login, register, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <button
        onClick={() => login({ email: "test@example.com", password: "pass" })}
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            email: "new@example.com",
            password: "pass",
            name: "New User",
          })
        }
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  vi.mocked(api.getTokens).mockReturnValue(null);
});

describe("AuthProvider — estado inicial", () => {
  it("inicia con isAuthenticated false cuando no hay tokens", async () => {
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("restaura sesión desde localStorage si hay token válido", async () => {
    const payload = {
      sub: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    };
    vi.mocked(api.getTokens).mockReturnValue({
      accessToken: makeToken(payload),
      refreshToken: "refresh",
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("email")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("role")).toHaveTextContent("USER");
  });

  it("limpia tokens si el token almacenado es inválido", async () => {
    vi.mocked(api.getTokens).mockReturnValue({
      accessToken: "not.a.valid.jwt",
      refreshToken: "refresh",
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(api.clearTokens).toHaveBeenCalled();
  });
});

describe("AuthProvider — login()", () => {
  it("actualiza estado a autenticado tras login exitoso", async () => {
    vi.mocked(api.login).mockResolvedValue({
      success: true,
      data: { accessToken: "tok", refreshToken: "ref", user: mockUser },
    });

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });

  it("retorna el mensaje de error en login fallido", async () => {
    vi.mocked(api.login).mockResolvedValue({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Credenciales inválidas" },
    });

    let errorMsg: string | null = null;

    function LoginWithError() {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            errorMsg = await login({
              email: "bad@example.com",
              password: "wrong",
            });
          }}
        >
          Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <LoginWithError />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    expect(errorMsg).toBe("Credenciales inválidas");
  });
});

describe("AuthProvider — register()", () => {
  it("actualiza estado a autenticado tras registro exitoso", async () => {
    vi.mocked(api.register).mockResolvedValue({
      success: true,
      data: { accessToken: "tok", refreshToken: "ref", user: mockUser },
    });

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Register").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });
});

describe("AuthProvider — logout()", () => {
  it("limpia el estado tras logout", async () => {
    vi.mocked(api.login).mockResolvedValue({
      success: true,
      data: { accessToken: "tok", refreshToken: "ref", user: mockUser },
    });

    render(
      <AuthProvider>
        <AuthActions />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(api.logout).toHaveBeenCalled();
  });
});
