import { configureStore } from '@reduxjs/toolkit';
import scanSlice from './scanSlice';
import teamSlice from './teamSlice';
import settingsSlice from './settingsSlice';

export const store = configureStore({
  reducer: {
    scan: scanSlice,
    team: teamSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
