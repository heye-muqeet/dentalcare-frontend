import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  updateError: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null,
};

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<Profile>, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile: Profile = {
        id: '1',
        name: profileData.name || 'Updated User',
        email: profileData.email || 'updated@example.com',
        phone: profileData.phone,
        address: profileData.address,
        avatar: profileData.avatar
      };
      
      return updatedProfile;
    } catch (error: any) {
      return rejectWithValue('Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
