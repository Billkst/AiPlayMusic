'use client'

import { useEffect, useState } from 'react'
import { Music, Play, Pause } from 'lucide-react'
import { usePlayer } from '@/hooks/use-player'
import type { Track } from '@/lib/catalog'

interface SongCardProps {
  track: Track
  reason: string
}

export function SongCard({ track, reason }: SongCardProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayer()
  const [hasImageError, setHasImageError] = useState(false)
  const isCurrentTrack = currentTrack?.id === track.id
  const isThisPlaying = isCurrentTrack && isPlaying

  useEffect(() => {
    setHasImageError(false)
  }, [track.id, track.coverUrl])

  const gradientClass = (() => {
    if (track.id.startsWith('fire')) return 'from-red-600/70 to-orange-500/40'
    if (track.id.startsWith('emo')) return 'from-purple-700/70 to-fuchsia-500/40'
    if (track.id.startsWith('focus')) return 'from-teal-600/70 to-cyan-500/40'
    if (track.id.startsWith('chill')) return 'from-amber-500/70 to-yellow-400/40'
    if (track.id.startsWith('drive')) return 'from-green-600/70 to-emerald-500/40'
    if (track.id.startsWith('sleep')) return 'from-indigo-700/70 to-blue-500/40'
    return 'from-slate-600/60 to-zinc-500/40'
  })()

  return (
    <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#242424] rounded-lg border border-[#282828] hover:border-[#333] transition-all group">
      <div className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradientClass}`}>
        {!hasImageError && (
          <img
            src={track.coverUrl}
            alt={track.name}
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Music className="w-5 h-5 text-white/80" />
        </div>
        <button
          onClick={() => playTrack(track)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center hover:scale-110 transition-transform">
            {isThisPlaying ? (
              <Pause className="w-5 h-5 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 text-black fill-current ml-0.5" />
            )}
          </div>
        </button>
        {isThisPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center">
              <Pause className="w-5 h-5 text-black fill-current" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className={`text-sm font-bold truncate ${isCurrentTrack ? 'text-[#1db954]' : 'text-white'}`}>
          {track.name}
        </span>
        <span className="text-xs text-[#b3b3b3] truncate">{track.artist}</span>
        <span className="text-xs text-[#888] italic truncate">{reason}</span>
      </div>
    </div>
  )
}
