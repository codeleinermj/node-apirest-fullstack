"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Package,
  Users,
  LogIn,
  LogOut,
  UserPlus,
  LayoutDashboard,
  Zap,
  FileText,
} from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, auth: true },
  { href: "/users", label: "Users", icon: Users, admin: true },
  { href: "/audit", label: "Audit", icon: FileText, admin: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const filteredLinks = navLinks.filter((link) => {
    if (link.admin) return isAuthenticated && user?.role === "ADMIN";
    if (link.auth) return isAuthenticated;
    return true;
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Zap className="w-6 h-6 text-neon-green" />
          </motion.div>
          <span className="text-lg font-bold gradient-text">API Tester</span>
        </Link>

        <div className="flex items-center gap-1">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-neon-green"
                      : "text-dark-300 hover:text-dark-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-xl bg-accent-500/10 border border-accent-500/20"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{link.label}</span>
                </motion.div>
              </Link>
            );
          })}

          <div className="w-px h-6 bg-dark-600 mx-2" />

          {isAuthenticated ? (
            <motion.button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-dark-300 hover:text-danger transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          ) : (
            <>
              <Link href="/login">
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-dark-300 hover:text-dark-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </motion.div>
              </Link>
              <Link href="/register">
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-accent-500 text-white hover:bg-accent-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Register</span>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
