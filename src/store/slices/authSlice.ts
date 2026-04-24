import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../api/vibeApi'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingEmail: string | null  // email awaiting verification after signup
}

const storedToken = localStorage.getItem('vibe_token')
const storedUser  = localStorage.getItem('vibe_user')

const initialState: AuthState = {
  user:           storedUser ? JSON.parse(storedUser) : null,
  token:          storedToken,
  isAuthenticated:!!storedToken,
  isLoading:      false,
  pendingEmail:   null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPendingEmail(state, action: PayloadAction<string>) {
      state.pendingEmail = action.payload
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('vibe_token', action.payload.token)
      localStorage.setItem('vibe_user', JSON.stringify(action.payload.user))
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('vibe_token')
      localStorage.removeItem('vibe_user')
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('vibe_user', JSON.stringify(state.user))
      }
    },
  },
})

export const { setCredentials, setPendingEmail, logout, updateUser } = authSlice.actions
export default authSlice.reducer
