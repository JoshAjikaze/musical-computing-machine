import { useState } from "react"
import {
  TrendingUp, Download, Users, Wallet, MoreVertical, ChevronDown,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/app/StatCard"
import { UploadPanel } from "@/components/app/UploadPanel"
import { useAppSelector } from "@/hooks/redux"
import { useGetArtistDashboardQuery, useGetArtistStatsQuery } from "@/store/api/vibeApi"

// ── Mock data (matches the designs exactly) ───────────────


export function AnalyticsPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.displayName ?? "Desire"

  const { data: DashboardData, isFetching: DashboardFetching } = useGetArtistDashboardQuery()
  const { data: StatsData, isFetching: StatsFetching } = useGetArtistStatsQuery()
  console.log(StatsData)

  const totalfollowers = DashboardFetching ? "0M" : `${DashboardData?.stats?.total_followers}M`;
  const totalTracks = StatsFetching ? "0" : `${StatsData?.total_tracks}`;
  const totalStreams = StatsFetching ? "0M" : `${StatsData?.total_plays}M`; 

  const STATS = [
    { label: "Total Streams", value: `${totalStreams}`, change: 16, icon: <TrendingUp className="h-5 w-5 text-purple-400" /> },
    { label: "Total Downloads", value: "0K", change: -0.4, icon: <Download className="h-5 w-5 text-vibe-red" /> },
    { label: "Total Tracks", value: `${totalTracks}`, change: 2, icon: <Music className="h-5 w-5 text-green-400" /> },
    { label: "Followers", value: `${totalfollowers}`, change: 8, icon: <Users className="h-5 w-5 text-orange-400" /> },
    { label: "Earnings", value: "$0", change: 2, icon: <Wallet className="h-5 w-5 text-green-400" /> },
  ]

  const TOP_TRACKS = [
    { rank: 1, title: "Mad over you", plays: "20, 099, 221" },
    { rank: 2, title: "Revolve", plays: "5, 109, 077" },
    { rank: 3, title: "Umbrella", plays: "3, 100, 042" },
    { rank: 4, title: "Living good", plays: "2, 826, 316" },
    { rank: 5, title: "Super chickens", plays: "1, 049, 829" },
  ]


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

            <div className="space-y-1">
              {TOP_TRACKS.map((track) => (
                <div key={track.rank} className="flex items-center gap-3 py-2 group">
                  <span className="text-sm text-vibe-text-muted w-4 shrink-0">{track.rank}.</span>
                  {/* Art placeholder */}
                  <div className="h-8 w-8 rounded-sm bg-vibe-onyx-300 shrink-0 overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/perf${track.rank}/32/32`}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-vibe-text-primary truncate">{track.title}</p>
                    <p className="text-xs text-vibe-text-muted">{track.plays}</p>
                  </div>
                  <button className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
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

function AdvertPlaceholder() {
  return (
    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 flex items-center justify-center min-h-[200px]">
      <span className="text-xs text-vibe-text-muted uppercase tracking-widest">Advert</span>
    </div>
  )
}
