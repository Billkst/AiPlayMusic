import { describe, it, expect } from 'vitest'
import { TurnController } from '@/lib/turn-controller'

describe('TurnController', () => {
  it('should start at turn 0', () => {
    const tc = new TurnController()
    expect(tc.currentTurn).toBe(0)
    expect(tc.shouldForceRecommend).toBe(false)
  })

  it('should increment turn on user message', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    expect(tc.currentTurn).toBe(1)
  })

  it('should force recommend at turn 3', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    tc.recordUserTurn()
    expect(tc.shouldForceRecommend).toBe(true)
  })

  it('should not force recommend before turn 3', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    expect(tc.shouldForceRecommend).toBe(false)
  })

  it('should reset to initial state', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    tc.reset()
    expect(tc.currentTurn).toBe(0)
    expect(tc.shouldForceRecommend).toBe(false)
    expect(tc.rejectedIds).toHaveLength(0)
  })

  it('should track rejected IDs', () => {
    const tc = new TurnController()
    tc.addRejectedIds(['chill-001', 'chill-002'])
    expect(tc.rejectedIds).toEqual(['chill-001', 'chill-002'])
    tc.addRejectedIds(['fire-001'])
    expect(tc.rejectedIds).toEqual(['chill-001', 'chill-002', 'fire-001'])
  })

  it('should reset turn count but keep rejected IDs on resetForNewVibe', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    tc.addRejectedIds(['chill-001'])
    tc.resetForNewVibe()
    expect(tc.currentTurn).toBe(0)
    expect(tc.rejectedIds).toEqual(['chill-001'])
  })
})
