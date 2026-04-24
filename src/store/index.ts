import { configureStore } from '@reduxjs/toolkit'
import { vibeApi } from './api/vibeApi'
import playerReducer from './slices/playerSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    [vibeApi.reducerPath]: vibeApi.reducer,
    player: playerReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(vibeApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
