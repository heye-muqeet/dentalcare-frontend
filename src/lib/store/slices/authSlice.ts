import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../api/services/auth';
import type { LoginCredentials } from '../../api/services/auth';
import type { User } from '../../api/services/auth';
import sessionManager, { type SessionData } from '../../services/sessionManager';
// import { updateProfile } from './profileSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionData: SessionData | null;
  isSessionExpiring: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionData: null,
  isSessionExpiring: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // Create session with session manager
      if (response.user && response.access_token && response.refresh_token) {
        await sessionManager.createSession(
          response.user,
          response.access_token,
          response.refresh_token,
          response.expires_in || 900, // Default 15 minutes
          {
            deviceId: sessionManager.getSession()?.deviceId || '',
            deviceName: credentials.deviceName || sessionManager.getSession()?.deviceName || '',
            isRememberMe: credentials.isRememberMe || false,
          }
        );
      }
      
      const user = response.user || response.data;
      
      // Note: Receptionist data initialization is handled by SessionInitializer
      // to ensure proper timing and state synchronization
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Login failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const session = sessionManager.getSession();
      if (session && sessionManager.isSessionActive()) {
        const user = session.user;
        
        // Receptionist data initialization is handled in SessionInitializer component
        
        return user;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue('Failed to initialize authentication');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const tokenPair = await sessionManager.refreshAccessToken();
      return tokenPair;
    } catch (error: any) {
      return rejectWithValue('Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 Starting user logout process...');
      
      // Always clear session locally, regardless of API call results
      await sessionManager.clearSession();
      
      console.log('✅ User logout completed successfully');
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      
      // Even if logout fails, we should still clear the session locally
      try {
        await sessionManager.clearSession();
        console.log('✅ Session cleared locally despite logout error');
      } catch (clearError) {
        console.error('❌ Failed to clear session locally:', clearError);
      }
      
      // Don't reject - we want to proceed with logout even if there were errors
      return { success: true, message: 'Logged out successfully (with warnings)' };
    }
  }
);

export const logoutAllDevices = createAsyncThunk(
  'auth/logoutAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      await sessionManager.logoutAllDevices();
    } catch (error: any) {
      return rejectWithValue('Failed to logout from all devices');
    }
  }
);

export const handleSessionExpired = createAsyncThunk(
  'auth/handleSessionExpired',
  async (reason: string, { rejectWithValue }) => {
    try {
      // Clear session without making API call since tokens are already invalid
      await sessionManager.clearSession();
      return reason;
    } catch (error: any) {
      return rejectWithValue('Failed to handle session expiration');
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
    setSessionData: (state, action: PayloadAction<SessionData | null>) => {
      state.sessionData = action.payload;
      state.user = action.payload?.user || null;
      state.isAuthenticated = !!action.payload;
    },
    setSessionExpiring: (state, action: PayloadAction<boolean>) => {
      state.isSessionExpiring = action.payload;
    },
    clearSession: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionData = null;
      state.isSessionExpiring = false;
      state.error = null;
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
        state.user = action.payload as User;
        state.sessionData = sessionManager.getSession();
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.sessionData = sessionManager.getSession();
          
          // Receptionist data initialization is handled in SessionInitializer component
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.sessionData = null;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionData = null;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isSessionExpiring = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isSessionExpiring = false;
        state.sessionData = sessionManager.getSession();
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isSessionExpiring = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionData = null;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('🔄 Logout in progress...');
      })
    .addCase(logoutUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.sessionData = null;
      state.isSessionExpiring = false;
      state.error = null;
      console.log('✅ Logout completed successfully:', action.payload);
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false;
      // Even if logout fails, we should clear the session locally
      state.isAuthenticated = false;
      state.user = null;
      state.sessionData = null;
      state.isSessionExpiring = false;
      state.error = null; // Clear error since we're treating this as success
      console.log('✅ Logout completed with warnings:', action.payload);
    })
      // Logout All Devices
      .addCase(logoutAllDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionData = null;
        state.isSessionExpiring = false;
        state.error = null;
      })
      .addCase(logoutAllDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle Session Expired
      .addCase(handleSessionExpired.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(handleSessionExpired.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionData = null;
        state.isSessionExpiring = false;
        state.error = null;
        
        // Log the reason for session expiration
        console.log('Session expired:', action.payload);
      })
      .addCase(handleSessionExpired.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionData = null;
        state.isSessionExpiring = false;
        state.error = null;
      });
  },
});

export const { 
  clearError, 
  updateUserData, 
  setSessionData, 
  setSessionExpiring, 
  clearSession 
} = authSlice.actions;
export default authSlice.reducer;
