import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/prompt-builder'

describe('buildSystemPrompt', () => {
  const mockCatalog = JSON.stringify([
    { id: 'chill-001', name: 'Test Song', artist: 'Test Artist', moodTags: ['放松'] },
  ])

  it('should include catalog data in prompt', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('chill-001')
    expect(prompt).toContain('Test Song')
  })

  it('should include RECOMMENDATIONS format instruction', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('RECOMMENDATIONS:')
  })

  it('should include OPTIONS format instruction', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('OPTIONS:')
  })

  it('should include force-recommend instruction at turn 3', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 3, rejectedIds: [] })
    expect(prompt).toContain('必须')
    expect(prompt).toContain('RECOMMENDATIONS')
  })

  it('should include rejected IDs when present', () => {
    const prompt = buildSystemPrompt({
      catalogJson: mockCatalog,
      currentTurn: 0,
      rejectedIds: ['chill-001', 'fire-002'],
    })
    expect(prompt).toContain('chill-001')
    expect(prompt).toContain('fire-002')
    expect(prompt).toMatch(/排除|不要|禁止/)
  })

  it('should not include rejection section when no rejected IDs', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).not.toContain('已被用户拒绝')
  })
})
