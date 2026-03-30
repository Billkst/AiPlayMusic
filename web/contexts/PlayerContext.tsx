'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import type { Track } from '@/lib/catalog'

export type PlayMode = 'sequence' | 'loop' | 'shuffle'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playlist: Track[]
  currentIndex: number
  playMode: PlayMode
  volume: number
}

interface PlayerActions {
  playTrack: (track: Track) => void
  togglePlay: () => void
  seek: (time: number) => void
  stop: () => void
  playNext: () => void
  playPrevious: () => void
  setPlaylist: (tracks: Track[], startIndex?: number) => void
  setPlayMode: (mode: PlayMode) => void
  setVolume: (volume: number) => void
}

type PlayerContextType = PlayerState & PlayerActions

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playlist, setPlaylistState] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [playMode, setPlayModeState] = useState<PlayMode>('sequence')
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [volume, setVolumeState] = useState(1)

  const generateShuffledIndices = useCallback((length: number, firstIndex: number) => {
    const indices = Array.from({ length }, (_, i) => i)
    const remaining = indices.filter(i => i !== firstIndex)
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]]
    }
    return firstIndex !== -1 ? [firstIndex, ...remaining] : remaining
  }, [])

  const getShuffleOrder = useCallback(() => {
    if (playlist.length === 0) {
      return []
    }

    if (shuffledIndices.length === playlist.length && shuffledIndices.includes(currentIndex)) {
      return shuffledIndices
    }

    const firstIndex = currentIndex >= 0 ? currentIndex : 0
    const nextOrder = generateShuffledIndices(playlist.length, firstIndex)
    setShuffledIndices(nextOrder)
    return nextOrder
  }, [playlist.length, shuffledIndices, currentIndex, generateShuffledIndices])

  const playTrackAtIndex = useCallback((index: number, tracksOverride?: Track[]) => {
    const tracks = tracksOverride || playlist
    const track = tracks[index]
    if (!track) return

    const audio = audioRef.current
    if (!audio) return

    audio.src = track.audio_url
    audio.play().catch(() => {
      setIsPlaying(false)
    })
    setCurrentTrack(track)
    setCurrentIndex(index)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [playlist])

  const playNext = useCallback(() => {
    if (playlist.length === 0) return

    let nextIndex = -1
    if (playMode === 'shuffle') {
      const shuffleOrder = getShuffleOrder()
      const currentShuffledPos = shuffleOrder.indexOf(currentIndex)
      if (currentShuffledPos !== -1 && currentShuffledPos < shuffleOrder.length - 1) {
        nextIndex = shuffleOrder[currentShuffledPos + 1]
      } else {
        const newShuffled = generateShuffledIndices(playlist.length, currentIndex)
        setShuffledIndices(newShuffled)
        nextIndex = newShuffled.find(index => index !== currentIndex) ?? newShuffled[0]
      }
    } else {
      const next = currentIndex + 1
      if (next < playlist.length) {
        nextIndex = next
      } else if (playMode === 'loop') {
        nextIndex = 0
      }
    }

    if (nextIndex !== -1) {
      playTrackAtIndex(nextIndex)
    }
  }, [playlist, currentIndex, playMode, playTrackAtIndex, generateShuffledIndices, getShuffleOrder])

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return

    let prevIndex = -1
    if (playMode === 'shuffle') {
      const shuffleOrder = getShuffleOrder()
      const currentShuffledPos = shuffleOrder.indexOf(currentIndex)
      if (currentShuffledPos > 0) {
        prevIndex = shuffleOrder[currentShuffledPos - 1]
      } else {
        prevIndex = shuffleOrder[shuffleOrder.length - 1]
      }
    } else {
      const prev = currentIndex - 1
      if (prev >= 0) {
        prevIndex = prev
      } else if (playMode === 'loop') {
        prevIndex = playlist.length - 1
      }
    }

    if (prevIndex !== -1) {
      playTrackAtIndex(prevIndex)
    }
  }, [playlist, currentIndex, playMode, playTrackAtIndex, getShuffleOrder])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const savedVolume = typeof window !== 'undefined' ? localStorage.getItem('player_volume') : null
    const initialVolume = savedVolume ? parseFloat(savedVolume) : 1
    audio.volume = initialVolume
    setVolumeState(initialVolume)

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      playNext()
    }
    const handleError = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [playNext])

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play().catch(() => setIsPlaying(false))
        setIsPlaying(true)
      }
      return
    }

    const index = playlist.findIndex(t => t.id === track.id)
    if (index !== -1) {
      setCurrentIndex(index)
    }

    audio.src = track.audio_url
    audio.play().catch(() => setIsPlaying(false))
    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [currentTrack, isPlaying, playlist])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }, [currentTrack, isPlaying])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.src = ''
    setCurrentTrack(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setCurrentIndex(-1)
  }, [])

  const setPlaylist = useCallback((tracks: Track[], startIndex: number = 0) => {
    setPlaylistState(tracks)
    if (tracks.length > 0) {
      const index = Math.max(0, Math.min(startIndex, tracks.length - 1))
      playTrackAtIndex(index, tracks)
      if (playMode === 'shuffle') {
        setShuffledIndices(generateShuffledIndices(tracks.length, index))
      }
    } else {
      stop()
    }
  }, [playTrackAtIndex, playMode, generateShuffledIndices, stop])

  const setPlayMode = useCallback((mode: PlayMode) => {
    setPlayModeState(mode)
    if (mode === 'shuffle' && playlist.length > 0) {
      setShuffledIndices(generateShuffledIndices(playlist.length, currentIndex))
    }
  }, [playlist.length, currentIndex, generateShuffledIndices])

  const setVolume = useCallback((vol: number) => {
    const clampedVolume = Math.max(0, Math.min(1, vol))
    const audio = audioRef.current
    if (audio) {
      audio.volume = clampedVolume
    }
    setVolumeState(clampedVolume)
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_volume', clampedVolume.toString())
    }
  }, [])

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      isPlaying, 
      currentTime, 
      duration, 
      playlist,
      currentIndex,
      playMode,
      volume,
      playTrack, 
      togglePlay, 
      seek, 
      stop,
      playNext,
      playPrevious,
      setPlaylist,
      setPlayMode,
      setVolume
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within PlayerProvider')
  return context
}
