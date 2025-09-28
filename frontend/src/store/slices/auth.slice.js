import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuth: false,
  mode: '',
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  isPasswordUpdated: false,
  healthStatus: "",
  healthDisclaimerAccepted: false,
  riskLevel: "",
  requiresProfessionalConsultation: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setupAuthentication: (state, action) => {
      state = { ...state, ...action.payload };
      return state;
    },
    revokeAuth: (state) => {
      state = initialState;
      return state;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setupAuthentication, revokeAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;