'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Playlist {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  created_at: string
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPlaylists()
  }, [])

  async function loadPlaylists() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('user_playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setPlaylists(data || [])
    setLoading(false)
  }

  return { playlists, loading, refresh: loadPlaylists }
}
