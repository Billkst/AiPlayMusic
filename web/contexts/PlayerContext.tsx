'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import type { Track } from '@/lib/catalog'

type PlayMode = 'sequence' | 'loop' | 'shuffle'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playlist: Track[]
  currentIndex: number
  playMode: PlayMode
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
  const [playMode, setPlayMode] = useState<PlayMode>('sequence')
  const shuffleHistoryRef = useRef<number[]>([])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
    setIsPlaying(false)
    const nextIndex = getNextIndex()
    if (nextIndex !== null && playlist[nextIndex]) {
      playTrackAtIndex(nextIndex)
    }
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
  }, [])

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
      return
    }

    audio.src = track.audioUrl
    audio.play()
    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [currentTrack, isPlaying])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
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
  }, [])

  const getNextIndex = useCallback((): number | null => {
    if (playlist.length === 0) return null
    if (currentIndex === -1) return 0

    if (playMode === 'sequence') {
      const next = currentIndex + 1
      return next < playlist.length ? next : null
    }

    if (playMode === 'loop') {
      return (currentIndex + 1) % playlist.length
    }

    if (playMode === 'shuffle') {
      if (!shuffleHistoryRef.current.includes(currentIndex)) {
        shuffleHistoryRef.current.push(currentIndex)
      }
      
      if (shuffleHistoryRef.current.length >= playlist.length) {
        shuffleHistoryRef.current = [currentIndex]
      }
      
      const available = Array.from({ length: playlist.length }, (_, i) => i)
        .filter(i => !shuffleHistoryRef.current.includes(i))
      
      if (available.length === 0) return null
      
      return available[Math.floor(Math.random() * available.length)]
    }

    return null
  }, [playlist, currentIndex, playMode])

  const getPreviousIndex = useCallback((): number | null => {
    if (playlist.length === 0) return null
    if (currentIndex === -1) return null

    if (playMode === 'shuffle') {
      return currentIndex > 0 ? currentIndex - 1 : null
    }

    const prev = currentIndex - 1
    if (prev < 0) {
      return playMode === 'loop' ? playlist.length - 1 : null
    }
    return prev
  }, [playlist, currentIndex, playMode])

  const playTrackAtIndex = useCallback((index: number) => {
    const track = playlist[index]
    if (!track) return
    
    const audio = audioRef.current
    if (!audio) return

    audio.src = track.audioUrl
    audio.play()
    setCurrentTrack(track)
    setCurrentIndex(index)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [playlist])

  const playNext = useCallback(() => {
    const nextIndex = getNextIndex()
    if (nextIndex !== null) {
      playTrackAtIndex(nextIndex)
    }
  }, [getNextIndex, playTrackAtIndex])

  const playPrevious = useCallback(() => {
    const prevIndex = getPreviousIndex()
    if (prevIndex !== null) {
      playTrackAtIndex(prevIndex)
    }
  }, [getPreviousIndex, playTrackAtIndex])

  const setPlaylist = useCallback((tracks: Track[], startIndex: number = 0) => {
    setPlaylistState(tracks)
    setCurrentIndex(startIndex)
    shuffleHistoryRef.current = []
    if (tracks[startIndex]) {
      playTrackAtIndex(startIndex)
    }
  }, [playTrackAtIndex])

  const handleSetPlayMode = useCallback((mode: PlayMode) => {
    setPlayMode(mode)
    shuffleHistoryRef.current = []
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
      playTrack, 
      togglePlay, 
      seek, 
      stop,
      playNext,
      playPrevious,
      setPlaylist,
      setPlayMode: handleSetPlayMode
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
