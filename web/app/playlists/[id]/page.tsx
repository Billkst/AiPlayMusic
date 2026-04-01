'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, MoreHorizontal } from 'lucide-react'

interface Playlist {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function PlaylistPage() {
  const params = useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPlaylist()
  }, [params.id])

  async function loadPlaylist() {
    const { data } = await supabase
      .from('user_playlists')
      .select('*')
      .eq('id', params.id)
      .single()

    setPlaylist(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">加载中...</div>
  }

  if (!playlist) {
    return <div className="flex items-center justify-center h-full text-white">歌单不存在</div>
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-[#1e1b4b] to-[#121212] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-end gap-6 mb-6">
          <div className="w-56 h-56 bg-[#282828] rounded-md flex items-center justify-center">
            <Play className="w-20 h-20 text-[#b3b3b3]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-2">歌单</p>
            <h1 className="text-6xl font-bold text-white mb-6">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-[#b3b3b3] mb-2">{playlist.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button className="w-14 h-14 rounded-full bg-[#1db954] hover:scale-105 transition flex items-center justify-center">
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          </button>
          <button className="p-2 hover:bg-[#ffffff1a] rounded-full transition">
            <MoreHorizontal className="w-8 h-8 text-[#b3b3b3]" />
          </button>
        </div>

        <div className="text-center text-[#b3b3b3] py-12">
          暂无歌曲
        </div>
      </div>
    </div>
  )
}
