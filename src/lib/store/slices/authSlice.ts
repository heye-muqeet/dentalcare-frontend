import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/services/auth';
import type { LoginCredentials } from '../../api/services/auth';
import type { User } from '../../api/services/users';
import { updateProfile } from './profileSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log(response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {}) => {
    try {
      await authService.logout();
      
      // Clear any localStorage/sessionStorage data
      localStorage.clear();
      sessionStorage.clear();
      
    } catch (error: any) {
      console.error('Backend logout API call failed:', error);
      
      // Even if the API call fails, clear local storage and proceed with logout
      localStorage.clear();
      sessionStorage.clear();
      
      // Don't reject the promise - we still want to clear the Redux state
      // return rejectWithValue(error.response?.data?.message || 'Logout API call failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout API fails, clear the auth state
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null; // Don't show error for logout failures
      })
      // Update Profile (from profileSlice)
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Update the current user data when profile is updated
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      });
  },
});

export const { clearError, updateUserData } = authSlice.actions;
export default authSlice.reducer; 