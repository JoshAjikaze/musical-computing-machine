import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../api/vibeApi'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingEmail: string | null
  /** Temporarily cached email+password for auto-login after email verification.
   *  Cleared immediately after use. Never persisted to localStorage. */
  pendingCredentials: { email: string; password: string } | null
}

const storedUser = localStorage.getItem('vibe_user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: "",
  isAuthenticated: false,
  isLoading: false,
  pendingEmail: null,
  pendingCredentials: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTempAccessToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },
    setPendingEmail(state, action: PayloadAction<string>) {
      state.pendingEmail = action.payload
    },
    /** Cache credentials for auto-login. Call right before navigating to /verify. */
    setPendingCredentials(state, action: PayloadAction<{ email: string; password: string }>) {
      state.pendingCredentials = action.payload
    },
    /** Clear cached credentials — call after auto-login attempt (success or failure). */
    clearPendingCredentials(state) {
      state.pendingCredentials = null
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.pendingCredentials = null   // always clear on successful login
      localStorage.setItem('vibe_user', JSON.stringify(action.payload.user))
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.pendingCredentials = null
      localStorage.removeItem('vibe_user')
      toast.info("You are logged out")
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('vibe_user', JSON.stringify(state.user))
      }
    },
  },
})

export const {
  setCredentials, setPendingEmail, setPendingCredentials,
  clearPendingCredentials, logout, updateUser, setTempAccessToken,
} = authSlice.actions
export default authSlice.reducer
