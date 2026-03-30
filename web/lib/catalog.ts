import catalogData from './music-catalog.json'

export interface Track {
  id: string
  name: string
  artist: string
  cover_url: string
  audio_url: string
  duration: number
  genre_tags: string[]
  mood_tags: string[]
  description: string
}

const fallbackCatalog: Track[] = catalogData.map((t: any) => ({
  id: t.id,
  name: t.name,
  artist: t.artist,
  cover_url: t.coverUrl,
  audio_url: t.audioUrl,
  duration: t.duration,
  genre_tags: t.genreTags,
  mood_tags: t.moodTags,
  description: t.description,
}))

export async function getAllTracks(): Promise<Track[]> {
  try {
    const response = await fetch('/api/tracks')
    if (!response.ok) return fallbackCatalog
    return await response.json()
  } catch {
    return fallbackCatalog
  }
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  try {
    const response = await fetch(`/api/tracks/${id}`)
    if (!response.ok) return fallbackCatalog.find(t => t.id === id)
    return await response.json()
  } catch {
    return fallbackCatalog.find(t => t.id === id)
  }
}

export async function getTracksByIds(ids: string[]): Promise<Track[]> {
  const tracks = await getAllTracks()
  return tracks.filter(t => ids.includes(t.id))
}

export async function getCatalogForPrompt(): Promise<string> {
  try {
    const response = await fetch('/api/catalog')
    if (!response.ok) throw new Error('Failed to fetch')
    const tracks = await response.json()
    return JSON.stringify(tracks, null, 2)
  } catch {
    return JSON.stringify(
      fallbackCatalog.map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        genre_tags: t.genre_tags,
        mood_tags: t.mood_tags,
        description: t.description,
      })),
      null,
      2
    )
  }
}
