"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/toast";
import { containerVariants, itemVariants } from "@/lib/transitions";
import * as api from "@/lib/api";
import type { AuditLog, AuditQuery, PaginationMeta } from "@/lib/types";
import {
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Filter,
  User as UserIcon,
  Package,
} from "lucide-react";

const actionConfig = {
  CREATE: { color: "text-success", bg: "bg-success/10", icon: Plus, label: "Create" },
  UPDATE: { color: "text-warning", bg: "bg-warning/10", icon: Pencil, label: "Update" },
  DELETE: { color: "text-danger", bg: "bg-danger/10", icon: Trash2, label: "Delete" },
};

const entityConfig = {
  Product: { icon: Package, color: "text-accent-400" },
  User: { icon: UserIcon, color: "text-neon-pink" },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditQuery>({});
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await api.getAuditLogs({ ...filters, page, limit: 20 });
    if (res.success) {
      setLogs(res.data);
      if (res.meta) setMeta(res.meta);
    } else {
      toast(res.error.message, "error");
    }
    setIsLoading(false);
  }, [page, filters, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Shield className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-xl font-bold text-dark-200 mb-2">Access Denied</h2>
        <p className="text-dark-400 text-sm">Admin access required to view audit logs.</p>
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
          <FileText className="w-8 h-8 text-accent-400" />
          Audit Log
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {meta ? `${meta.total} records` : "Loading..."}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Filter className="w-4 h-4 text-dark-400" />

        <select
          value={filters.entity || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              entity: (e.target.value || undefined) as AuditQuery["entity"],
            }))
          }
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-200 focus:border-accent-500 focus:outline-none"
        >
          <option value="">All entities</option>
          <option value="Product">Product</option>
          <option value="User">User</option>
        </select>

        <select
          value={filters.action || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              action: (e.target.value || undefined) as AuditQuery["action"],
            }))
          }
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-200 focus:border-accent-500 focus:outline-none"
        >
          <option value="">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>

        {(filters.entity || filters.action) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setFilters({})}
            className="text-xs text-dark-400 hover:text-dark-200 underline"
          >
            Clear filters
          </motion.button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-accent-400" />
          </motion.div>
        </div>
      ) : logs.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No audit logs found</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {logs.map((log) => {
            const action = actionConfig[log.action];
            const entity = entityConfig[log.entity];
            const ActionIcon = action.icon;
            const EntityIcon = entity.icon;
            const isExpanded = expandedId === log.id;
            const hasChanges = log.changes && Object.keys(log.changes).length > 0;

            return (
              <motion.div
                key={log.id}
                variants={itemVariants}
                layout
                className="glass rounded-xl overflow-hidden"
              >
                <div
                  className={`p-4 flex items-center gap-3 ${hasChanges ? "cursor-pointer" : ""}`}
                  onClick={() => hasChanges && setExpandedId(isExpanded ? null : log.id)}
                >
                  {/* Action badge */}
                  <motion.div
                    className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <ActionIcon className={`w-4 h-4 ${action.color}`} />
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase ${action.color}`}>
                        {action.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-dark-400">
                        <EntityIcon className={`w-3 h-3 ${entity.color}`} />
                        {log.entity}
                      </span>
                      <span className="text-[10px] text-dark-600 font-mono truncate max-w-[120px]">
                        {log.entityId.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">
                      by <span className="text-dark-300">{log.user?.name || "Unknown"}</span>
                      {" - "}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Expand indicator */}
                  {hasChanges && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-dark-500" />
                    </motion.div>
                  )}
                </div>

                {/* Expanded changes */}
                <AnimatePresence>
                  {isExpanded && hasChanges && log.changes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-dark-700">
                        <p className="text-[10px] uppercase text-dark-500 font-semibold mb-2 tracking-wider">
                          Changes
                        </p>
                        <div className="space-y-1.5">
                          {Object.entries(log.changes).map(([field, change]) => (
                            <div
                              key={field}
                              className="flex items-center gap-2 text-xs font-mono"
                            >
                              <span className="text-dark-400 w-20 shrink-0 truncate">
                                {field}
                              </span>
                              <span className="text-danger/70 line-through truncate max-w-[140px]">
                                {String(change.from)}
                              </span>
                              <span className="text-dark-600">→</span>
                              <span className="text-success truncate max-w-[140px]">
                                {String(change.to)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
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
