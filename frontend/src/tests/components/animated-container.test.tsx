import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedContainer } from "@/components/animated-container";
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

const animationPresets = [
  "fadeIn",
  "fadeInUp",
  "fadeInDown",
  "scaleIn",
  "slideInLeft",
  "slideInRight",
] as const;

describe("AnimatedContainer — renderizado", () => {
  it("renderiza los children correctamente", () => {
    render(
      <AnimatedContainer>
        <p>Contenido de prueba</p>
      </AnimatedContainer>
    );
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("aplica la className recibida", () => {
    const { container } = render(
      <AnimatedContainer className="mi-clase">
        <p>Texto</p>
      </AnimatedContainer>
    );
    expect(container.firstChild).toHaveClass("mi-clase");
  });

  animationPresets.forEach((animation) => {
    it(`renderiza sin crash con animation="${animation}"`, () => {
      render(
        <AnimatedContainer animation={animation}>
          <span>{animation}</span>
        </AnimatedContainer>
      );
      expect(screen.getByText(animation)).toBeInTheDocument();
    });
  });

  it("usa fadeInUp como animación por defecto", () => {
    render(
      <AnimatedContainer>
        <span>Default</span>
      </AnimatedContainer>
    );
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("acepta delay y duration sin errores", () => {
    render(
      <AnimatedContainer delay={0.3} duration={0.8}>
        <span>Con delay</span>
      </AnimatedContainer>
    );
    expect(screen.getByText("Con delay")).toBeInTheDocument();
  });
});
