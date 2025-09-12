// src/store/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ------------------- Thunks ------------------- */
// Load logged-in user's wishlist
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async () => {
  const res = await axios.get("/api/wishlist", { withCredentials: true });
  return res.data.wishlist || [];
});

// Save entire wishlist to MongoDB
export const saveWishlist = createAsyncThunk("wishlist/saveWishlist", async (items) => {
  await axios.post("/api/wishlist", { items }, { withCredentials: true });
  return items;
});

// Merge guest wishlist into MongoDB on login
export const mergeWishlist = createAsyncThunk(
  "wishlist/mergeWishlist",
  async (localItems) => {
    await axios.post(
      "/api/wishlist/merge",
      { items: localItems }, // expects [{ productId }]
      { withCredentials: true }
    );
    const res = await axios.get("/api/wishlist", { withCredentials: true });
    return res.data.wishlist || [];
  }
);

/* ------------------- Slice ------------------- */
const initialState = {
  items: JSON.parse(localStorage.getItem("wishlist")) || [],
  status: "idle",
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((p) => p._id === product._id);
      if (!existing) {
        state.items.push({ ...product });
      }
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem("wishlist");
    },
    clearWishlistReduxOnly: (state) => {
      state.items = JSON.parse(localStorage.getItem("wishlist")) || [];
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((p) => p._id === product._id);
      if (existing) {
        state.items = state.items.filter((p) => p._id !== product._id);
      } else {
        state.items.push({ ...product });
      }
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.map((item) => ({
          ...(item.product || item),
          _id: (item.product && item.product._id) || item._id,
        }));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(saveWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(mergeWishlist.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          ...(item.product || item),
          _id: (item.product && item.product._id) || item._id,
        }));
        localStorage.removeItem("wishlist"); // ✅ clear guest wishlist after merge
      });
  },
});

export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  clearWishlistReduxOnly,
  toggleWishlist 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
