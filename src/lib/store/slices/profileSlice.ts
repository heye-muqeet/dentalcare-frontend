import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, type ChangePasswordData } from '../../api/services/users';
// import type { User } from '../../api/services/users';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  gender?: string;
  age?: number;
  profileImage?: string;
  // Doctor-specific fields (only for doctors)
  specialization?: string;
  licenseNumber?: string;
  licenseDocumentUrl?: string;
  experience?: number;
  education?: string;
  availability?: any[];
}

interface ProfileState {
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  isChangingPassword: boolean;
  changePasswordError: string | null;
  changePasswordSuccess: boolean;
}

const initialState: ProfileState = {
  isUpdating: false,
  updateError: null,
  updateSuccess: false,
  isChangingPassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
};

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, profileData }: { userId: string; profileData: UpdateProfileData }, { rejectWithValue }) => {
    try {
      // Remove role from the data to prevent role changes
      const { ...updateData } = profileData;
      const response = await userService.updateUser(userId, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(passwordData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to change password');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileErrors: (state) => {
      state.updateError = null;
      state.updateSuccess = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isUpdating = false;
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
        state.updateSuccess = false;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isChangingPassword = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.changePasswordError = action.payload as string;
        state.changePasswordSuccess = false;
      });
  },
});

export const { clearProfileErrors } = profileSlice.actions;
export default profileSlice.reducer; 