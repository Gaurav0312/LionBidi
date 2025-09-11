// src/store/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ------------------- Thunks ------------------- */

// Load logged-in user's cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await axios.get("/api/cart", { withCredentials: true });
  return res.data.cart || [];
});

// Save entire cart to MongoDB
export const saveCart = createAsyncThunk("cart/saveCart", async (items) => {
  await axios.post("/api/cart", { items }, { withCredentials: true });
  return items;
});

// Merge guest cart into MongoDB on login
export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async (localItems) => {
    await axios.post(
      "/api/cart/merge",
      { items: localItems }, // expects [{ productId, quantity }]
      { withCredentials: true }
    );

    const res = await axios.get("/api/cart", { withCredentials: true });
    return res.data.cart || [];
  }
);

/* ------------------- Slice ------------------- */
const initialState = {
  items: JSON.parse(localStorage.getItem("cart")) || [],
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((p) => p._id === product._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const product = state.items.find((p) => p._id === id);
      if (product) {
        product.quantity = qty;
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },

    clearCartReduxOnly: (state) => {
      state.items = JSON.parse(localStorage.getItem("cart")) || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.map((item) => ({
          ...(item.product || item),
          quantity: item.quantity || 1,
          _id: (item.product && item.product._id) || item._id,
        }));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(saveCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          ...(item.product || item),
          quantity: item.quantity || 1,
          _id: (item.product && item.product._id) || item._id,
        }));
        localStorage.removeItem("cart"); // ✅ clear guest cart after merge
      });
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
