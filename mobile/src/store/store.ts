import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import taskSlice from './slices/taskSlice';
import goalSlice from './slices/goalSlice';
import financeSlice from './slices/financeSlice';
import challengeSlice from './slices/challengeSlice';
import notificationSlice from './slices/notificationSlice';
import appSlice from './slices/appSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'], // Only persist auth and app settings
  blacklist: ['tasks', 'goals', 'finances', 'challenges', 'notifications'], // Don't persist data
};

const rootReducer = combineReducers({
  auth: authSlice,
  tasks: taskSlice,
  goals: goalSlice,
  finances: financeSlice,
  challenges: challengeSlice,
  notifications: notificationSlice,
  app: appSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
