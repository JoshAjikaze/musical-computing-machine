import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../api/vibeApi'
import { toast } from 'sonner'

/**
 * Dispatched by baseQueryWithAuth when a 401 comes back mid-session (token
 * expired on the server). Distinct from logout() so the toast can explain
 * *why* the user is being sent to /login — "session expired" reads very
 * differently from "you signed out".
 */
export const sessionExpired = createAction('auth/sessionExpired')

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

// Read whatever redux-persist previously wrote for the auth slice. We do
// this at slice init (not via extraReducers/REHYDRATE) because PersistGate
// renders *before* the REHYDRATE action fires — reading here directly means
// ProtectedRoute never sees isAuthenticated=false for a persisted session.
function readPersistedAuth(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  try {
    const raw = localStorage.getItem('persist:root')
    if (raw) {
      const root = JSON.parse(raw)
      if (root.auth) {
        const auth = JSON.parse(root.auth) as Partial<AuthState>
        if (auth.token && auth.user && auth.isAuthenticated) {
          return { user: auth.user, token: auth.token, isAuthenticated: true }
        }
      }
    }
  } catch { /* parse errors — fall through to unauthenticated */ }
  return { user: null, token: null, isAuthenticated: false }
}

const persisted = readPersistedAuth()

const initialState: AuthState = {
  ...persisted,
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
      toast.info("You've been signed out")
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('vibe_user', JSON.stringify(state.user))
      }
    },
  },
  extraReducers: (builder) => {
    // Session expired — same state reset as logout but with a different toast
    // so the user understands *why* they're being redirected to /login.
    builder.addCase(sessionExpired, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.pendingCredentials = null
      localStorage.removeItem('vibe_user')
      toast.warning("Your session has expired — please sign in again")
    })
  },
})

export const {
  setCredentials, setPendingEmail, setPendingCredentials,
  clearPendingCredentials, logout, updateUser, setTempAccessToken,
} = authSlice.actions
export default authSlice.reducer
