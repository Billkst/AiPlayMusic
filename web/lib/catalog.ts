import catalogData from './music-catalog.json'

export interface Track {
  id: string
  name: string
  artist: string
  coverUrl: string
  audioUrl: string
  duration: number
  genreTags: string[]
  moodTags: string[]
  description: string
}

const catalog: Track[] = catalogData as Track[]

export function getAllTracks(): Track[] {
  return catalog
}

export function getTrackById(id: string): Track | undefined {
  return catalog.find(t => t.id === id)
}

export function getTracksByIds(ids: string[]): Track[] {
  return ids.map(id => getTrackById(id)).filter((t): t is Track => t !== undefined)
}

export function getTracksByMood(mood: string): Track[] {
  return catalog.filter(t => t.moodTags.some(tag => tag.includes(mood)))
}

export function getCatalogForPrompt(): string {
  return JSON.stringify(
    catalog.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
      genreTags: t.genreTags,
      moodTags: t.moodTags,
      description: t.description,
    })),
    null,
    2
  )
}
