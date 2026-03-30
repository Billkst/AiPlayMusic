# AiPlayMusic 生产化迁移实施计划

**创建时间**: 2026-03-30  
**目标**: 将 AiPlayMusic 从本地静态曲库升级为生产级应用，集成 Supabase 后端、PostHog 数据分析，并部署至 Vercel

---

## 📊 一、现状分析

### 1.1 当前架构

```
┌─────────────────────────────────────────────┐
│         Next.js 15 App Router               │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │ 前端组件      │    │ API Routes       │  │
│  │ - 播放器      │───▶│ /api/chat        │  │
│  │ - AI 对话     │    │ /api/admin/*     │  │
│  └──────────────┘    └──────────────────┘  │
│         │                     │             │
│         ▼                     ▼             │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │ catalog.ts   │    │ .admin-config.json│ │
│  │ (静态 JSON)  │    │ (本地文件)        │  │
│  └──────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.2 核心问题

根据设计规范文档分析，当前存在以下生产阻碍：

| 问题 | 影响 | 优先级 |
|------|------|--------|
| `.admin-config.json` 本地文件配置 | Vercel 无状态部署不兼容 | 🔴 高 |
| `rate-limiter.ts` 内存 Map 限流 | 多实例场景失效 | 🔴 高 |
| 浏览器直连 AI 模型能力残留 | 无法统一审计和成本控制 | 🟡 中 |
| `music-catalog.json` 静态曲库 | 无法支持动态曲库和播放能力分层 | 🔴 高 |
| 无用户体系和聊天持久化 | 无法支持游客额度和历史绑定 | 🔴 高 |
| 无错误监控 | 生产问题无法追踪 | 🟡 中 |

### 1.3 技术栈现状

- **前端**: Next.js 15 + React 19 + Tailwind CSS 4
- **AI 集成**: Google Generative AI (客户端) + 多厂商 API (服务端)
- **数据存储**: 本地 JSON 文件
- **部署**: 未配置（目标 Vercel）

---

## 🎯 二、目标架构

### 2.1 目标架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户浏览器                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Next.js Client                                     │    │
│  │  ├── PostHog (客户端追踪)                           │    │
│  │  ├── Supabase Auth (登录/注册)                      │    │
│  │  └── Supabase Realtime (实时订阅)                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Middleware   │  │ API Routes   │  │ Server Components│  │
│  │ - Auth 刷新  │  │ - AI 代理    │  │ - SSR 数据获取   │  │
│  │ - PostHog 反代│ │ - 游客额度   │  │ - Feature Flags  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │   Auth   │  │ Postgres │  │ Realtime │  │  Storage   │ │
│  │  (PKCE)  │  │  + RLS   │  │  Server  │  │  (音频)    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostHog                                 │
│  事件追踪 + Session Recording + Feature Flags               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心能力

✅ **用户体系**
- Magic Link + Google OAuth 登录
- 游客模式：10 次免费体验
- 游客历史自动绑定到登录账号

✅ **混合曲库**
- `direct_play`: 站内完整播放
- `preview_only`: 试听片段
- `external_jump`: 跳转第三方平台
- `unavailable`: 仅元数据

✅ **数据持久化**
- 聊天会话和消息存储
- 推荐事件记录
- 用户收藏和偏好

✅ **观测能力**
- PostHog 事件追踪（客户端 + 服务端）
- 错误监控和性能分析
- 用户行为漏斗分析

---

## 📋 三、实施阶段

### Phase 1: 基础设施准备（1-2 天）

**目标**: 建立 Supabase 和 PostHog 基础设施

#### 1.1 Supabase 项目初始化

```bash
# 安装依赖
cd web
npm install @supabase/supabase-js @supabase/ssr

# 安装 Supabase CLI（用于类型生成）
npm install -D supabase
```

**环境变量配置**:
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # 仅服务端使用
```

#### 1.2 数据库 Schema 创建

在 Supabase Dashboard 执行以下 SQL（分批执行）：

**表 1-3: 用户相关**
```sql
-- 1. profiles 表
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 2. anonymous_sessions 表
create table anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  device_fingerprint_hash text,
  guest_quota_used int default 0,
  guest_quota_limit int default 10,
  promoted_to_user_id uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table anonymous_sessions enable row level security;

-- 仅服务端访问
create policy "Service role only"
  on anonymous_sessions for all
  to service_role
  using (true)
  with check (true);

-- 3. admin_roles 表
create table admin_roles (
  user_id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin', 'operator')),
  granted_by uuid references auth.users,
  created_at timestamptz default now()
);

alter table admin_roles enable row level security;

create policy "Admins can view roles"
  on admin_roles for select
  to authenticated
  using (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  );
```

**表 4-6: 聊天相关**
```sql
-- 4. chat_sessions 表
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('anonymous', 'user')),
  anonymous_session_id uuid references anonymous_sessions,
  user_id uuid references auth.users,
  title text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table chat_sessions enable row level security;

create policy "Users can view own sessions"
  on chat_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service can manage all sessions"
  on chat_sessions for all
  to service_role
  using (true)
  with check (true);

-- 5. chat_messages 表
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_session_id uuid references chat_sessions on delete cascade not null,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  metadata_json jsonb,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;

create policy "Users can view messages in own sessions"
  on chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from chat_sessions
      where id = chat_session_id
      and user_id = (select auth.uid())
    )
  );

create policy "Service can manage all messages"
  on chat_messages for all
  to service_role
  using (true)
  with check (true);

-- 6. app_settings 表
create table app_settings (
  key text primary key,
  value_json jsonb not null,
  updated_by uuid references auth.users,
  updated_at timestamptz default now()
);

alter table app_settings enable row level security;

create policy "Admins can manage settings"
  on app_settings for all
  to authenticated
  using (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  );
```

**表 7-10: 曲库相关**
```sql
-- 7. tracks 表
create table tracks (
  id text primary key,
  source_type text not null check (source_type in ('self_hosted_open', 'licensed_partner', 'external_reference')),
  source_key text,
  name text not null,
  artist text not null,
  album text,
  cover_url text,
  audio_url text,
  preview_url text,
  external_url text,
  playback_mode text not null check (playback_mode in ('direct_play', 'preview_only', 'external_jump', 'unavailable')),
  license_type text check (license_type in ('CC0', 'CC_BY', 'commercial_partner', 'metadata_only', 'other')),
  attribution_text text,
  duration int,
  genre_tags text[],
  mood_tags text[],
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tracks enable row level security;

create policy "Anyone can view active tracks"
  on tracks for select
  using (is_active = true);

create policy "Admins can manage tracks"
  on tracks for all
  to authenticated
  using (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  );

-- 8. recommendation_events 表
create table recommendation_events (
  id uuid primary key default gen_random_uuid(),
  chat_session_id uuid references chat_sessions,
  user_id uuid references auth.users,
  anonymous_session_id uuid references anonymous_sessions,
  recommended_track_ids text[],
  rejection_track_ids text[],
  context_summary text,
  created_at timestamptz default now()
);

alter table recommendation_events enable row level security;

create policy "Users can view own events"
  on recommendation_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service can manage all events"
  on recommendation_events for all
  to service_role
  using (true)
  with check (true);

-- 9. favorites 表
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  track_id text references tracks not null,
  created_at timestamptz default now(),
  unique(user_id, track_id)
);

alter table favorites enable row level security;

create policy "Users can manage own favorites"
  on favorites for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 10. provider_accounts 表（预留）
create table provider_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  provider_name text not null,
  provider_user_id text not null,
  access_scope text,
  metadata_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider_name)
);

alter table provider_accounts enable row level security;

create policy "Users can view own accounts"
  on provider_accounts for select
  to authenticated
  using ((select auth.uid()) = user_id);
```

**索引优化**:
```sql
-- 性能优化索引
create index idx_chat_sessions_user_id on chat_sessions(user_id);
create index idx_chat_sessions_anonymous_id on chat_sessions(anonymous_session_id);
create index idx_chat_messages_session_id on chat_messages(chat_session_id);
create index idx_tracks_mood_tags on tracks using gin(mood_tags);
create index idx_tracks_genre_tags on tracks using gin(genre_tags);
create index idx_favorites_user_id on favorites(user_id);
create index idx_recommendation_events_user_id on recommendation_events(user_id);
```

#### 1.3 PostHog 项目初始化

```bash
# 安装依赖
npm install posthog-js posthog-node
npm install @posthog/next
```

**环境变量配置**:
```env
NEXT_PUBLIC_POSTHOG_TOKEN=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

### Phase 2: 认证系统实现（2-3 天）

**目标**: 实现 Supabase Auth + 游客模式

#### 2.1 创建 Supabase 客户端

**文件**: `web/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**文件**: `web/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

#### 2.2 Middleware 认证刷新

**文件**: `web/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { postHogMiddleware } from '@posthog/next'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  
  response.headers.set('Cache-Control', 'private, no-store')

  return postHogMiddleware(request, response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

#### 2.3 游客会话管理

**文件**: `web/lib/guest-session.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const GUEST_TOKEN_COOKIE = 'guest_session_token'

export async function getOrCreateGuestSession() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  let token = cookieStore.get(GUEST_TOKEN_COOKIE)?.value
  
  if (!token) {
    token = crypto.randomUUID()
    cookieStore.set(GUEST_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 天
    })
  }
  
  const { data: session } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .eq('session_token', token)
    .single()
  
  if (!session) {
    const { data: newSession } = await supabase
      .from('anonymous_sessions')
      .insert({ session_token: token })
      .select()
      .single()
    
    return newSession
  }
  
  return session
}

export async function checkGuestQuota() {
  const session = await getOrCreateGuestSession()
  return session.guest_quota_used < session.guest_quota_limit
}

export async function consumeGuestQuota() {
  const session = await getOrCreateGuestSession()
  const supabase = await createClient()
  
  await supabase
    .from('anonymous_sessions')
    .update({ 
      guest_quota_used: session.guest_quota_used + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.id)
}
```

---

### Phase 3: 曲库迁移（2-3 天）

**目标**: 将静态 JSON 迁移到 Supabase

#### 3.1 数据导入脚本

**文件**: `scripts/import-catalog.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
import catalogData from '../web/lib/music-catalog.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importCatalog() {
  const tracks = catalogData.map(track => ({
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
  
  const { error } = await supabase
    .from('tracks')
    .upsert(tracks)
  
  if (error) {
    console.error('导入失败:', error)
  } else {
    console.log(`成功导入 ${tracks.length} 首歌曲`)
  }
}

importCatalog()
```

**执行**:
```bash
npx tsx scripts/import-catalog.ts
```

#### 3.2 更新 catalog.ts

**文件**: `web/lib/catalog.ts`
```typescript
import { createClient } from '@/lib/supabase/server'

export interface Track {
  id: string
  name: string
  artist: string
  cover_url: string
  audio_url: string
  playback_mode: 'direct_play' | 'preview_only' | 'external_jump' | 'unavailable'
  duration: number
  genre_tags: string[]
  mood_tags: string[]
  description: string
}

export async function getAllTracks(): Promise<Track[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
  
  return data || []
}

export async function getTrackById(id: string): Promise<Track | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single()
  
  return data
}

export async function getTracksByMood(mood: string): Promise<Track[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .contains('mood_tags', [mood])
    .eq('is_active', true)
  
  return data || []
}

export async function getCatalogForPrompt(): Promise<string> {
  const tracks = await getAllTracks()
  return JSON.stringify(
    tracks.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
      genre_tags: t.genre_tags,
      mood_tags: t.mood_tags,
      description: t.description,
    })),
    null,
    2
  )
}
```

---

### Phase 4: 聊天持久化（2-3 天）

**目标**: 实现聊天会话和消息存储

#### 4.1 更新 Chat API

**文件**: `web/app/api/chat/route.ts` (部分修改)
```typescript
import { createClient } from '@/lib/supabase/server'
import { getOrCreateGuestSession, checkGuestQuota, consumeGuestQuota } from '@/lib/guest-session'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // 检查用户或游客
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // 游客模式
    const hasQuota = await checkGuestQuota()
    if (!hasQuota) {
      return NextResponse.json(
        { error: '今日体验次数已用完，请登录继续使用' },
        { status: 429 }
      )
    }
  }
  
  const { messages, sessionId } = await request.json()
  
  // 获取或创建会话
  let chatSessionId = sessionId
  if (!chatSessionId) {
    const guestSession = user ? null : await getOrCreateGuestSession()
    
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({
        owner_type: user ? 'user' : 'anonymous',
        user_id: user?.id,
        anonymous_session_id: guestSession?.id,
        title: '新对话',
      })
      .select()
      .single()
    
    chatSessionId = newSession.id
  }
  
  // 保存用户消息
  await supabase
    .from('chat_messages')
    .insert({
      chat_session_id: chatSessionId,
      role: 'user',
      content: messages[messages.length - 1].content,
    })
  
  // 调用 AI（保持原有逻辑）
  const aiResponse = await callAI(messages)
  
  // 保存 AI 回复
  await supabase
    .from('chat_messages')
    .insert({
      chat_session_id: chatSessionId,
      role: 'assistant',
      content: aiResponse.content,
    })
  
  // 消耗游客额度
  if (!user) {
    await consumeGuestQuota()
  }
  
  return NextResponse.json({ 
    content: aiResponse.content,
    sessionId: chatSessionId
  })
}
```

---

## 📝 四、后续阶段概览

### Phase 5: PostHog 集成（1-2 天）
- 客户端事件追踪
- 服务端事件追踪
- Session Recording 配置
- 隐私合规设置

### Phase 6: 管理后台重构（2-3 天）
- 迁移配置到 `app_settings` 表
- 基于角色的权限控制
- 游客额度管理界面

### Phase 7: Vercel 部署（1 天）
- 环境变量配置
- 域名和 SSL 设置
- 性能优化和监控

---

## ⚠️ 五、风险与注意事项

| 风险 | 缓解措施 |
|------|---------|
| 数据迁移失败 | 保留原 JSON 文件作为备份，分阶段切换 |
| RLS 策略错误导致数据泄漏 | 在测试环境充分验证所有策略 |
| 游客额度绕过 | 使用 service_role 操作，前端不可直写 |
| Vercel 冷启动影响性能 | 使用 Edge Functions 和适当的缓存策略 |
| PostHog 被广告拦截器屏蔽 | 配置反向代理 |

---

## 📊 六、验收标准

- [ ] 用户可通过 Magic Link 或 Google 登录
- [ ] 游客可免费体验 10 次
- [ ] 游客历史在登录后正确迁移
- [ ] 所有 AI 请求经过服务端代理
- [ ] 曲目从 Supabase 动态加载
- [ ] 聊天历史正确持久化
- [ ] PostHog 事件正常追踪
- [ ] 应用成功部署到 Vercel

---

**下一步**: 开始 Phase 1 实施
