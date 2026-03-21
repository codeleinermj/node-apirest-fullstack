import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/components/modal";
import React from "react";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) =>
        ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const { initial, animate, exit, transition, variants, whileHover, whileTap, ...html } = props as Record<string, unknown>;
          void initial; void animate; void exit; void transition; void variants; void whileHover; void whileTap;
          return React.createElement(tag, html, children);
        },
    }
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("Modal — cerrado", () => {
  it("no renderiza nada cuando isOpen es false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Contenido</p>
      </Modal>
    );
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });
});

describe("Modal — abierto", () => {
  it("muestra el título y los children cuando isOpen es true", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Mi Modal">
        <p>Contenido del modal</p>
      </Modal>
    );
    expect(screen.getByText("Mi Modal")).toBeInTheDocument();
    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  it("llama a onClose al hacer click en el botón X", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Contenido</p>
      </Modal>
    );
    // The X button is the close button
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("llama a onClose al hacer click en el backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Modal">
        <p>Contenido</p>
      </Modal>
    );
    // Backdrop is the first div (fixed inset-0 bg-black/60)
    const backdrop = container.querySelector(".fixed.inset-0.bg-black\\/60");
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renderiza children arbitrarios correctamente", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal">
        <input data-testid="campo" placeholder="Escribe algo" />
        <button>Guardar</button>
      </Modal>
    );
    expect(screen.getByTestId("campo")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });
});
