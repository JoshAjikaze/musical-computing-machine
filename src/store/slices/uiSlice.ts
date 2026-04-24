import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ModalType = 'auth' | 'upload' | 'createPlaylist' | 'shareTrack' | null

interface UIState {
  activeModal: ModalType
  authMode: 'signin' | 'signup'
  isMobileMenuOpen: boolean
  isSidebarCollapsed: boolean
  searchQuery: string
  toasts: Toast[]
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

const initialState: UIState = {
  activeModal: null,
  authMode: 'signin',
  isMobileMenuOpen: false,
  isSidebarCollapsed: false,
  searchQuery: '',
  toasts: [],
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalType>) {
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.activeModal = null
    },
    setAuthMode(state, action: PayloadAction<'signin' | 'signup'>) {
      state.authMode = action.payload
    },
    openAuthModal(state, action: PayloadAction<'signin' | 'signup'>) {
      state.activeModal = 'auth'
      state.authMode = action.payload
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...action.payload, id: Date.now().toString() })
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const {
  openModal,
  closeModal,
  setAuthMode,
  openAuthModal,
  toggleMobileMenu,
  closeMobileMenu,
  toggleSidebar,
  setSearchQuery,
  addToast,
  removeToast,
} = uiSlice.actions

export default uiSlice.reducer
