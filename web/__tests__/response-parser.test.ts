import { describe, it, expect } from 'vitest'
import { parseRecommendations, parseOptions } from '@/lib/response-parser'

describe('parseRecommendations', () => {
  it('should extract valid recommendations from AI response', () => {
    const text = `很高兴为你推荐！
RECOMMENDATIONS: [{"id": "chill-001", "reason": "适合放松"}, {"id": "chill-002", "reason": "微醺氛围"}]`
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(2)
    expect(result.recommendations[0].id).toBe('chill-001')
    expect(result.recommendations[0].reason).toBe('适合放松')
    expect(result.cleanText).not.toContain('RECOMMENDATIONS')
  })

  it('should return empty array when no RECOMMENDATIONS block', () => {
    const text = '让我再了解一下你的喜好'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
    expect(result.cleanText).toBe(text)
  })

  it('should handle malformed JSON gracefully', () => {
    const text = 'RECOMMENDATIONS: [{"id": broken}]'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
  })

  it('should handle empty array', () => {
    const text = 'RECOMMENDATIONS: []'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
  })

  it('should filter out items missing id or reason', () => {
    const text = 'RECOMMENDATIONS: [{"id": "chill-001"}, {"reason": "nice"}, {"id": "chill-002", "reason": "good"}]'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0].id).toBe('chill-002')
  })
})

describe('parseOptions', () => {
  it('should extract OPTIONS from AI response', () => {
    const text = `你好！今天想听什么？
OPTIONS: ["专注工作", "放松休息", "运动健身"]`
    const result = parseOptions(text)
    expect(result.options).toEqual(['专注工作', '放松休息', '运动健身'])
    expect(result.cleanText).not.toContain('OPTIONS')
  })

  it('should return empty array when no OPTIONS block', () => {
    const text = '好的，让我来推荐'
    const result = parseOptions(text)
    expect(result.options).toHaveLength(0)
  })
})
