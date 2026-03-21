"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/toast";
import { containerVariants, itemVariants } from "@/lib/transitions";
import * as api from "@/lib/api";
import type { User, PaginationMeta } from "@/lib/types";
import {
  Users,
  Shield,
  User as UserIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Crown,
  Calendar,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const res = await api.getUsers(page, 10);
    if (res.success) {
      setUsers(res.data);
      if (res.meta) setMeta(res.meta);
    } else {
      toast(res.error.message, "error");
    }
    setIsLoading(false);
  }, [page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await api.deleteUser(id);
    if (res.success) {
      toast("User deleted", "success");
      fetchUsers();
    } else {
      toast(res.error.message, "error");
    }
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Shield className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-xl font-bold text-dark-200 mb-2">Access Denied</h2>
        <p className="text-dark-400 text-sm">Admin access required to view this page.</p>
      </motion.div>
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
          <Users className="w-8 h-8 text-accent-400" />
          User Management
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {meta ? `${meta.total} registered users` : "Loading..."}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-accent-400" />
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {users.map((u) => (
            <motion.div
              key={u.id}
              variants={itemVariants}
              layout
              className="glass rounded-xl p-4 flex items-center gap-4 group"
              whileHover={{ x: 4, borderColor: "rgba(108,92,231,0.3)" }}
            >
              <motion.div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  u.role === "ADMIN" ? "bg-neon-pink/10" : "bg-accent-500/10"
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {u.role === "ADMIN" ? (
                  <Crown className="w-5 h-5 text-neon-pink" />
                ) : (
                  <UserIcon className="w-5 h-5 text-accent-400" />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark-100 truncate">{u.name}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      u.role === "ADMIN"
                        ? "bg-neon-pink/10 text-neon-pink"
                        : "bg-dark-600 text-dark-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <p className="text-sm text-dark-400 truncate">{u.email}</p>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-xs text-dark-500">
                <Calendar className="w-3 h-3" />
                {new Date(u.createdAt).toLocaleDateString()}
              </div>

              {u.id !== user?.id && (
                <motion.button
                  onClick={() => handleDelete(u.id)}
                  className="p-2 rounded-lg text-dark-500 hover:text-danger hover:bg-dark-700 opacity-0 group-hover:opacity-100 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {meta && meta.totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="p-2 rounded-xl glass text-dark-300 disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-sm text-dark-300">
            Page {page} of {meta.totalPages}
          </span>
          <motion.button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === meta.totalPages}
            className="p-2 rounded-xl glass text-dark-300 disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
