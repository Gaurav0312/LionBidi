// src/store/userSlice.js - FIXED VERSION
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { mergeCart, fetchCart } from "./cartSlice";

// Helper to get user from localStorage safely
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    
    // Validate user object has required fields
    if (user && (!user.id && !user._id)) {
      console.warn("Invalid user object in localStorage, clearing...");
      localStorage.removeItem("user");
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// CRITICAL FIX: Better initial state handling
const getInitialState = () => {
  const user = getUserFromStorage();
  const token = localStorage.getItem("token");
  
  // User is only logged in if BOTH user data and token exist
  const isLoggedIn = !!(user && token);
  
  return {
    user,
    isLoggedIn,
    loading: false,
    error: null,
    isInitialized: false,
    // Add timestamp to force re-renders when needed
    lastUpdate: Date.now()
  };
};

const initialState = getInitialState();

/* ------------------- Thunks ------------------- */

// FIXED: Better auth verification
export const verifyAuth = createAsyncThunk(
  "user/verifyAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get("/api/auth/verify", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.user) {
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        throw new Error("Invalid session");
      }
    } catch (error) {
      // Clear ALL auth data on verification failure
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart"); // Clear guest cart too
      return rejectWithValue("Session expired");
    }
  }
);

// FIXED: Login with better state management
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔥 Redux: Starting login...', credentials.email);
      
      const response = await axios.post('/api/auth/login', credentials, {
        withCredentials: true,
      });

      console.log('🔥 Redux: Login response:', response.data);
      const data = response.data;

      // Validate response structure
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      let user, token;
      
      if (data.user && data.token) {
        user = data.user;
        token = data.token;
      } else {
        throw new Error('Invalid login response format');
      }

      // Validate user object has required fields
      if (!user || (!user.id && !user._id)) {
        throw new Error('Invalid user data format - missing ID');
      }

      // Normalize user object
      const normalizedUser = {
        ...user,
        id: user.id || user._id,
        _id: user._id || user.id
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('token', token);

      console.log('🔥 Redux: User data saved successfully');

      return {
        user: normalizedUser,
        token,
        timestamp: Date.now()
      };

    } catch (err) {
      console.error('🔥 Redux: Login error:', err);
      
      // Clear any partial auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      return rejectWithValue(errorMsg);
    }
  }
);


// FIXED: Register with consistent pattern
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

      // Save immediately
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Load cart in background
      setTimeout(() => {
        dispatch(fetchCart());
      }, 100);

      return { 
        user: {
          ...user,
          _registerTime: Date.now()
        }, 
        token,
        timestamp: Date.now()
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      return rejectWithValue(errorMsg);
    }
  }
);

// FIXED: Better logout
export const logoutUser = createAsyncThunk(
  "user/logoutUser", 
  async (_, { dispatch }) => {
    try {
      // Try to notify server (don't fail if it doesn't work)
      try {
        await axios.post("/api/auth/logout", {}, { withCredentials: true });
      } catch (logoutError) {
        console.warn("Server logout failed, continuing with client logout");
      }

      // Always clear client data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");

      // Clear cart state
      dispatch({ type: "cart/clearCartReduxOnly" });

      console.log("🔓 Redux: User logged out successfully");
      return { success: true, timestamp: Date.now() };
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear even on error
      localStorage.clear();
      return { success: true, timestamp: Date.now() };
    }
  }
);

/* ------------------- Slice ------------------- */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // FIXED: Manual user clearing with force update
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      state.loading = false;
      state.lastUpdate = Date.now(); // Force re-render
      
      // Clear storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("Redux: User cleared manually");
    },
    
    // FIXED: Force refresh user state
    refreshUserState: (state) => {
      const user = getUserFromStorage();
      const token = localStorage.getItem("token");
      
      state.user = user;
      state.isLoggedIn = !!(user && token);
      state.lastUpdate = Date.now();
      
      console.log("Redux: User state refreshed", state.isLoggedIn ? "LOGGED IN" : "LOGGED OUT");
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
        state.error = null;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
        state.isInitialized = true;
        state.lastUpdate = Date.now();
        console.log("🔐 Redux: Auth verified successfully");
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
        state.isInitialized = true;
        state.lastUpdate = Date.now();
        console.log("🔐 Redux: Auth verification failed, user logged out");
      })

      // Login cases - FIXED
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
        state.lastUpdate = action.payload.timestamp;
        console.log("🔐 Redux: Login successful - State updated", state.user?.email);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload || "Login failed";
        state.lastUpdate = Date.now();
        console.log("🔐 Redux: Login failed");
      })

      // Register cases - FIXED
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
        state.lastUpdate = action.payload.timestamp;
        console.log("🔐 Redux: Registration successful");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload || "Registration failed";
        state.lastUpdate = Date.now();
      })

      // Logout cases - FIXED
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
        state.lastUpdate = action.payload.timestamp;
        console.log("🔓 Redux: Logout successful");
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout "fails", clear the user
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
        state.lastUpdate = Date.now();
        console.log("🔓 Redux: Logout completed (with errors)");
      });
  },
});

export const { clearUser, clearError, setInitialized, refreshUserState } = userSlice.actions;
export default userSlice.reducer;

// IMPROVED Selectors with debugging
export const selectUser = (state) => {
  const user = state.user.user;
  console.log("Selector: selectUser called, returning:", user?.email || "null");
  return user;
};

export const selectIsLoggedIn = (state) => {
  const isLoggedIn = state.user.isLoggedIn;
  console.log("Selector: selectIsLoggedIn called, returning:", isLoggedIn);
  return isLoggedIn;
};

export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectIsInitialized = (state) => state.user.isInitialized;
export const selectLastUpdate = (state) => state.user.lastUpdate;