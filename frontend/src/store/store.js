import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import mainReducer from './mainReducer';

const persistConfig = {
  key: 'wellness-coach-root',
  storage,
  stateReconciler: autoMergeLevel1,
  whitelist: ['auth'],
  blacklist: ['wellness', 'user', 'progress'], // Don't persist these for security
  debug: import.meta.env.VITE_MODE === 'development'
};

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  });

const store = configureStore({
  reducer: persistReducer(persistConfig, mainReducer()),
  middleware,
  devTools: import.meta.env.VITE_MODE === 'development'
});

export const persistor = persistStore(store);
export default store;