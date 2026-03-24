import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PlayerProvider, usePlayer } from '../contexts/PlayerContext'
import type { Track } from '@/lib/catalog'
import React from 'react'

// Mock Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  src: '',
  currentTime: 0,
  duration: 100,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

const MockAudio = vi.fn().mockImplementation(function() {
  return mockAudio
})

vi.stubGlobal('Audio', MockAudio)

const mockTracks: Track[] = [
  { id: '1', name: 'Track 1', artist: 'Artist 1', coverUrl: '', audioUrl: 'url1', duration: 100, genreTags: [], moodTags: [], description: '' },
  { id: '2', name: 'Track 2', artist: 'Artist 2', coverUrl: '', audioUrl: 'url2', duration: 100, genreTags: [], moodTags: [], description: '' },
  { id: '3', name: 'Track 3', artist: 'Artist 3', coverUrl: '', audioUrl: 'url3', duration: 100, genreTags: [], moodTags: [], description: '' },
]

describe('Playlist Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAudio.src = ''
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    expect(result.current.playlist).toEqual([])
    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.playMode).toBe('sequence')
  })

  it('should set playlist and play first track', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks)
    })

    expect(result.current.playlist).toEqual(mockTracks)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentTrack?.id).toBe('1')
  })

  it('should play next track in sequence mode', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks)
    })

    act(() => {
      result.current.playNext()
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentTrack?.id).toBe('2')

    act(() => {
      result.current.playNext()
    })

    expect(result.current.currentIndex).toBe(2)
    expect(result.current.currentTrack?.id).toBe('3')

    // End of sequence
    act(() => {
      result.current.playNext()
    })
    expect(result.current.currentIndex).toBe(2) // Should stay at last track
  })

  it('should play previous track in sequence mode', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks, 1)
    })

    act(() => {
      result.current.playPrevious()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentTrack?.id).toBe('1')

    // Start of sequence
    act(() => {
      result.current.playPrevious()
    })
    expect(result.current.currentIndex).toBe(0)
  })

  it('should loop playlist in loop mode', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks, 2)
      result.current.setPlayMode('loop')
    })

    act(() => {
      result.current.playNext()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentTrack?.id).toBe('1')

    act(() => {
      result.current.playPrevious()
    })

    expect(result.current.currentIndex).toBe(2)
    expect(result.current.currentTrack?.id).toBe('3')
  })

  it('should shuffle playlist in shuffle mode', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks)
      result.current.setPlayMode('shuffle')
    })

    const firstTrackId = result.current.currentTrack?.id
    
    act(() => {
      result.current.playNext()
    })

    // In shuffle mode, next track should be one of the other tracks
    expect(result.current.currentTrack?.id).not.toBe(firstTrackId)
    expect(mockTracks.map(t => t.id)).toContain(result.current.currentTrack?.id)
  })

  it('should not repeat tracks in shuffle mode until all played', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.setPlaylist(mockTracks)
      result.current.setPlayMode('shuffle')
    })

    const playedIds = new Set([result.current.currentTrack?.id])

    for (let i = 0; i < mockTracks.length - 1; i++) {
      act(() => {
        result.current.playNext()
      })
      playedIds.add(result.current.currentTrack?.id)
    }

    expect(playedIds.size).toBe(mockTracks.length)
  })

  it('should handle empty playlist', () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: PlayerProvider,
    })

    act(() => {
      result.current.playNext()
    })

    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.currentTrack).toBeNull()
  })
})
