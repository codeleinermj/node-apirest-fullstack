"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { healthCheck } from "@/lib/api";
import { containerVariants, itemVariants } from "@/lib/transitions";
import { Zap, Package, Users, Shield, Activity } from "lucide-react";

export default function HomePage() {
  const [health, setHealth] = useState<"loading" | "ok" | "down">("loading");

  useEffect(() => {
    healthCheck()
      .then((res) => setHealth(res.success ? "ok" : "down"))
      .catch(() => setHealth("down"));
  }, []);

  const features = [
    { icon: Shield, title: "Auth", desc: "Register, Login, JWT Refresh", href: "/login" },
    { icon: Package, title: "Products", desc: "Full CRUD with pagination & filters", href: "/products" },
    { icon: Users, title: "Users", desc: "Admin panel with user management", href: "/users" },
  ];

  return (
    <div className="py-16">
      {/* Hero */}
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Activity className="w-4 h-4 text-neon-green" />
          <span className="text-sm text-dark-300">Backend Status:</span>
          <motion.span
            className={`text-sm font-semibold ${
              health === "ok"
                ? "text-success"
                : health === "down"
                ? "text-danger"
                : "text-warning"
            }`}
            animate={health === "loading" ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            {health === "loading" ? "Checking..." : health === "ok" ? "Online" : "Offline"}
          </motion.span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black mb-6">
          <span className="gradient-text">API Rest nodeJs+express</span>
        </h1>
        <p className="text-lg text-dark-300 max-w-xl mx-auto mb-10">
          Frontend creado para probar todos los endpoints de la API REST.
          Construida con Node.js, Express, TypeScript y Prisma. Implementa autenticacion JWT, roles de usuario, CRUD de productos y documentacion Swagger.
          
        </p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/products">
            <motion.button
              className="px-8 py-3 rounded-xl bg-accent-500 text-white font-semibold glow-accent"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(108,92,231,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Products
            </motion.button>
          </Link>
          <Link href="/register">
            <motion.button
              className="px-8 py-3 rounded-xl glass text-dark-100 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <motion.div
                variants={itemVariants}
                className="glass rounded-2xl p-6 group cursor-pointer"
                whileHover={{ y: -8, borderColor: "rgba(108,92,231,0.4)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Icon className="w-6 h-6 text-accent-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-dark-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400">{feature.desc}</p>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
