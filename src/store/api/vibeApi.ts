/**
 * vibeApi — RTK Query API
 * All endpoints derived from the official VibeGarage OpenAPI 3.1 spec.
 *
 * Key spec facts:
 *  - POST /auth/login        → TokenResponse { access_token, token_type }
 *  - POST /auth/signup       → UserResponse  { id, email, username, is_verified_artist, role }
 *  - POST /auth/verify-email → query params ?email=&code= (NO body)
 *  - POST /auth/reset-password → body: { token, new_password }
 *  - PATCH /account/update-profile → query params ?display_name=&bio=
 *  - PUT /account/change-password  → query params ?current_pw=&new_pw=
 *  - GET /artist/stats  → ArtistStatsOut { total_tracks, total_plays, total_likes, top_track }
 *  - Track upload multipart: title (str), audio (file), cover? (file), price?, is_for_sale?
 *  - Admin users:  GET /admin/users → UserResponse[]
 *  - Admin logs:   GET /admin/logs?limit=&offset= → AuditLogResponse[]
 *  - Admin payouts: GET /admin/payouts/pending → PayoutResponse[]
 */
import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
  type BaseQueryFn,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'
import { logout } from '../slices/authSlice'

// ─────────────────────────────────────────────────────────
// Schema types matching the spec exactly
// ─────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  username: string | null
  is_verified_artist: boolean
  role: string  // "LISTENER" | "ARTIST" | "ADMIN"
}

export interface ArtistStatsOut {
  total_tracks: number
  total_plays: number
  total_likes: number
  top_track: Record<string, unknown> | null
}

export interface TrackOut {
  id: string
  title: string
  audio_path: string
  cover_path: string | null
  price: number
  is_for_sale: boolean
  plays: number
  likes: number
}

export interface PublicTrackOut {
  id: string
  title: string
  plays: number
  likes: number
  artist_name: string
  price: number
  is_for_sale: boolean
}

export interface AuditLogResponse {
  id: string
  admin_id: string
  action: string
  target_id: string
  details: unknown | null
  created_at: string
}

export interface PayoutResponse {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  created_at: string
}

export interface ArtistPaymentSettingsCreate {
  preferred_method: 'bank' | 'paypal'
  bank_name?: string | null
  bank_code?: string | null
  account_number?: string | null
  account_name?: string | null
  paypal_email?: string | null
}

export interface ArtistPaymentSettingsResponse extends ArtistPaymentSettingsCreate {
  id: string
  user_id: string
  updated_at: string
}


// Track type — used by playerSlice and listener pages
export interface Track {
  id: string
  title: string
  artist: string
  artistId: string
  album?: string
  albumId?: string
  duration: number
  coverUrl: string
  audioUrl: string
  genre: string
  playCount: number
  likeCount: number
  releaseDate: string
  isLiked?: boolean
  isPremium?: boolean
}

// Internal User shape stored in Redux — superset of UserResponse
export interface User {
  id: string
  email: string
  username: string | null
  displayName: string
  avatarUrl?: string
  isPremium: boolean
  role: 'fan' | 'artist' | 'admin'
  is_verified_artist: boolean
  createdAt: string
}

/** Convert backend UserResponse → internal User */
export function normaliseUser(u: UserResponse): User {
  const role = u.role === 'ARTIST' ? 'artist' : u.role === 'ADMIN' ? 'admin' : 'fan'
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.username ?? u.email.split('@')[0],
    isPremium: u.is_verified_artist,
    role,
    is_verified_artist: u.is_verified_artist,
    createdAt: new Date().toISOString(),
  }
}

// Legacy alias kept for pages that import AuthResponse
export interface AuthResponse { user: User; token: string }

// ─────────────────────────────────────────────────────────
// Base query — 401 always logs out (no refresh endpoint in spec)
// ─────────────────────────────────────────────────────────
const rawBase = fetchBaseQuery({
  baseUrl: (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL
    ?? 'https://vibegarage-backend.onrender.com',
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("vibe_token") || (getState() as RootState).auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extra) => {
    const result = await rawBase(args, api, extra)
    if (result.error?.status === 401) api.dispatch(logout())
    return result
  }

// ─────────────────────────────────────────────────────────
// API definition
// ─────────────────────────────────────────────────────────
export const vibeApi = createApi({
  reducerPath: 'vibeApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Track', 'Artist', 'Album', 'Playlist', 'User', 'Dashboard', 'Admin', 'Payout'],
  endpoints: (b) => ({

    // ── Auth ──────────────────────────────────────────────────────
    /** POST /auth/signup  body: { email, password, username, full_name?, stage_name?, dob, role? } */
    register: b.mutation<UserResponse, {
      email: string; password: string; username: string
      full_name?: string | null; stage_name?: string | null
      dob: string; role?: 'LISTENER' | 'ARTIST'
    }>({ query: (body) => ({ url: '/auth/signup', method: 'POST', body }) }),

    /** POST /auth/login  body: { email, password }  → TokenResponse */
    login: b.mutation<TokenResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    /** GET /auth/me → UserResponse */
    getCurrentUser: b.query<UserResponse, void>({
      query: () => '/auth/me', providesTags: ['User'],
    }),

    /** POST /auth/verify-email?email=&code=  (query params, NO body) */
    verifyEmail: b.mutation<unknown, { email: string; code: string }>({
      query: ({ email, code }) => ({
        url: `/auth/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
        method: 'POST',
      }),
    }),
    
    /** POST /auth/resend-verification  body: { email } */
    resendVerification: b.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body,
      }),
    }),

    /** GET /auth/2fa/setup */
    setup2fa: b.query<unknown, void>({ query: () => '/auth/2fa/setup' }),

    /** POST /auth/2fa/enable?code= */
    enable2fa: b.mutation<unknown, { code: string }>({
      query: ({ code }) => ({ url: `/auth/2fa/enable?code=${encodeURIComponent(code)}`, method: 'POST' }),
    }),

    /** POST /auth/forgot-password  body: { email } */
    forgotPassword: b.mutation<unknown, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    /** POST /auth/reset-password  body: { token, new_password } */
    resetPassword: b.mutation<unknown, { token: string; new_password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),

    // ── Account Management ────────────────────────────────────────
    getAccountOverview: b.query<unknown, void>({ query: () => '/account/me', providesTags: ['User'] }),

    /** PATCH /account/update-profile?display_name=&bio= */
    updateProfile: b.mutation<unknown, { display_name?: string; bio?: string }>({
      query: (p) => {
        const q = new URLSearchParams()
        if (p.display_name) q.set('display_name', p.display_name)
        if (p.bio) q.set('bio', p.bio)
        return { url: `/account/update-profile?${q}`, method: 'PATCH' }
      },
      invalidatesTags: ['User'],
    }),

    /** POST /account/upload-avatar  multipart: { file } */
    uploadAvatar: b.mutation<unknown, FormData>({
      query: (body) => ({ url: '/account/upload-avatar', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    /** PUT /account/change-password?current_pw=&new_pw= */
    changePassword: b.mutation<unknown, { current_pw: string; new_pw: string }>({
      query: ({ current_pw, new_pw }) => ({
        url: `/account/change-password?current_pw=${encodeURIComponent(current_pw)}&new_pw=${encodeURIComponent(new_pw)}`,
        method: 'PUT',
      }),
    }),

    deactivateAccount: b.mutation<unknown, void>({
      query: () => ({ url: '/account/deactivate', method: 'PATCH' }),
    }),

    updateSocials: b.mutation<unknown, { instagram?: string; twitter?: string; website?: string }>({
      query: (p) => {
        const q = new URLSearchParams()
        if (p.instagram) q.set('instagram', p.instagram)
        if (p.twitter) q.set('twitter', p.twitter)
        if (p.website) q.set('website', p.website)
        return { url: `/account/socials?${q}`, method: 'PATCH' }
      },
    }),

    updatePreferences: b.mutation<unknown, { language?: string; email_notifications?: boolean }>({
      query: ({ language = 'en', email_notifications = true }) => ({
        url: `/account/preferences?language=${language}&email_notifications=${email_notifications}`,
        method: 'PATCH',
      }),
    }),

    upgradeToArtist: b.mutation<unknown, { stage_name: string; bio?: string | null }>({
      query: (body) => ({ url: '/account/upgrade-to-artist', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    // ── Artist Management ─────────────────────────────────────────
    getArtistDashboard: b.query<unknown, void>({ query: () => '/artist/dashboard', providesTags: ['Dashboard'] }),
    getArtistPremiumDashboard: b.query<unknown, void>({ query: () => '/artist/premium/dashboard', providesTags: ['Dashboard'] }),

    /** POST /artist/upload  multipart: { title, audio, cover?, price?, is_for_sale? } */
    uploadTrackArtist: b.mutation<TrackOut, FormData>({
      query: (body) => ({ url: '/artist/upload', method: 'POST', body }),
      invalidatesTags: ['Track'],
    }),

    /** GET /artist/stats → ArtistStatsOut */
    getArtistStats: b.query<ArtistStatsOut, void>({ query: () => '/artist/stats', providesTags: ['Dashboard'] }),

    getArtistProfile: b.query<unknown, string>({ query: (id) => `/artist/profile/${id}` }),
    followArtist: b.mutation<unknown, string>({ query: (id) => ({ url: `/artist/${id}/follow`, method: 'POST' }), invalidatesTags: ['Artist'] }),
    getFollowStatus: b.query<unknown, string>({ query: (id) => `/artist/${id}/follow-status` }),

    setPaymentSettings: b.mutation<ArtistPaymentSettingsResponse, ArtistPaymentSettingsCreate>({
      query: (body) => ({ url: '/artist/payment-settings', method: 'POST', body }),
    }),
    getPaymentSettings: b.query<ArtistPaymentSettingsResponse, void>({ query: () => '/artist/payment-settings' }),

    requestPayout: b.mutation<PayoutResponse, { amount: number; currency?: string }>({
      query: (body) => ({ url: '/artist/payouts', method: 'POST', body }),
      invalidatesTags: ['Payout'],
    }),
    getMyPayouts: b.query<PayoutResponse[], void>({ query: () => '/artist/payouts', providesTags: ['Payout'] }),

    // ── Tracks ────────────────────────────────────────────────────
    /** POST /tracks/upload  multipart: { title, audio, cover?, price?, is_for_sale? } */
    uploadTrack: b.mutation<TrackOut, FormData>({ query: (body) => ({ url: '/tracks/upload', method: 'POST', body }), invalidatesTags: ['Track'] }),

    streamTrack: b.query<unknown, { track_id: string; ad_viewed?: boolean }>({ query: ({ track_id, ad_viewed = false }) => `/tracks/stream/${track_id}?ad_viewed=${ad_viewed}` }),
    downloadTrack: b.query<unknown, string>({ query: (id) => `/tracks/download/${id}` }),
    getMyTracks: b.query<TrackOut[], void>({ query: () => '/tracks/my', providesTags: ['Track'] }),
    likeTrack: b.mutation<unknown, string>({ query: (id) => ({ url: `/tracks/${id}/like`, method: 'POST' }), invalidatesTags: ['Track'] }),
    getLatestTracks: b.query<PublicTrackOut[], void>({ query: () => '/tracks/public/latest', providesTags: ['Track'] }),
    getTrendingTracks: b.query<PublicTrackOut[], void>({ query: () => '/tracks/public/trending', providesTags: ['Track'] }),

    // ── Albums ────────────────────────────────────────────────────
    bulkUploadAlbum: b.mutation<unknown, FormData>({ query: (body) => ({ url: '/albums/bulk-upload', method: 'POST', body }), invalidatesTags: ['Album'] }),

    // ── Listener Dashboard ────────────────────────────────────────
    getListenerDashboard: b.query<unknown, void>({ query: () => '/listener/dashboard', providesTags: ['User'] }),
    getLikedTracks: b.query<unknown, void>({ query: () => '/listener/liked-tracks', providesTags: ['Track'] }),
    getLikes: b.query<unknown, void>({ query: () => '/listener/likes', providesTags: ['Track'] }),
    getFollowingArtists: b.query<unknown, void>({ query: () => '/listener/following', providesTags: ['Artist'] }),
    getRecentlyPlayed: b.query<unknown, void>({ query: () => '/listener/recently-played' }),
    getListeningHistory: b.query<unknown, void>({ query: () => '/listener/history' }),

    // ── Playlists ─────────────────────────────────────────────────
    createPlaylist: b.mutation<unknown, { name: string }>({ query: ({ name }) => ({ url: `/playlists/?name=${encodeURIComponent(name)}`, method: 'POST' }), invalidatesTags: ['Playlist'] }),
    getMyPlaylists: b.query<unknown, void>({ query: () => '/playlists/me', providesTags: ['Playlist'] }),
    getPlaylistDetails: b.query<unknown, string>({ query: (id) => `/playlists/${id}`, providesTags: (_r, _e, id) => [{ type: 'Playlist', id }] }),
    uploadPlaylistCover: b.mutation<unknown, { playlist_id: string; file: FormData }>({ query: ({ playlist_id, file }) => ({ url: `/playlists/${playlist_id}/upload-cover`, method: 'POST', body: file }) }),

    // ── Discovery & Trending ──────────────────────────────────────
    getLandingPageData: b.query<unknown, { limit?: number }>({ query: ({ limit = 10 }) => `/trending/landing-page?limit=${limit}` }),
    getDiscoveryTrending: b.query<unknown, { limit?: number }>({ query: ({ limit = 10 }) => `/discovery/trending?limit=${limit}`, providesTags: ['Track'] }),
    getNewReleases: b.query<unknown, { limit?: number }>({ query: ({ limit = 10 }) => `/discovery/new-releases?limit=${limit}`, providesTags: ['Track'] }),
    getGarageFeed: b.query<unknown, { limit?: number }>({ query: ({ limit = 20 }) => `/discovery/feed?limit=${limit}` }),
    getDailyMix: b.query<unknown, void>({ query: () => '/daily-mix/' }),

    // ── Explore & Search ──────────────────────────────────────────
    getPersonalizedFeed: b.query<TrackOut[], void>({ query: () => '/explore/feed', providesTags: ['Track'] }),
    globalSearch: b.query<unknown, string>({ query: (q) => `/explore/search?q=${encodeURIComponent(q)}` }),
    getRisingStars: b.query<unknown, { limit?: number }>({ query: ({ limit = 10 }) => `/explore/rising-stars?limit=${limit}` }),

    // ── Public Profiles ───────────────────────────────────────────
    getPublicArtistData: b.query<unknown, string>({ query: (u) => `/public/artists/${u}/data`, providesTags: ['Artist'] }),
    getArtistQrCode: b.query<unknown, string>({ query: (u) => `/public/artists/${u}/qrcode` }),

    // ── Lyrics & Clips ────────────────────────────────────────────
    uploadLyrics: b.mutation<unknown, { track_id: string; body: FormData }>({ query: ({ track_id, body }) => ({ url: `/lyrics/upload/${track_id}`, method: 'POST', body }) }),
    getLyrics: b.query<unknown, string>({ query: (id) => `/lyrics/${id}` }),
    uploadClip: b.mutation<unknown, FormData>({ query: (body) => ({ url: '/clips/upload', method: 'POST', body }) }),
    getMyClips: b.query<unknown, void>({ query: () => '/clips/me' }),

    // ── Admin (Super Admin) ───────────────────────────────────────
    getSystemHealth: b.query<unknown, void>({ query: () => '/admin/dashboard/health', providesTags: ['Admin'] }),
    getAdminDashboardSummary: b.query<unknown, void>({ query: () => '/admin/dashboard/summary', providesTags: ['Admin'] }),
    getAdminRecentActivity: b.query<unknown, void>({ query: () => '/admin/dashboard/recent-activity', providesTags: ['Admin'] }),
    getAdminUsers: b.query<UserResponse[], void>({ query: () => '/admin/users', providesTags: ['Admin'] }),

    changeUserRole: b.mutation<unknown, { user_id: string; new_role: string }>({
      query: ({ user_id, new_role }) => ({ url: `/admin/users/${user_id}/role?new_role=${encodeURIComponent(new_role)}`, method: 'PUT' }),
      invalidatesTags: ['Admin'],
    }),
    suspendUser: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/users/${id}/suspend`, method: 'POST' }), invalidatesTags: ['Admin'] }),
    reactivateUser: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/users/${id}/reactivate`, method: 'POST' }), invalidatesTags: ['Admin'] }),

    adminDeleteTrack: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/tracks/${id}`, method: 'DELETE' }), invalidatesTags: ['Admin', 'Track'] }),
    adminListLyrics: b.query<unknown, void>({ query: () => '/admin/lyrics/all', providesTags: ['Admin'] }),
    adminDeleteLyric: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/lyrics/${id}`, method: 'DELETE' }), invalidatesTags: ['Admin'] }),
    adminListClips: b.query<unknown, void>({ query: () => '/admin/clips/all', providesTags: ['Admin'] }),
    adminDeleteClip: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/clips/${id}`, method: 'DELETE' }), invalidatesTags: ['Admin'] }),

    adminListPendingPayouts: b.query<PayoutResponse[], void>({ query: () => '/admin/payouts/pending', providesTags: ['Admin', 'Payout'] }),
    adminApprovePayout: b.mutation<unknown, string>({ query: (id) => ({ url: `/admin/payouts/${id}/approve`, method: 'POST' }), invalidatesTags: ['Admin', 'Payout'] }),
    adminRejectPayout: b.mutation<unknown, { id: string; reason: string }>({ query: ({ id, reason }) => ({ url: `/admin/payouts/${id}/reject?reason=${encodeURIComponent(reason)}`, method: 'POST' }), invalidatesTags: ['Admin', 'Payout'] }),

    getAdminStatsSummary: b.query<unknown, void>({ query: () => '/admin/stats/summary', providesTags: ['Admin'] }),
    adminSearchUsers: b.query<unknown, string>({ query: (q) => `/admin/search/users?query=${encodeURIComponent(q)}` }),
    getAdminLogs: b.query<AuditLogResponse[], { limit?: number; offset?: number }>({ query: ({ limit = 100, offset = 0 }) => `/admin/logs?limit=${limit}&offset=${offset}`, providesTags: ['Admin'] }),
    getAdminSettings: b.query<unknown, void>({ query: () => '/admin/settings', providesTags: ['Admin'] }),
    updateAdminSettings: b.mutation<unknown, { maintenance_mode?: boolean | null; disable_signups?: boolean | null; disable_uploads?: boolean | null }>({ query: (body) => ({ url: '/admin/settings', method: 'PATCH', body }), invalidatesTags: ['Admin'] }),

    // Contact form (landing page)
    sendContactMessage: b.mutation<unknown, { fullName: string; email: string; message: string }>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
  }),
})

// ─────────────────────────────────────────────────────────
// Auto-generated hooks
// ─────────────────────────────────────────────────────────
export const {
  useRegisterMutation, useLoginMutation, useGetCurrentUserQuery,
  useVerifyEmailMutation, useSetup2faQuery, useEnable2faMutation,
  useForgotPasswordMutation, useResetPasswordMutation,
  useGetAccountOverviewQuery, useUpdateProfileMutation, useUploadAvatarMutation,
  useChangePasswordMutation, useDeactivateAccountMutation,
  useUpdateSocialsMutation, useUpdatePreferencesMutation, useUpgradeToArtistMutation,
  useGetArtistDashboardQuery, useGetArtistPremiumDashboardQuery,
  useUploadTrackArtistMutation, useGetArtistStatsQuery,
  useGetArtistProfileQuery, useFollowArtistMutation, useGetFollowStatusQuery,
  useSetPaymentSettingsMutation, useGetPaymentSettingsQuery,
  useRequestPayoutMutation, useGetMyPayoutsQuery,
  useUploadTrackMutation, useStreamTrackQuery, useDownloadTrackQuery,
  useGetMyTracksQuery, useLikeTrackMutation,
  useGetLatestTracksQuery, useGetTrendingTracksQuery,
  useBulkUploadAlbumMutation,
  useGetListenerDashboardQuery, useGetLikedTracksQuery, useGetLikesQuery,
  useGetFollowingArtistsQuery, useGetRecentlyPlayedQuery, useGetListeningHistoryQuery,
  useCreatePlaylistMutation, useGetMyPlaylistsQuery,
  useGetPlaylistDetailsQuery, useUploadPlaylistCoverMutation,
  useGetLandingPageDataQuery, useGetDiscoveryTrendingQuery,
  useGetNewReleasesQuery, useGetGarageFeedQuery, useGetDailyMixQuery,
  useGetPersonalizedFeedQuery, useGlobalSearchQuery, useGetRisingStarsQuery,
  useGetPublicArtistDataQuery, useGetArtistQrCodeQuery,
  useUploadLyricsMutation, useGetLyricsQuery,
  useUploadClipMutation, useGetMyClipsQuery,
  useGetSystemHealthQuery, useGetAdminDashboardSummaryQuery,
  useGetAdminRecentActivityQuery, useGetAdminUsersQuery,
  useChangeUserRoleMutation, useSuspendUserMutation, useReactivateUserMutation,
  useAdminDeleteTrackMutation, useAdminListLyricsQuery, useAdminDeleteLyricMutation,
  useAdminListClipsQuery, useAdminDeleteClipMutation,
  useAdminListPendingPayoutsQuery, useAdminApprovePayoutMutation, useAdminRejectPayoutMutation,
  useGetAdminStatsSummaryQuery, useAdminSearchUsersQuery, useGetAdminLogsQuery,
  useGetAdminSettingsQuery, useUpdateAdminSettingsMutation,
  useSendContactMessageMutation,
  useResendVerificationMutation,
} = vibeApi
