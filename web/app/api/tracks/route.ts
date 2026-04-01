import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import catalogData from '@/lib/music-catalog.json'

const fallbackCatalog = catalogData.map((t: any) => ({
  id: t.id,
  name: t.name,
  artist: t.artist,
  cover_url: t.coverUrl,
  audio_url: t.audioUrl,
  duration: t.duration,
  genre_tags: t.genreTags,
  mood_tags: t.moodTags,
  description: t.description,
  is_active: true,
}))

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
  
  if (!data || data.length === 0) {
    return NextResponse.json(fallbackCatalog)
  }
  
  return NextResponse.json(data)
}
