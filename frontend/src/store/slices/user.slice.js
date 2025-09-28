import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  healthProfile: null,
  emergencyContacts: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setHealthProfile: (state, action) => {
      state.healthProfile = action.payload;
    },
    setEmergencyContacts: (state, action) => {
      state.emergencyContacts = action.payload;
    },
    addEmergencyContact: (state, action) => {
      state.emergencyContacts.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProfile,
  setHealthProfile,
  setEmergencyContacts,
  addEmergencyContact,
  setLoading,
  setError,
} = userSlice.actions;
export default userSlice.reducer;