import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importCatalog() {
  const catalogPath = join(process.cwd(), 'web/lib/music-catalog.json')
  const catalogData = JSON.parse(readFileSync(catalogPath, 'utf-8'))
  
  const tracks = catalogData.map((track: any) => ({
    id: track.id,
    source_type: 'self_hosted_open',
    name: track.name,
    artist: track.artist,
    cover_url: track.coverUrl,
    audio_url: track.audioUrl,
    playback_mode: 'direct_play',
    license_type: 'CC0',
    duration: track.duration,
    genre_tags: track.genreTags,
    mood_tags: track.moodTags,
    description: track.description,
    is_active: true,
  }))
  
  const { error } = await supabase.from('tracks').upsert(tracks)
  
  if (error) {
    console.error('导入失败:', error)
    process.exit(1)
  }
  
  console.log(`✅ 成功导入 ${tracks.length} 首歌曲`)
}

importCatalog()
