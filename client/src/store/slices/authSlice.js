import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_SERVER_URI}/api/auth`;

axios.defaults.withCredentials = true;

// --- Signup ---
export const signup = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/signup`, formData, {
        withCredentials: true,
      });
      return res.data; // { user, token? }
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.message ||
            err.response.data.errors?.[0]?.msg ||
            "Signup failed"
        );
      }
      return rejectWithValue(err.message || "Signup failed");
    }
  }
);

// --- Login ---
export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, formData, {
        withCredentials: true,
      });
      return res.data; // { user, token? }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// --- Logout ---
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return true;
  } catch (err) {
    return true; // still clear local state
  }
});

// --- Get Current User ---
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Not authenticated"
      );
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
    });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
