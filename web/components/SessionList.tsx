'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个对话吗？')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/chat/sessions/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>还没有聊天记录</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">{session.title}</h3>
              <p className="text-sm text-gray-400">
                {new Date(session.updated_at).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/?session=${session.id}`)}
                className="px-3 py-1 text-sm text-green-400 hover:text-green-300"
              >
                继续
              </button>
              <button
                onClick={() => handleDelete(session.id)}
                disabled={deleting === session.id}
                className="px-3 py-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                {deleting === session.id ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
