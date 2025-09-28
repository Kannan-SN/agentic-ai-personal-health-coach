import { combineReducers } from "@reduxjs/toolkit";
import auth from "./slices/auth.slice";
import wellness from "./slices/wellness.slice";
import user from "./slices/user.slice";
import progress from "./slices/progress.slice";

const mainReducer = (asyncReducers) => (state, action) => {
  const combinedReducers = combineReducers({
    auth,
    wellness,
    user,
    progress,
    ...asyncReducers,
  });

  return combinedReducers(state, action);
};

export default mainReducer;