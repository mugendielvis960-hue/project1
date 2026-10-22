import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: "",
  authenticated: false,
  authChecked: false,
  checkAdminSession: async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      set({ authenticated: response.ok && data.authenticated, authChecked: true });
    } catch {
      set({ authenticated: false, authChecked: true });
    }
  },
  login: async (password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || "Unable to sign in" };
      }
      set({ authenticated: true, authChecked: true });
      return { success: true, message: "Administrator signed in" };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reach the server" };
    }
  },
  logout: async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out");
      set({ authenticated: false });
      return { success: true, message: "Signed out" };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reach the server" };
    }
  },
  createProduct: async (newProduct) => {
    if (
      !newProduct.name?.trim() ||
      !newProduct.description?.trim() ||
      !Number.isFinite(newProduct.price) ||
      newProduct.price <= 0 ||
      !newProduct.image?.trim()
    ) {
      return { success: false, message: "Please fill in all required fields" };
    }
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401) set({ authenticated: false });
        return { success: false, message: data.message || "Unable to create product" };
      }
      set((state) => ({ products: [...state.products, data.data] }));
      return { success: true, message: "Product created successfully" };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reach the server" };
    }
  },

  fetchProducts: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load products");
      }
      set({ products: data.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message || "Unable to reach the server" });
    }
  },

  deleteProduct: async (pid) => {
    try {
      const response = await fetch(`/api/products/${pid}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok && data.success) {
        set((state) => ({
          products: state.products.filter((product) => product._id !== pid),
        }));
        return { success: true, message: "Product deleted successfully" };
      }
      if (response.status === 401) set({ authenticated: false });
      return { success: false, message: data.message || "Failed to delete product" };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reach the server" };
    }
  },
  updateProduct: async (pid, updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401) set({ authenticated: false });
        return { success: false, message: data.message || "Failed to update product" };
      }
      set((state) => ({
        products: state.products.map((product) => (product._id === pid ? data.data : product)),
      }));
      return { success: true, message: "Product updated successfully" };
    } catch (error) {
      return { success: false, message: error.message || "Unable to reach the server" };
    }
  },
}));
