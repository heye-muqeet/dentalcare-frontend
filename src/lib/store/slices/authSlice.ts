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
  // Start in loading state so ProtectedRoute waits for getProfile on refresh
  isLoading: true,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // Store token in localStorage as a backup authentication mechanism
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      // Return the user data from response
      return response.user || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Attempting to get profile...');
      const response = await authService.getProfile();
      console.log('Profile response:', response);
      
      // Store the token in localStorage as a backup authentication mechanism
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      return response.data || response;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      // Don't reject immediately if we have a token in localStorage
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        console.log('Found stored token, attempting to recover session...');
        try {
          // Try to get the user data using the stored token
          const userData = await authService.getCurrentUser();
          return userData;
        } catch (secondError) {
          console.error('Failed to recover session:', secondError);
          localStorage.removeItem('auth_token');
          return rejectWithValue('Session expired. Please login again.');
        }
      }
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to get profile'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {}) => {
    try {
      await authService.logout();
      
      // Clear any localStorage/sessionStorage data
      localStorage.removeItem('auth_token');
      // Only remove auth-related items, not everything
      // localStorage.clear();
      // sessionStorage.clear();
      
    } catch (error: any) {
      console.error('Backend logout API call failed:', error);
      
      // Even if the API call fails, clear auth token and proceed with logout
      localStorage.removeItem('auth_token');
      
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
        // Only set loading if we don't already have a user
        if (!state.user) {
          state.isLoading = true;
        }
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