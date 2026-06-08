import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { vibeApi } from './api/vibeApi'
import playerReducer from './slices/playerSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import playlistReducer from './slices/playlistSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'player', 'ui', 'playlists'],
}

const rootReducer = combineReducers({
  [vibeApi.reducerPath]: vibeApi.reducer,
  player: playerReducer,
  auth: authReducer,
  ui: uiReducer,
  playlists: playlistReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(vibeApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
