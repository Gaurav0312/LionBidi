// src/store/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { mergeCart, fetchCart } from "./cartSlice";

// Helper to get user from localStorage safely
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user"); // Clean up corrupted data
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isLoggedIn: !!getUserFromStorage(), // Add this derived state
  loading: false,
  error: null,
  isInitialized: false, // Track if we've checked auth status
};

/* ------------------- Thunks ------------------- */

// Check if user session is still valid
export const verifyAuth = createAsyncThunk(
  "user/verifyAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/auth/verify", {
        withCredentials: true,
      });
      
      if (response.data.success && response.data.user) {
        return response.data.user;
      } else {
        throw new Error("Invalid session");
      }
    } catch (error) {
      // Clear invalid session data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return rejectWithValue("Session expired");
    }
  }
);

// Login Thunk with better error handling
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      console.log("🔐 Redux: Starting login...", credentials.email);
      
      const response = await axios.post("/api/auth/login", credentials, {
        withCredentials: true,
      });

      console.log("🔐 Redux: Login response:", response.data);

      // Handle different response formats from your backend
      const data = response.data;
      let user, token;

      if (data.success) {
        user = data.user;
        token = data.token;
      } else if (data.user && data.token) {
        // Fallback for different response format
        user = data.user;
        token = data.token;
      } else {
        throw new Error(data.message || "Invalid response format");
      }

      if (!user || !token) {
        throw new Error("Missing user data or token in response");
      }

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      console.log("🔐 Redux: User saved to localStorage");

      // Handle cart merging
      try {
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log("🔐 Redux: Guest cart items:", guestCart.length);
        
        if (guestCart.length > 0) {
          console.log("🔐 Redux: Merging guest cart...");
          await dispatch(mergeCart(guestCart));
        } else {
          console.log("🔐 Redux: Fetching user cart...");
          await dispatch(fetchCart());
        }
      } catch (cartError) {
        console.error("🔐 Redux: Cart operation failed:", cartError);
        // Don't fail login if cart operations fail
      }

      console.log("🔐 Redux: Login successful!");
      return { user, token };
    } catch (err) {
      console.error("🔐 Redux: Login error:", err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        "Login failed. Please try again.";
      return rejectWithValue(errorMsg);
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/register", userData, {
        withCredentials: true,
      });

      const data = response.data;
      const user = data.user;
      const token = data.token;

      if (!user || !token) {
        throw new Error("Registration failed - missing data");
      }

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Load user cart
      await dispatch(fetchCart());

      return { user, token };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      return rejectWithValue(errorMsg);
    }
  }
);

// Logout Thunk
export const logoutUser = createAsyncThunk(
  "user/logoutUser", 
  async (_, { dispatch }) => {
    try {
      // For JWT-based auth, we typically don't need a server call
      // Just clear the client-side data
      
      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Clear cart
      dispatch({ type: "cart/clearCartReduxOnly" });

      console.log("🔓 Redux: User logged out");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still clear local data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return true;
    }
  }
);

/* ------------------- Slice ------------------- */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Manual logout (for immediate UI updates)
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Set initialized flag
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Auth cases
      .addCase(verifyAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null; // Don't show error for expired sessions
        state.isInitialized = true;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
        console.log("🔐 Redux: Login state updated", state.user?.email);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload || "Login failed";
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload || "Registration failed";
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearUser, clearError, setInitialized } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectIsInitialized = (state) => state.user.isInitialized;