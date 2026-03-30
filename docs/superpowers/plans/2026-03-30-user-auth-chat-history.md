# 用户登录与聊天历史持久化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 AiPlayMusic 添加用户认证（邮箱魔法链接 + Google OAuth）和聊天历史持久化功能

**Architecture:** 使用 Supabase Auth 处理认证，React Context 管理认证状态，登录用户的对话自动保存到 Supabase Postgres，游客模式保持内存存储

**Tech Stack:** Next.js 15, Supabase Auth, @supabase/auth-ui-react, TypeScript, Tailwind CSS

**Spec:** docs/superpowers/specs/2026-03-30-user-auth-chat-history-design.md

---

## 文件结构规划

### 新增文件
```
web/
├── contexts/
│   └── AuthContext.tsx          # 认证状态管理（User, loading, signOut）
├── app/
│   ├── login/
│   │   └── page.tsx             # 登录页面（Auth UI 组件）
│   ├── profile/
│   │   └── page.tsx             # 用户中心（Server Component）
│   └── api/
│       └── chat/
│           └── sessions/
│               ├── route.ts     # GET 会话列表, POST 创建会话
│               └── [id]/
│                   ├── route.ts # GET 会话详情, DELETE 删除会话
│                   └── messages/
│                       └── route.ts # POST 保存消息
└── components/
    ├── UserMenu.tsx             # 用户菜单（头像+下拉）
    ├── MigrationDialog.tsx      # 游客迁移弹窗
    └── SessionList.tsx          # 历史记录列表
```

### 修改文件
```
web/
├── app/layout.tsx               # 包裹 AuthProvider
├── hooks/use-chat.ts            # 添加 sessionId 状态和持久化逻辑
├── app/api/chat/route.ts        # 添加 sessionId 参数支持
└── package.json                 # 添加 auth-ui 依赖
```

---

## Phase 1: 依赖安装与认证基础

### Task 1: 安装依赖

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: 安装 Supabase Auth UI 依赖**

```bash
cd web
npm install @supabase/auth-ui-react@^0.4.7 @supabase/auth-ui-shared@^0.1.8
```

Expected: 依赖成功安装，package.json 更新

- [ ] **Step 2: 验证安装**

```bash
npm list @supabase/auth-ui-react @supabase/auth-ui-shared
```

Expected: 显示已安装的版本号

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Supabase Auth UI dependencies"
```

---

### Task 2: 创建 AuthContext

**Files:**
- Create: `web/contexts/AuthContext.tsx`

- [ ] **Step 1: 创建 AuthContext 文件**

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

- [ ] **Step 2: 验证文件创建**

```bash
cat web/contexts/AuthContext.tsx | head -20
```

Expected: 显示文件内容前 20 行

- [ ] **Step 3: Commit**

```bash
git add web/contexts/AuthContext.tsx
git commit -m "feat: add AuthContext for authentication state management"
```

---

### Task 3: 集成 AuthProvider 到 Layout

**Files:**
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: 导入 AuthProvider**

在 `web/app/layout.tsx` 顶部添加导入：

```typescript
import { AuthProvider } from '@/contexts/AuthContext'
```

- [ ] **Step 2: 包裹 children**

在 `<body>` 标签内，用 `<AuthProvider>` 包裹现有内容：

```typescript
<body className={inter.className}>
  <AuthProvider>
    <PostHogProvider>
      <PostHogPageview />
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </PostHogProvider>
  </AuthProvider>
</body>
```

- [ ] **Step 3: 验证修改**

```bash
grep -A 5 "AuthProvider" web/app/layout.tsx
```

Expected: 显示 AuthProvider 包裹结构

- [ ] **Step 4: Commit**

```bash
git add web/app/layout.tsx
git commit -m "feat: integrate AuthProvider into root layout"
```

---

### Task 4: 创建登录页面

**Files:**
- Create: `web/app/login/page.tsx`

- [ ] **Step 1: 创建登录页面文件**

```typescript
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
          redirectTo={`${window.location.origin}/`}
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
```

- [ ] **Step 2: 验证文件创建**

```bash
ls -lh web/app/login/page.tsx
```

Expected: 文件存在

- [ ] **Step 3: Commit**

```bash
git add web/app/login/page.tsx
git commit -m "feat: add login page with Supabase Auth UI"
```

---

### Task 5: 创建用户菜单组件

**Files:**
- Create: `web/components/UserMenu.tsx`

- [ ] **Step 1: 创建 UserMenu 组件**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/UserMenu.tsx
git commit -m "feat: add UserMenu component with login/logout"
```

---

## Phase 2: 聊天历史持久化

### Task 6: 创建会话管理 API - 列表和创建

**Files:**
- Create: `web/app/api/chat/sessions/route.ts`

- [ ] **Step 1: 创建会话 API 路由**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { title } = await request.json()

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({
      owner_type: 'user',
      user_id: user.id,
      title: title || '新对话',
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(session)
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/chat/sessions/route.ts
git commit -m "feat: add chat sessions API for list and create"
```

---

### Task 7: 创建会话详情和删除 API

**Files:**
- Create: `web/app/api/chat/sessions/[id]/route.ts`

- [ ] **Step 1: 创建会话详情 API**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (sessionError) {
    return NextResponse.json({ error: '会话不存在' }, { status: 404 })
  }

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_session_id', id)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 })
  }

  return NextResponse.json({ session, messages })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/chat/sessions/[id]/route.ts
git commit -m "feat: add session detail and delete API"
```

---

### Task 8: 创建保存消息 API

**Files:**
- Create: `web/app/api/chat/sessions/[id]/messages/route.ts`

- [ ] **Step 1: 创建保存消息 API**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { messages } = await request.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: '无效的消息数据' }, { status: 400 })
  }

  const messagesToInsert = messages.map(msg => ({
    chat_session_id: id,
    role: msg.role,
    content: msg.content,
  }))

  const { error } = await supabase
    .from('chat_messages')
    .insert(messagesToInsert)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/chat/sessions/[id]/messages/route.ts
git commit -m "feat: add save messages API"
```

---

### Task 9: 修改 useChat Hook 添加持久化

**Files:**
- Modify: `web/hooks/use-chat.ts`

- [ ] **Step 1: 添加导入和状态**

在文件顶部添加：

```typescript
import { useAuth } from '@/contexts/AuthContext'
```

在 `useChat` 函数内添加状态：

```typescript
const [sessionId, setSessionId] = useState<string | null>(null)
const { user } = useAuth()
```

- [ ] **Step 2: 添加会话管理函数**

在 `useChat` 函数内添加：

```typescript
const createSession = async (title: string) => {
  const response = await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return response.json()
}

const saveMessages = async (sessionId: string, messages: Array<{ role: string; content: string }>) => {
  await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}
```

- [ ] **Step 3: 修改 appendModelResponse 添加持久化逻辑**

在 `appendModelResponse` 函数末尾，`setMessages(nextMessages)` 之前添加：

```typescript
if (user && !isError && content) {
  try {
    if (!sessionId) {
      const firstUserMsg = baseMessages.find(m => m.role === 'user')?.text || '新对话'
      const session = await createSession(firstUserMsg.slice(0, 50))
      setSessionId(session.id)
      
      const allMessages = nextMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      }))
      await saveMessages(session.id, allMessages)
    } else {
      const lastUserMsg = baseMessages[baseMessages.length - 1]
      await saveMessages(sessionId, [
        { role: 'user', content: lastUserMsg.text },
        { role: 'assistant', content: text },
      ])
    }
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add web/hooks/use-chat.ts
git commit -m "feat: add chat history persistence to useChat hook"
```

---

## Phase 3: 用户中心页面

### Task 10: 创建用户中心页面

**Files:**
- Create: `web/app/profile/page.tsx`

- [ ] **Step 1: 创建用户中心页面**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionList } from '@/components/SessionList'

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <SessionList sessions={sessions || []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/profile/page.tsx
git commit -m "feat: add profile page with session list"
```

---

### Task 11: 创建 SessionList 组件

**Files:**
- Create: `web/components/SessionList.tsx`

- [ ] **Step 1: 创建 SessionList 组件**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/SessionList.tsx
git commit -m "feat: add SessionList component"
```

---

### Task 12: 添加 UserMenu 到主页

**Files:**
- Modify: `web/app/page.tsx`

- [ ] **Step 1: 导入 UserMenu**

在 `web/app/page.tsx` 顶部添加：

```typescript
import { UserMenu } from '@/components/UserMenu'
```

- [ ] **Step 2: 添加到页面布局**

在页面顶部添加用户菜单（具体位置根据现有布局调整）：

```typescript
<div className="absolute top-4 right-4 z-10">
  <UserMenu />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add web/app/page.tsx
git commit -m "feat: add UserMenu to main page"
```

---

## Phase 4: 测试与验证

### Task 13: 端到端测试

**Files:**
- None (manual testing)

- [ ] **Step 1: 测试登录流程**

1. 访问 http://localhost:3000/login
2. 测试邮箱魔法链接登录
3. 测试 Google OAuth 登录（需先配置）
4. 验证登录后跳转到首页

Expected: 登录成功，右上角显示用户头像

- [ ] **Step 2: 测试聊天持久化**

1. 登录后发送消息
2. 刷新页面
3. 访问 /profile 查看历史记录

Expected: 对话已保存，历史列表显示

- [ ] **Step 3: 测试会话管理**

1. 在 /profile 点击"继续"按钮
2. 验证对话加载
3. 点击"删除"按钮
4. 验证会话被删除

Expected: 所有操作正常

- [ ] **Step 4: 测试游客模式**

1. 登出
2. 发送消息
3. 验证游客模式仍可正常使用

Expected: 游客模式不受影响

---

## 验收清单

### 功能验收

- [ ] 用户可通过邮箱魔法链接登录
- [ ] 用户可通过 Google 账号登录
- [ ] 登录用户的对话自动保存到数据库
- [ ] 用户可在个人中心查看历史记录
- [ ] 用户可继续历史对话
- [ ] 用户可删除历史对话
- [ ] 游客模式不受影响，可正常使用

### 技术验收

- [ ] TypeScript 编译无错误
- [ ] 所有 API 端点正确验证用户身份
- [ ] RLS 策略生效，用户无法访问他人数据
- [ ] 错误处理完善，不阻塞用户操作

---

## 注意事项

1. **Google OAuth 配置**: 需要在 Supabase Dashboard 配置 Google OAuth，否则 Google 登录按钮不可用
2. **数据库迁移**: 确保已执行 `scripts/supabase/*.sql` 中的所有迁移脚本
3. **环境变量**: 确保 `.env.local` 包含所有必需的 Supabase 环境变量
4. **错误处理**: 所有 API 调用都应有 try-catch 包裹，避免崩溃

---

## 后续优化（可选）

- [ ] 添加游客迁移弹窗（MigrationDialog）
- [ ] 添加会话加载功能（从 URL 参数 `?session=xxx` 加载）
- [ ] 优化历史列表分页加载
- [ ] 添加搜索历史记录功能
- [ ] 添加会话重命名功能
