export interface Recommendation {
  id: string
  reason: string
}

export interface ParsedRecommendations {
  cleanText: string
  recommendations: Recommendation[]
}

export interface ParsedOptions {
  cleanText: string
  options: string[]
}

export function parseRecommendations(text: string): ParsedRecommendations {
  const match = text.match(/RECOMMENDATIONS:\s*(\[[\s\S]*?\])/) 
  if (!match) {
    return { cleanText: text, recommendations: [] }
  }

  const cleanText = text.replace(/RECOMMENDATIONS:\s*\[[\s\S]*?\]/, '').trim()

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) {
      return { cleanText, recommendations: [] }
    }

    const recommendations = parsed.filter(
      (item: unknown): item is Recommendation =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Recommendation).id === 'string' &&
        typeof (item as Recommendation).reason === 'string'
    )

    return { cleanText, recommendations }
  } catch {
    return { cleanText, recommendations: [] }
  }
}

export function parseOptions(text: string): ParsedOptions {
  const match = text.match(/OPTIONS:\s*(\[[\s\S]*?\])/) 
  if (!match) {
    return { cleanText: text, options: [] }
  }

  const cleanText = text.replace(/OPTIONS:\s*\[[\s\S]*?\]/, '').trim()

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) {
      return { cleanText, options: [] }
    }

    return {
      cleanText,
      options: parsed.filter((item: unknown): item is string => typeof item === 'string'),
    }
  } catch {
    return { cleanText, options: [] }
  }
}
