"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/toast";
import { containerVariants, itemVariants } from "@/lib/transitions";
import * as api from "@/lib/api";
import type { Product } from "@/lib/types";
import {
  LayoutDashboard,
  User,
  Mail,
  Shield,
  Save,
  Package,
  Loader2,
  Edit3,
  DollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    async function load() {
      const res = await api.getProducts({ limit: 100 });
      if (res.success) {
        setMyProducts(res.data.filter((p) => p.authorId === user?.id));
      }
      setIsLoadingProducts(false);
    }
    if (user) load();
  }, [user]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const res = await api.updateUser(user.id, { name, email });
    setIsSaving(false);
    if (res.success) {
      toast("Profile updated!", "success");
    } else {
      toast(res.error.message, "error");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-accent-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-accent-400" />
          Dashboard
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Welcome back, {user.name}!
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <User className="w-7 h-7 text-accent-400" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-dark-100">Profile</h2>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-dark-400" />
                <span className={`text-xs font-medium ${user.role === "ADMIN" ? "text-neon-pink" : "text-dark-400"}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-sm text-dark-300 mb-1 block">Name</label>
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:border-accent-500 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-300 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 focus:border-accent-500 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-accent-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* My Products */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-neon-green/10 flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <Package className="w-7 h-7 text-neon-green" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-dark-100">My Products</h2>
              <span className="text-xs text-dark-400">{myProducts.length} products</span>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-10">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader2 className="w-6 h-6 text-accent-400" />
              </motion.div>
            </div>
          ) : myProducts.length === 0 ? (
            <div className="text-center py-10">
              <Package className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-sm text-dark-400">You haven&apos;t created any products yet.</p>
            </div>
          ) : (
            <motion.div
              className="space-y-2 max-h-[400px] overflow-y-auto pr-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {myProducts.map((p) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">{p.title}</p>
                    <p className="text-xs text-dark-500 truncate">{p.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-neon-green text-sm font-semibold shrink-0">
                    <DollarSign className="w-3 h-3" />
                    {p.price.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
