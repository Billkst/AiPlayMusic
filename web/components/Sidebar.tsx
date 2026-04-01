'use client'

import { Plus, ArrowRight, List, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlaylists } from "@/hooks/use-playlists";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
  const { playlists, loading, refresh } = usePlaylists()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  async function handleCreatePlaylist() {
    if (!playlistName.trim() || creating) return
    
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('请先登录')
      setCreating(false)
      return
    }

    const { error } = await supabase
      .from('user_playlists')
      .insert({ user_id: user.id, name: playlistName.trim() })

    if (error) {
      alert('创建失败：' + error.message)
    } else {
      setPlaylistName('')
      setShowCreateDialog(false)
      refresh()
    }
    setCreating(false)
  }

  return (
    <div className="w-[350px] lg:w-[420px] flex flex-col gap-2 h-full">
      {/* Library */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between text-[#b3b3b3]">
          <button className="flex items-center font-bold transition hover:text-white text-white group">
            <span className="text-[16px] font-bold">音乐库</span>
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCreateDialog(true)}
              className="px-3.5 py-1.5 bg-[#242424] hover:bg-[#2a2a2a] rounded-full transition text-white flex items-center gap-1.5 text-[14px] font-bold"
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
              创建
            </button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-full transition hover:text-white text-[#b3b3b3]">
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-2 flex gap-2">
          <button className="bg-[#2a2a2a] hover:bg-[#333] text-white text-sm px-3 py-1.5 rounded-full transition">
            歌单
          </button>
          <button className="bg-[#2a2a2a] hover:bg-[#333] text-white text-sm px-3 py-1.5 rounded-full transition">
            艺人
          </button>
        </div>

        {/* Library List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="flex items-center justify-between px-2 py-2 text-sm text-[#b3b3b3]">
            <button className="hover:text-white hover:bg-[#1a1a1a] rounded-full transition p-1.5">
              <Search className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 hover:text-white transition p-1 hover:scale-105">
              <span>最近播放</span>
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            {/* Liked Songs */}
            <button className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition group text-left">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-600 to-blue-300 flex items-center justify-center flex-shrink-0">
                <HeartIcon className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-medium truncate">我喜欢的音乐</span>
                <span className="text-sm text-[#b3b3b3] truncate flex items-center gap-1">
                  <span className="text-[#1db954]"><PinIcon className="w-3 h-3 fill-current" /></span>
                  歌单
                </span>
              </div>
            </button>

            {/* User Playlists */}
            {loading ? (
              <div className="text-center text-[#b3b3b3] py-4">加载中...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center text-[#b3b3b3] py-4 text-sm">暂无歌单</div>
            ) : (
              playlists.map((playlist) => (
                <Link key={playlist.id} href={`/playlists/${playlist.id}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition group text-left">
                  <div className="w-12 h-12 rounded-md bg-[#282828] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {playlist.cover_url ? (
                      <Image src={playlist.cover_url} alt={playlist.name} fill className="object-cover" />
                    ) : (
                      <List className="w-6 h-6 text-[#b3b3b3]" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium truncate">{playlist.name}</span>
                    <span className="text-sm text-[#b3b3b3] truncate">歌单</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-[#282828] rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white text-xl font-bold mb-4">创建歌单</h2>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="歌单名称"
              className="w-full bg-[#3e3e3e] text-white px-4 py-2 rounded-md mb-4 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-white hover:bg-[#3e3e3e] rounded-md transition"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={creating || !playlistName.trim()}
                className="px-4 py-2 bg-[#1db954] text-white rounded-md hover:bg-[#1ed760] transition disabled:opacity-50"
              >
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function HeartIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function PinIcon(props: any) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337L8.822.797z" />
    </svg>
  );
}
