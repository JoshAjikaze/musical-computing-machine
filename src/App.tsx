import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { store, persistor } from "./store"
import { ErrorBoundary, SectionErrorBoundary } from "./components/ui/error-boundary"
import { Navbar } from "./components/layout/Navbar"
import { AppLayout } from "./components/app/AppLayout"
import { LandingPage } from "./pages/LandingPage"
import { LoginPage } from "./pages/auth/LoginPage"
import { JoinPage } from "./pages/auth/JoinPage"
import { VerifyPage } from "./pages/auth/VerifyPage"
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage"
import { AnalyticsPage } from "./pages/app/AnalyticsPage"
import { MyMusicPage } from "./pages/app/MyMusicPage"
import { EarningsPage } from "./pages/app/EarningsPage"
import { ExplorePage } from "./pages/app/ExplorePage"
import { ProfilePage } from "./pages/app/ProfilePage"
import { SupportPage } from "./pages/app/SupportPage"
import { UserLayout } from "./components/user/UserLayout"
import { UserHomePage } from "./pages/user/UserHomePage"
import { UserExplorePage } from "./pages/user/UserExplorePage"
import { UserLibraryPage } from "./pages/user/UserLibraryPage"
import { AdminLayout } from "./components/admin/AdminLayout"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { UserManagementPage } from "./pages/admin/UserManagementPage"
import { MusicManagementPage } from "./pages/admin/MusicManagementPage"
import { MonetizationPage } from "./pages/admin/MonetizationPage"
import { ReportsAnalyticsPage } from "./pages/admin/ReportsAnalyticsPage"
import { ContentModerationPage } from "./pages/admin/ContentModerationPage"
import { Toaster } from "./components/ui/sonner"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

const AUTH_ROUTES = ["/login", "/join", "/verify", "/forgot-password"]
const APP_ROUTES  = ["/app", "/listen", "/admin"]

function Layout() {
  const location = useLocation()
  const isAuthRoute = AUTH_ROUTES.some((r) => location.pathname.startsWith(r))
  const isAppRoute  = APP_ROUTES.some((r)  => location.pathname.startsWith(r))
  if (isAppRoute || isAuthRoute) return null
  return <Navbar />
}

/** Wrap each page in a SectionErrorBoundary so one broken route never kills the whole shell */
function Page({ children }: { children: React.ReactNode }) {
  return <SectionErrorBoundary>{children}</SectionErrorBoundary>
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Layout />
            <Toaster />
            <Routes>
              {/* Public */}
            <Route path="/"                element={<Page><LandingPage /></Page>} />

            {/* Auth */}
            <Route path="/login"           element={<Page><LoginPage /></Page>} />
            <Route path="/join"            element={<Page><JoinPage /></Page>} />
            <Route path="/verify"          element={<Page><VerifyPage /></Page>} />
            <Route path="/forgot-password" element={<Page><ForgotPasswordPage /></Page>} />

            {/* Artist dashboard */}
            <Route path="/app" element={
              <ProtectedRoute allowedRoles={["artist", "admin"]}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index         element={<Page><AnalyticsPage /></Page>} />
              <Route path="my-music"  element={<Page><MyMusicPage /></Page>} />
              <Route path="earnings"  element={<Page><EarningsPage /></Page>} />
              <Route path="explore"   element={<Page><ExplorePage /></Page>} />
              <Route path="profile"   element={<Page><ProfilePage /></Page>} />
              <Route path="support"   element={<Page><SupportPage /></Page>} />
            </Route>

            {/* Listener */}
            <Route path="/listen" element={
              <ProtectedRoute allowedRoles={["fan", "artist", "admin"]}>
                <UserLayout />
              </ProtectedRoute>
            }>
              <Route index          element={<Page><UserHomePage /></Page>} />
              <Route path="explore" element={<Page><UserExplorePage /></Page>} />
              <Route path="library" element={<Page><UserLibraryPage /></Page>} />
              <Route path="profile" element={<Page><ProfilePage /></Page>} />
              <Route path="support" element={<Page><SupportPage /></Page>} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index               element={<Page><AdminDashboard /></Page>} />
              <Route path="users"        element={<Page><UserManagementPage /></Page>} />
              <Route path="music"        element={<Page><MusicManagementPage /></Page>} />
              <Route path="monetization" element={<Page><MonetizationPage /></Page>} />
              <Route path="reports"      element={<Page><ReportsAnalyticsPage /></Page>} />
              <Route path="content"      element={<Page><ContentModerationPage /></Page>} />
              <Route path="settings"     element={<Page><Placeholder title="Settings" /></Page>} />
              <Route path="support"      element={<Page><SupportPage /></Page>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <p className="font-display text-4xl text-vibe-text-muted">{title}</p>
        <p className="text-sm text-vibe-text-muted">Coming soon</p>
      </div>
    </div>
  )
}

export default App
