'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        登录
      </button>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.email?.[0].toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
            {user.email}
          </div>
          <button
            onClick={() => {
              setIsOpen(false)
              router.push('/profile')
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
          >
            个人中心
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
          >
            登出
          </button>
        </div>
      )}
    </div>
  )
}
