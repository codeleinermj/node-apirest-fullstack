"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/modal";
import { containerVariants, itemVariants } from "@/lib/transitions";
import * as api from "@/lib/api";
import type { Product, ProductsQuery, PaginationMeta, CreateProductInput } from "@/lib/types";
import {
  Package,
  Plus,
  Search,
  ArrowUpDown,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Boxes,
  Loader2,
  Filter,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<ProductsQuery>({ page: 1, limit: 9, sortBy: "createdAt", order: "desc" });
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const res = await api.getProducts(query);
    if (res.success) {
      setProducts(res.data);
      if (res.meta) setMeta(res.meta);
    } else {
      toast(res.error.message, "error");
    }
    setIsLoading(false);
  }, [query, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch() {
    setQuery((prev) => ({ ...prev, page: 1, search: search || undefined }));
  }

  async function handleDelete(id: string) {
    const res = await api.deleteProduct(id);
    if (res.success) {
      toast("Product deleted", "success");
      fetchProducts();
    } else {
      toast(res.error.message, "error");
    }
  }

  return (
    <div className="py-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Products</h1>
          <p className="text-dark-400 text-sm mt-1">
            {meta ? `${meta.total} products found` : "Loading..."}
          </p>
        </div>
        {isAuthenticated && (
          <motion.button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            New Product
          </motion.button>
        )}
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="glass rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-accent-500 focus:outline-none transition-colors text-sm"
              placeholder="Search products..."
            />
          </div>
          <motion.button
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters ? "bg-accent-500/20 border-accent-500/30 text-accent-400" : "bg-dark-800 border-dark-600 text-dark-400"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-dark-600">
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Sort By</label>
                  <select
                    value={query.sortBy}
                    onChange={(e) => setQuery((prev) => ({ ...prev, sortBy: e.target.value as ProductsQuery["sortBy"] }))}
                    className="w-full py-2 px-3 rounded-lg bg-dark-800 border border-dark-600 text-dark-200 text-sm focus:outline-none"
                  >
                    <option value="createdAt">Date</option>
                    <option value="price">Price</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Order</label>
                  <select
                    value={query.order}
                    onChange={(e) => setQuery((prev) => ({ ...prev, order: e.target.value as "asc" | "desc" }))}
                    className="w-full py-2 px-3 rounded-lg bg-dark-800 border border-dark-600 text-dark-200 text-sm focus:outline-none"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    onChange={(e) => setQuery((prev) => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full py-2 px-3 rounded-lg bg-dark-800 border border-dark-600 text-dark-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="999"
                    onChange={(e) => setQuery((prev) => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full py-2 px-3 rounded-lg bg-dark-800 border border-dark-600 text-dark-200 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 className="w-8 h-8 text-accent-400" />
          </motion.div>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Package className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No products found</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
              className="glass rounded-2xl p-5 group"
              whileHover={{ y: -4, borderColor: "rgba(108,92,231,0.3)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-dark-100 line-clamp-1">{product.title}</h3>
                {isAuthenticated && (user?.role === "ADMIN" || user?.id === product.authorId) && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      onClick={() => setEditProduct(product)}
                      className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-accent-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-danger"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                )}
              </div>
              <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                {product.description || "No description"}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-neon-green font-bold">
                  <DollarSign className="w-4 h-4" />
                  {product.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-sm text-dark-400">
                  <Boxes className="w-3.5 h-3.5" />
                  {product.stock} in stock
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            disabled={query.page === 1}
            className="p-2 rounded-xl glass text-dark-300 disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="text-sm text-dark-300">
            Page {query.page} of {meta.totalPages}
          </span>
          <motion.button
            onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            disabled={query.page === meta.totalPages}
            className="p-2 rounded-xl glass text-dark-300 disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* Create Modal */}
      <ProductFormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          fetchProducts();
        }}
        title="Create Product"
      />

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSuccess={() => {
          setEditProduct(null);
          fetchProducts();
        }}
        title="Edit Product"
        product={editProduct ?? undefined}
      />
    </div>
  );
}

function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  title: modalTitle,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  product?: Product;
}) {
  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setStock(product.stock.toString());
    } else {
      setTitle("");
      setDescription("");
      setPrice("");
      setStock("0");
    }
  }, [product, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const data: CreateProductInput = {
      title,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock),
    };

    const res = product
      ? await api.updateProduct(product.id, data)
      : await api.createProduct(data);

    setIsLoading(false);
    if (res.success) {
      toast(product ? "Product updated!" : "Product created!", "success");
      onSuccess();
    } else {
      toast(res.error.message, "error");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-dark-300 mb-1 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-accent-500 focus:outline-none text-sm"
            placeholder="Product title"
            required
          />
        </div>
        <div>
          <label className="text-sm text-dark-300 mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-accent-500 focus:outline-none text-sm resize-none"
            placeholder="Product description (optional)"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Price</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-accent-500 focus:outline-none text-sm"
              placeholder="9.99"
              required
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-accent-500 focus:outline-none text-sm"
              placeholder="0"
              required
            />
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-accent-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 className="w-4 h-4" />
            </motion.div>
          ) : (
            product ? "Update Product" : "Create Product"
          )}
        </motion.button>
      </form>
    </Modal>
  );
}
