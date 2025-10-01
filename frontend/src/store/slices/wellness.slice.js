import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plans: [],
  activePlan: null,
  loading: false,
  error: null,
  chatMessages: [],
  planProgress: {},
};

const wellnessSlice = createSlice({
  name: "wellness",
  initialState,
  reducers: {
    setPlans: (state, action) => {
      state.plans = action.payload;
    },
    setActivePlan: (state, action) => {
      state.activePlan = action.payload;
    },
    addPlan: (state, action) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setPlanProgress: (state, action) => {
      state.planProgress = action.payload;
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
  setPlans,
  setActivePlan,
  addPlan,
  updatePlan,
  setChatMessages,
  addChatMessage,
  setPlanProgress,
  setLoading,
  setError,
} = wellnessSlice.actions;
export default wellnessSlice.reducer;