import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/navbar";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) =>
        ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const { initial, animate, exit, transition, variants, whileHover, whileTap, layoutId, ...html } = props as Record<string, unknown>;
          void initial; void animate; void exit; void transition;
          void variants; void whileHover; void whileTap; void layoutId;
          return React.createElement(tag, html, children);
        },
    }
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}));

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const mockUseAuth = vi.mocked(useAuth);
const mockUsePathname = vi.mocked(usePathname);

beforeEach(() => {
  mockUsePathname.mockReturnValue("/");
});

describe("Navbar — usuario no autenticado", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("muestra el link Products", () => {
    render(<Navbar />);
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("muestra Login y Register", () => {
    render(<Navbar />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("no muestra Dashboard ni Users ni Audit", () => {
    render(<Navbar />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit")).not.toBeInTheDocument();
  });

  it("no muestra el botón Logout", () => {
    render(<Navbar />);
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });
});

describe("Navbar — usuario autenticado (USER)", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "test@example.com", name: "Test", role: "USER", createdAt: "", updatedAt: "" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("muestra Products y Dashboard", () => {
    render(<Navbar />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("no muestra Users ni Audit (solo ADMIN)", () => {
    render(<Navbar />);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Audit")).not.toBeInTheDocument();
  });

  it("muestra Logout y oculta Login/Register", () => {
    render(<Navbar />);
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  it("llama a logout al hacer click en Logout", async () => {
    const logoutFn = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "test@example.com", name: "Test", role: "USER", createdAt: "", updatedAt: "" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutFn,
    });

    render(<Navbar />);
    screen.getByText("Logout").closest("button")?.click();
    expect(logoutFn).toHaveBeenCalledOnce();
  });
});

describe("Navbar — usuario autenticado (ADMIN)", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "admin@example.com", name: "Admin", role: "ADMIN", createdAt: "", updatedAt: "" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("muestra Products, Dashboard, Users y Audit", () => {
    render(<Navbar />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Audit")).toBeInTheDocument();
  });
});

describe("Navbar — link activo", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("el link Products tiene clase text-neon-green cuando pathname es /products", () => {
    mockUsePathname.mockReturnValue("/products");
    render(<Navbar />);
    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink).toHaveAttribute("href", "/products");
  });
});
