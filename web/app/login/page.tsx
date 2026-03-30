'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">登录 AiPlayMusic</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#10b981',
                  brandAccent: '#059669',
                }
              }
            }
          }}
          providers={['google']}
          magicLink={true}
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : undefined}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱',
                password_label: '密码',
                email_input_placeholder: '你的邮箱地址',
                button_label: '登录',
                loading_button_label: '登录中...',
                social_provider_text: '使用 {{provider}} 登录',
                link_text: '已有账号？登录',
              },
              magic_link: {
                email_input_label: '邮箱地址',
                email_input_placeholder: '你的邮箱地址',
                button_label: '发送魔法链接',
                loading_button_label: '发送中...',
                link_text: '通过邮箱登录',
                confirmation_text: '请检查你的邮箱以获取登录链接',
              },
            },
          }}
        />
      </div>
    </div>
  )
}
