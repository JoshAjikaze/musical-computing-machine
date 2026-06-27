import { useState } from "react"
import {
  TrendingUp, Users, Wallet, MoreVertical, ChevronDown,
  Music, Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/app/StatCard"
import { UploadPanel } from "@/components/app/UploadPanel"
import { useAppSelector } from "@/hooks/redux"
import { useGetArtistDashboardQuery, useGetArtistStatsQuery, useGetMyTracksQuery, normaliseTrack } from "@/store/api/vibeApi"
import { formatCurrency, formatNumber, formatPlays } from "@/lib/formatters"
import AdvertPlaceholder from "@/components/app/AdvertPlaceholder"

// ── Mock data (matches the designs exactly) ───────────────


export function AnalyticsPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.displayName ?? "Desire"

  const { data: DashboardData, isFetching: DashboardFetching } = useGetArtistDashboardQuery()
  const { data: StatsData, isFetching: StatsFetching } = useGetArtistStatsQuery()
  console.log(StatsData)

  const totalfollowers = DashboardFetching ? "0M" : formatNumber(DashboardData?.stats?.total_followers as number);
  const totalTracks    = StatsFetching ? "0"  : formatNumber(StatsData?.total_tracks as number);
  const totalStreams    = StatsFetching ? "0M" : formatPlays(StatsData?.total_plays as number);
  const totalLikes     = StatsFetching ? "0"  : formatNumber(StatsData?.total_likes as number);
  const totalEarnings  = formatCurrency(0);

  const STATS = [
    { label: "Total Streams",   value: `${totalStreams}`,   icon: <TrendingUp className="h-5 w-5 text-purple-400" /> },
    { label: "Total Likes",     value: `${totalLikes}`,     icon: <Heart      className="h-5 w-5 text-vibe-red fill-vibe-red" /> },
    { label: "Total Tracks",    value: `${totalTracks}`,    icon: <Music      className="h-5 w-5 text-green-400" /> },
    { label: "Followers",       value: `${totalfollowers}`, icon: <Users      className="h-5 w-5 text-orange-400" /> },
    { label: "Earnings",        value: `${totalEarnings}`,  icon: <Wallet     className="h-5 w-5 text-green-400" /> },
  ]

  const { data: rawTracks = [], isLoading: tracksLoading } = useGetMyTracksQuery()
  const artistLabel = user?.stageName || user?.displayName || user?.username || ""
  const topTracks = rawTracks
    .map((t) => normaliseTrack(t, artistLabel))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5)

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Mobile: show Analytics label + Upload button inline */}
            <div className="flex items-center justify-between md:block">
              <div className="flex items-center gap-2 mb-1 md:hidden">
                <span className="text-sm text-vibe-text-muted font-medium">Analytics</span>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Welcome, {displayName}</h1>
            <p className="text-sm text-vibe-text-secondary mt-0.5">Overview of your music performance</p>
          </div>

          <Button
            size="default"
            rounded="full"
            onClick={() => setUploadOpen(true)}
            className="shrink-0"
          >
            Upload music
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Performance + Advert row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Performance card */}
          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-semibold text-white">Performance</h2>
              {/* Period selector */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-vibe-onyx-400 text-sm text-vibe-text-secondary hover:bg-vibe-onyx-300 transition-colors">
                Top 5 tracks
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Top 5 tracks table */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-vibe-text-muted">Top 5 tracks</span>
              <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
                View all
              </button>
            </div>

            {tracksLoading ? (
              <div className="space-y-3 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-vibe-onyx-400" />
                      <div className="h-2.5 w-20 rounded bg-vibe-onyx-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topTracks.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-vibe-text-muted">
                <Music className="h-8 w-8 opacity-30" />
                <p className="text-xs">No tracks uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topTracks.map((track, i) => (
                  <div key={track.id} className="flex items-center gap-3 py-2 group">
                    <span className="text-sm text-vibe-text-muted w-4 shrink-0">{i + 1}.</span>
                    <div className="h-8 w-8 rounded-sm bg-vibe-onyx-300 shrink-0 overflow-hidden">
                      {track.coverUrl
                        ? <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center"><Music className="h-3.5 w-3.5 text-vibe-text-muted" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-vibe-text-primary truncate">{track.title}</p>
                      <p className="text-xs text-vibe-text-muted">
                        {track.playCount > 0 ? track.playCount.toLocaleString() + " plays" : "0 plays"}
                      </p>
                    </div>
                    <button className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advert placeholder */}
          <AdvertPlaceholder />
        </div>

        {/* Bottom advert row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdvertPlaceholder />
          <AdvertPlaceholder />
          <AdvertPlaceholder />
        </div>
      </div>

      {/* Upload panel */}
      <UploadPanel open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  )
}