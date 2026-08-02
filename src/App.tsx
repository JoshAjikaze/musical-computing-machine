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
import { CollectionPage } from "./pages/user/CollectionPage"
import { AfrobeatMixesPage } from "./pages/user/AfrobeatMixesPage"
import { PopularArtistsPage } from "./pages/user/PopularArtistsPage"
import { AllArtistsPage } from "./pages/user/AllArtistsPage"
import { LikedMusicPage } from "./pages/user/LikedMusicPage"
import { UserLibraryPage } from "./pages/user/UserLibraryPage"
import { NowPlayingPage } from "./pages/user/NowPlayingPage"
import { ArtistProfilePage } from "./pages/user/ArtistProfilePage"
import { TrackPage } from "./pages/user/TrackPage"
import { SearchResultsPage } from "./pages/SearchResultsPage"
import { Footer } from "./components/features/footer/Footer"
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage"
import { TermsAndConditionsPage } from "./pages/TermsAndConditionsPage"
import { AdminLayout } from "./components/admin/AdminLayout"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { UserManagementPage } from "./pages/admin/UserManagementPage"
import { MusicManagementPage } from "./pages/admin/MusicManagementPage"
import { MonetizationPage } from "./pages/admin/MonetizationPage"
import { ReportsAnalyticsPage } from "./pages/admin/ReportsAnalyticsPage"
import { ContentModerationPage } from "./pages/admin/ContentModerationPage"
import { Toaster } from "./components/ui/sonner"
import { AudioEngine } from "./components/app/AudioEngine"
import { PWAUpdatePrompt } from "./components/app/PWAUpdatePrompt"
import { AuthGuard } from "./components/app/AuthGuard"
import { ConsentBanner } from "./components/app/ConsentBanner"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "./store"
import { loadAdSenseScript } from "./lib/adsense"

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

/**
 * Default "/" route. Signed-out visitors see the marketing LandingPage as
 * before; already-authenticated users are sent straight to their dashboard
 * (artist → /app, listener → /listen, admin → /admin) instead of the
 * homepage. Role → dashboard mapping mirrors LoginPage's post-login redirect.
 */
function HomeRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  if (isAuthenticated && user) {
    const dest = user.role === "admin" ? "/admin" : user.role === "artist" ? "/app" : "/listen"
    return <Navigate to={dest} replace />
  }
  return <LandingPage />
}

function App() {
  // Loads the AdSense script once, app-wide — a no-op until
  // VITE_ADSENSE_PUBLISHER_ID is set (see lib/adsense.ts).
  useEffect(() => { loadAdSenseScript() }, [])

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Layout />
            <AudioEngine />
            <PWAUpdatePrompt />
            <AuthGuard />
            <Toaster />
            <ConsentBanner />
            <Routes>
              {/* Public */}
            <Route path="/"                    element={<Page><HomeRoute /></Page>} />
            <Route path="/privacy-policy"      element={<Page><PrivacyPolicyPage /></Page>} />
            <Route path="/termsandconditions"  element={<Page><TermsAndConditionsPage /></Page>} />

            {/* Public share links — opened from ShareDialog's copyable URLs.
                Deliberately NOT nested under /listen's ProtectedRoute: these
                are what someone clicks from a tweet/DM/WhatsApp message
                before they've ever signed in. ArtistProfilePage is reused
                as-is from the protected /app and /listen trees too — its
                Follow/Play actions self-gate via requireAuth() when there's
                no session, rather than this route gating the whole page. */}
            <Route path="/artist/:username" element={<Page><ArtistProfilePage /><Footer /></Page>} />
            <Route path="/track/:trackId"   element={<Page><TrackPage /><Footer /></Page>} />

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
              <Route path="artist/:username" element={<Page><ArtistProfilePage /></Page>} />
              <Route path="search"    element={<Page><SearchResultsPage /></Page>} />
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
              <Route path="now-playing" element={<Page><NowPlayingPage /></Page>} />
              <Route path="artist/:username"  element={<Page><ArtistProfilePage /></Page>} />
              <Route path="collection/:section" element={<Page><CollectionPage /></Page>} />
              <Route path="afrobeat-mixes" element={<Page><AfrobeatMixesPage /></Page>} />
              <Route path="popular-artists" element={<Page><PopularArtistsPage /></Page>} />
              <Route path="artists" element={<Page><AllArtistsPage /></Page>} />
              <Route path="liked" element={<Page><LikedMusicPage /></Page>} />
              <Route path="search" element={<Page><SearchResultsPage /></Page>} />
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
              <Route path="search"       element={<Page><SearchResultsPage /></Page>} />
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
