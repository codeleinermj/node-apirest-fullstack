"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-green via-accent-500 to-neon-pink origin-left z-50"
    />
  );
}
