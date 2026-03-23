import { describe, it, expect, beforeEach } from 'vitest'

type PlayMode = 'sequence' | 'loop' | 'shuffle'

interface Track {
  id: string
  name: string
}

class PlaylistManager {
  private playlist: Track[] = []
  private currentIndex: number = -1
  private playMode: PlayMode = 'sequence'
  private shuffleHistory: number[] = []

  setPlaylist(tracks: Track[], startIndex: number = 0) {
    this.playlist = tracks
    this.currentIndex = startIndex
    this.shuffleHistory = []
  }

  setPlayMode(mode: PlayMode) {
    this.playMode = mode
    this.shuffleHistory = []
  }

  getNextIndex(): number | null {
    if (this.playlist.length === 0) return null
    if (this.currentIndex === -1) return 0

    if (this.playMode === 'sequence') {
      const next = this.currentIndex + 1
      return next < this.playlist.length ? next : null
    }

    if (this.playMode === 'loop') {
      return (this.currentIndex + 1) % this.playlist.length
    }

    if (this.playMode === 'shuffle') {
      if (!this.shuffleHistory.includes(this.currentIndex)) {
        this.shuffleHistory.push(this.currentIndex)
      }
      
      if (this.shuffleHistory.length >= this.playlist.length) {
        this.shuffleHistory = [this.currentIndex]
      }
      
      const available = Array.from({ length: this.playlist.length }, (_, i) => i)
        .filter(i => !this.shuffleHistory.includes(i))
      
      if (available.length === 0) return null
      
      const randomIndex = available[Math.floor(Math.random() * available.length)]
      return randomIndex
    }

    return null
  }

  getPreviousIndex(): number | null {
    if (this.playlist.length === 0) return null
    if (this.currentIndex === -1) return null

    if (this.playMode === 'shuffle') {
      return this.currentIndex > 0 ? this.currentIndex - 1 : null
    }

    const prev = this.currentIndex - 1
    if (prev < 0) {
      return this.playMode === 'loop' ? this.playlist.length - 1 : null
    }
    return prev
  }

  moveToIndex(index: number) {
    this.currentIndex = index
  }
}

describe('PlaylistManager', () => {
  let manager: PlaylistManager
  const tracks: Track[] = [
    { id: '1', name: 'Song 1' },
    { id: '2', name: 'Song 2' },
    { id: '3', name: 'Song 3' },
  ]

  beforeEach(() => {
    manager = new PlaylistManager()
  })

  describe('sequence mode', () => {
    it('should play next track in order', () => {
      manager.setPlaylist(tracks, 0)
      manager.setPlayMode('sequence')
      
      expect(manager.getNextIndex()).toBe(1)
      manager.moveToIndex(1)
      expect(manager.getNextIndex()).toBe(2)
      manager.moveToIndex(2)
      expect(manager.getNextIndex()).toBe(null)
    })

    it('should play previous track', () => {
      manager.setPlaylist(tracks, 2)
      manager.setPlayMode('sequence')
      
      expect(manager.getPreviousIndex()).toBe(1)
      manager.moveToIndex(1)
      expect(manager.getPreviousIndex()).toBe(0)
      manager.moveToIndex(0)
      expect(manager.getPreviousIndex()).toBe(null)
    })
  })

  describe('loop mode', () => {
    it('should loop back to first track', () => {
      manager.setPlaylist(tracks, 2)
      manager.setPlayMode('loop')
      
      expect(manager.getNextIndex()).toBe(0)
    })

    it('should loop to last track when going previous from first', () => {
      manager.setPlaylist(tracks, 0)
      manager.setPlayMode('loop')
      
      expect(manager.getPreviousIndex()).toBe(2)
    })
  })

  describe('shuffle mode', () => {
    it('should not repeat until all tracks played', () => {
      manager.setPlaylist(tracks, 0)
      manager.setPlayMode('shuffle')
      
      const played = new Set<number>()
      played.add(0)
      
      for (let i = 0; i < tracks.length - 1; i++) {
        const next = manager.getNextIndex()
        expect(next).not.toBe(null)
        expect(played.has(next!)).toBe(false)
        played.add(next!)
        manager.moveToIndex(next!)
      }
      
      expect(played.size).toBe(tracks.length)
    })
  })

  describe('edge cases', () => {
    it('should handle empty playlist', () => {
      manager.setPlaylist([], 0)
      expect(manager.getNextIndex()).toBe(null)
      expect(manager.getPreviousIndex()).toBe(null)
    })

    it('should handle single track', () => {
      manager.setPlaylist([tracks[0]], 0)
      manager.setPlayMode('sequence')
      expect(manager.getNextIndex()).toBe(null)
      
      manager.setPlayMode('loop')
      expect(manager.getNextIndex()).toBe(0)
    })
  })
})
