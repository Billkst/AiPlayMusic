const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyTables() {
  const tables = ['user_playlists', 'playlist_tracks', 'user_favorites', 'play_history']
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ ${table}: 不存在或无法访问`)
      console.log(`   错误: ${error.message}`)
    } else {
      console.log(`✅ ${table}: 存在`)
    }
  }
}

verifyTables()
