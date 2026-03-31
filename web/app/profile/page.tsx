import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionList } from '@/components/SessionList'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-block mb-4 text-gray-400 hover:text-white transition-colors">
          ← 返回首页
        </Link>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <SessionList sessions={sessions || []} />
      </div>
    </div>
  )
}
