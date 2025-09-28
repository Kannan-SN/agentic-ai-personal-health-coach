import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  weeklyProgress: [],
  analytics: null,
  currentWeekData: null,
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    setWeeklyProgress: (state, action) => {
      state.weeklyProgress = action.payload;
    },
    addWeeklyProgress: (state, action) => {
      state.weeklyProgress.push(action.payload);
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setCurrentWeekData: (state, action) => {
      state.currentWeekData = action.payload;
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
  setWeeklyProgress,
  addWeeklyProgress,
  setAnalytics,
  setCurrentWeekData,
  setLoading,
  setError,
} = progressSlice.actions;
export default progressSlice.reducer;