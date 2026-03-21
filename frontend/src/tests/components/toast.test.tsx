import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/toast";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) =>
        ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const { initial, animate, exit, transition, variants, ...html } = props as Record<string, unknown>;
          void initial; void animate; void exit; void transition; void variants;
          return React.createElement(tag, html, children);
        },
    }
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Helper component that triggers toasts
function ToastTrigger() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast("Éxito guardado", "success")}>Success</button>
      <button onClick={() => toast("Ocurrió un error", "error")}>Error</button>
      <button onClick={() => toast("Atención", "warning")}>Warning</button>
      <button onClick={() => toast("Información", "info")}>Info</button>
    </div>
  );
}

function renderWithToast() {
  return render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  );
}

describe("Toast — aparición", () => {
  it("muestra el mensaje al llamar toast()", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Success"));
    expect(screen.getByText("Éxito guardado")).toBeInTheDocument();
  });

  it("muestra mensaje de tipo error", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Error"));
    expect(screen.getByText("Ocurrió un error")).toBeInTheDocument();
  });

  it("muestra mensaje de tipo warning", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Warning"));
    expect(screen.getByText("Atención")).toBeInTheDocument();
  });

  it("muestra mensaje de tipo info", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Info"));
    expect(screen.getByText("Información")).toBeInTheDocument();
  });

  it("puede mostrar múltiples toasts simultáneos", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Success"));
    fireEvent.click(screen.getByText("Error"));
    expect(screen.getByText("Éxito guardado")).toBeInTheDocument();
    expect(screen.getByText("Ocurrió un error")).toBeInTheDocument();
  });
});

describe("Toast — cierre manual", () => {
  it("elimina el toast al hacer click en el botón X", () => {
    renderWithToast();
    fireEvent.click(screen.getByText("Success"));
    expect(screen.getByText("Éxito guardado")).toBeInTheDocument();

    // X button is within the toast (the button inside the toast div)
    const closeButtons = screen.getAllByRole("button");
    // The last button is the toast X (trigger buttons come first)
    const toastCloseButton = closeButtons[closeButtons.length - 1];
    fireEvent.click(toastCloseButton);

    expect(screen.queryByText("Éxito guardado")).not.toBeInTheDocument();
  });
});

describe("Toast — auto-dismiss", () => {
  it("desaparece automáticamente después de 4 segundos", async () => {
    vi.useFakeTimers();
    renderWithToast();

    fireEvent.click(screen.getByText("Info"));
    expect(screen.getByText("Información")).toBeInTheDocument();

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(screen.queryByText("Información")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("no desaparece antes de 4 segundos", async () => {
    vi.useFakeTimers();
    renderWithToast();

    fireEvent.click(screen.getByText("Info"));
    expect(screen.getByText("Información")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3999);
    });

    expect(screen.getByText("Información")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
