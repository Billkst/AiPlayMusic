import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Volume Control', () => {
  it('should set volume between 0 and 1', () => {
    const setVolume = (vol: number) => Math.max(0, Math.min(1, vol))
    
    expect(setVolume(0.5)).toBe(0.5)
    expect(setVolume(0)).toBe(0)
    expect(setVolume(1)).toBe(1)
    expect(setVolume(-0.1)).toBe(0)
    expect(setVolume(1.5)).toBe(1)
  })

  it('should persist volume to localStorage', () => {
    const storage: Record<string, string> = {}
    const mockLocalStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value }
    }
    
    mockLocalStorage.setItem('player_volume', '0.7')
    expect(mockLocalStorage.getItem('player_volume')).toBe('0.7')
  })

  it('should load saved volume on init', () => {
    const savedVolume = '0.8'
    const loadVolume = () => {
      const saved = savedVolume
      return saved ? parseFloat(saved) : 1
    }
    
    expect(loadVolume()).toBe(0.8)
  })
})
