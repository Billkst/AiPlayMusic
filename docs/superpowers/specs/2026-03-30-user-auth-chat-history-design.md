# 用户登录与聊天历史持久化设计

**日期**: 2026-03-30  
**状态**: 设计阶段  
**作者**: AI Assistant

## 概述

为 AiPlayMusic 项目添加用户认证和聊天历史持久化功能，使登录用户能够保存和查看历史对话记录。

### 目标

1. 实现用户登录功能（邮箱魔法链接 + Google OAuth）
2. 为登录用户持久化聊天历史到 Supabase
3. 提供用户中心页面查看和管理历史记录
4. 保持游客模式的无障碍体验

### 非目标

- 不实现密码登录（避免密码管理复杂度）
- 不自动迁移游客历史（仅提示用户选择）
- 不实现多设备实时同步（后续迭代）

## 技术选型

### 认证方案

**选择**: Supabase Auth（邮箱魔法链接 + Google OAuth）

**理由**:
- 无需密码管理，用户体验好
- Google OAuth 覆盖主流用户习惯
- Supabase 提供开箱即用的 Auth UI 组件
- 与现有 Supabase 基础设施无缝集成

### 数据存储

**选择**: Supabase Postgres

**表结构**（已存在）:
- `chat_sessions`: 会话元数据
- `chat_messages`: 消息记录
- RLS 策略已配置，确保数据安全

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      前端层                              │
├─────────────────────────────────────────────────────────┤
│  登录页面    │   主聊天界面   │   用户中心页面          │
│  /login      │   /            │   /profile              │
└──────┬───────┴────────┬───────┴────────┬────────────────┘
       │                │                │
       │                │                │
┌──────▼────────────────▼────────────────▼────────────────┐
│                   认证状态管理层                         │
│              AuthContext (React Context)                │
└──────┬───────────────────────────────────┬──────────────┘
       │                                   │
       │                                   │
┌──────▼───────────────────┐    ┌─────────▼──────────────┐
│    Supabase Auth         │    │   Chat API             │
│  - Magic Link            │    │   /api/chat            │
│  - Google OAuth          │    │   /api/chat/sessions   │
└──────────────────────────┘    └────────┬───────────────┘
                                         │
                                         │
                              ┌──────────▼───────────────┐
                              │   Supabase Postgres      │
                              │  - chat_sessions         │
                              │  - chat_messages         │
                              └──────────────────────────┘
```

### 数据流

**游客模式**:
```
用户消息 → useChat Hook → Chat API → AI 响应 → 内存存储
```

**登录用户模式**:
```
用户消息 → useChat Hook → Chat API → AI 响应 → Supabase 持久化
                                              ↓
                                        chat_sessions
                                        chat_messages
```

## 详细设计

### 1. 认证实现

#### 1.1 登录页面 (`/login`)

**UI 组件结构**:
```tsx
<div className="login-container">
  <Logo />
  <h1>登录 AiPlayMusic</h1>
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: customTheme }}
    providers={['google']}
    magicLink={true}
  />
  <PrivacyLink />
</div>
```

**功能**:
- 使用 `@supabase/auth-ui-react` 组件
- 自定义暗色主题匹配现有设计
- 登录成功后重定向到 `/`
- 错误提示：邮件发送失败、OAuth 失败等

#### 1.2 认证状态管理

**创建文件**: `web/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}
```

**实现要点**:
- 监听 `onAuthStateChange` 事件
- 自动刷新会话（Middleware 已处理）
- 全局可访问用户状态

#### 1.3 导航栏集成

**修改文件**: `web/components/Navigation.tsx`（如不存在则创建）

**显示逻辑**:
- 未登录：显示"登录"按钮 → 跳转 `/login`
- 已登录：显示用户头像 + 下拉菜单
  - 个人中心 → `/profile`
  - 登出 → 调用 `signOut()`

### 2. 聊天历史持久化

#### 2.1 数据库表结构（已存在）

**chat_sessions**:
```sql
id: uuid (主键)
owner_type: text ('anonymous' | 'user')
user_id: uuid (外键 auth.users)
title: text (会话标题)
status: text (默认 'active')
created_at: timestamptz
updated_at: timestamptz
```

**chat_messages**:
```sql
id: uuid (主键)
chat_session_id: uuid (外键 chat_sessions)
role: text ('system' | 'user' | 'assistant')
content: text
metadata_json: jsonb (可选元数据)
created_at: timestamptz
```

#### 2.2 API 端点设计

**新增 API 路由**:

1. `POST /api/chat/sessions` - 创建会话
   - 请求体: `{ title: string }`
   - 响应: `{ id: string, title: string, created_at: string }`

2. `POST /api/chat/sessions/[id]/messages` - 保存消息
   - 请求体: `{ messages: Array<{ role, content }> }`
   - 响应: `{ success: boolean }`

3. `GET /api/chat/sessions` - 获取历史列表
   - 查询参数: `?limit=20&offset=0`
   - 响应: `{ sessions: Array<Session> }`

4. `GET /api/chat/sessions/[id]` - 获取会话详情
   - 响应: `{ session: Session, messages: Array<Message> }`

5. `DELETE /api/chat/sessions/[id]` - 删除会话
   - 响应: `{ success: boolean }`

**修改现有 API**:

`POST /api/chat` - 添加参数:
- `sessionId?: string` - 可选，用于追加消息到现有会话
- 登录用户自动保存消息

#### 2.3 useChat Hook 改造

**修改文件**: `web/hooks/use-chat.ts`

**新增状态**:
```typescript
const [sessionId, setSessionId] = useState<string | null>(null)
const { user } = useAuth()
```

**保存逻辑**（在 `appendModelResponse` 中）:
```typescript
if (user && !isError) {
  if (!sessionId) {
    // 创建新会话（使用首条用户消息作为标题）
    const title = messages.find(m => m.role === 'user')?.text.slice(0, 50)
    const session = await createSession(title)
    setSessionId(session.id)
  }
  // 保存最新的用户消息和 AI 响应
  await saveMessages(sessionId, [lastUserMsg, assistantMsg])
}
```

**新增函数**:
```typescript
const loadSession = async (id: string) => {
  const { session, messages } = await fetchSession(id)
  setSessionId(id)
  setMessages(convertToUIMessages(messages))
}
```

### 3. 用户中心页面

#### 3.1 页面结构 (`/profile`)

**创建文件**: `web/app/profile/page.tsx`

**布局**:
```
┌─────────────────────────────────────────┐
│  用户信息栏                              │
│  [头像] 用户邮箱  [登出]                 │
├──────────────┬──────────────────────────┤
│  历史记录列表 │   对话详情预览            │
│              │                          │
│  会话1       │   消息1: ...             │
│  会话2       │   消息2: ...             │
│  会话3       │   ...                    │
│  ...         │                          │
└──────────────┴──────────────────────────┘
```

**功能模块**:

1. **历史记录列表**
   - 按 `updated_at` 倒序显示
   - 每项显示：标题、最后更新时间、消息数
   - 点击加载详情
   - 删除按钮（确认对话框）

2. **对话详情预览**
   - 显示完整消息历史
   - "继续对话"按钮 → 跳转主页并加载会话

3. **响应式设计**
   - 桌面：左右分栏
   - 移动：单列，点击展开详情

#### 3.2 数据获取

**使用 Server Component**:
```typescript
export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const sessions = await fetchUserSessions(user.id)
  return <ProfileContent sessions={sessions} />
}
```

### 4. 游客历史迁移

#### 4.1 迁移时机

登录成功后，检测内存中是否有未保存对话（`messages.length > 1`）。

#### 4.2 迁移 UI

**弹窗组件**: `MigrationDialog`

```
┌─────────────────────────────────────┐
│  检测到未保存的对话                  │
│                                     │
│  是否将当前对话保存到您的账户？      │
│                                     │
│  [保存并继续]  [放弃]               │
└─────────────────────────────────────┘
```

#### 4.3 迁移逻辑

**保存**:
1. 创建新会话（标题取自首条用户消息）
2. 批量插入所有消息到 `chat_messages`
3. 清空内存状态，设置 `sessionId`

**放弃**:
- 清空内存状态
- 开始新对话

### 5. 错误处理

#### 5.1 认证错误

| 错误类型 | 处理方式 |
|---------|---------|
| 邮件发送失败 | 提示"邮件发送失败，请检查邮箱地址" |
| OAuth 失败 | 提示"登录失败，请重试" |
| 会话过期 | Middleware 自动刷新，失败则跳转登录页 |
| 网络错误 | 提示"网络连接失败，请检查网络" |

#### 5.2 数据库错误

**保存失败策略**:
1. 静默重试 3 次（指数退避：1s, 2s, 4s）
2. 重试失败后提示"保存失败，但对话仍在进行"
3. 不阻塞用户继续聊天
4. 记录错误日志到 PostHog

**读取失败策略**:
- 历史列表加载失败 → 显示空状态 + 重试按钮
- 会话详情加载失败 → Toast 提示 + 返回列表

#### 5.3 边界情况

| 场景 | 处理方式 |
|------|---------|
| 用户在多个标签页登录 | Auth 状态自动同步（Supabase 处理） |
| 离线状态下发送消息 | 提示"网络连接已断开"，消息保留在输入框 |
| 会话被删除后尝试加载 | 404 提示 + 跳转到历史列表 |
| 消息内容过长 | 前端限制 10000 字符，超出截断 |

### 6. 安全与隐私

#### 6.1 Row Level Security (RLS)

**已实现策略**:
- 用户只能查看/修改自己的 `chat_sessions` 和 `chat_messages`
- Service Role 用于 API 端点操作（绕过 RLS）

#### 6.2 数据验证

**前端验证**:
- 消息长度：1-10000 字符
- 会话标题：1-100 字符

**后端验证**:
- API 端点检查用户身份
- SQL 注入防护（Supabase 参数化查询）

#### 6.3 隐私保护

- 用户可随时删除自己的历史记录
- 数据不用于模型训练（隐私政策明确声明）
- 不记录用户的 API Key

## 实现清单

### Phase 1: 认证基础 (1 天)

- [ ] 安装依赖：`@supabase/auth-ui-react`, `@supabase/auth-ui-shared`
- [ ] 创建 `AuthContext` 和 `AuthProvider`
- [ ] 创建登录页面 `/login`
- [ ] 配置 Google OAuth（Supabase Dashboard）
- [ ] 修改导航栏，添加登录/登出按钮

### Phase 2: 聊天持久化 (1-2 天)

- [ ] 创建 API 路由：
  - `POST /api/chat/sessions`
  - `POST /api/chat/sessions/[id]/messages`
  - `GET /api/chat/sessions`
  - `GET /api/chat/sessions/[id]`
  - `DELETE /api/chat/sessions/[id]`
- [ ] 修改 `useChat` Hook，添加持久化逻辑
- [ ] 修改 `POST /api/chat`，集成会话保存

### Phase 3: 用户中心 (1 天)

- [ ] 创建 `/profile` 页面
- [ ] 实现历史记录列表组件
- [ ] 实现对话详情预览组件
- [ ] 实现"继续对话"功能
- [ ] 实现删除会话功能

### Phase 4: 游客迁移 (0.5 天)

- [ ] 创建 `MigrationDialog` 组件
- [ ] 实现登录后检测逻辑
- [ ] 实现批量保存消息功能

### Phase 5: 测试与优化 (0.5 天)

- [ ] 测试登录流程（邮箱 + Google）
- [ ] 测试聊天保存和加载
- [ ] 测试游客迁移
- [ ] 测试错误处理
- [ ] 性能优化（列表分页、懒加载）

## 技术依赖

### 新增依赖

```json
{
  "@supabase/auth-ui-react": "^0.4.7",
  "@supabase/auth-ui-shared": "^0.1.8"
}
```

### 环境变量（已配置）

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Google OAuth 配置

需在 Supabase Dashboard 配置：
1. 创建 Google OAuth 应用（Google Cloud Console）
2. 获取 Client ID 和 Client Secret
3. 在 Supabase → Authentication → Providers → Google 中配置
4. 添加回调 URL：`https://your-project.supabase.co/auth/v1/callback`

## 文件清单

### 新增文件

```
web/
├── contexts/
│   └── AuthContext.tsx          # 认证状态管理
├── app/
│   ├── login/
│   │   └── page.tsx             # 登录页面
│   ├── profile/
│   │   └── page.tsx             # 用户中心
│   └── api/
│       └── chat/
│           └── sessions/
│               ├── route.ts     # 会话列表 API
│               └── [id]/
│                   ├── route.ts # 会话详情/删除 API
│                   └── messages/
│                       └── route.ts # 保存消息 API
└── components/
    ├── MigrationDialog.tsx      # 游客迁移弹窗
    └── SessionList.tsx          # 历史记录列表组件
```

### 修改文件

```
web/
├── app/
│   └── layout.tsx               # 添加 AuthProvider
├── hooks/
│   └── use-chat.ts              # 添加持久化逻辑
└── components/
    └── Navigation.tsx           # 添加登录/登出按钮
```

## 性能考虑

### 数据库查询优化

- 历史列表：分页加载（每页 20 条）
- 会话详情：按需加载，不预加载所有消息
- 索引已创建（`08-indexes.sql`）

### 前端优化

- 使用 React Server Components 减少客户端 JS
- 历史列表虚拟滚动（如果记录数 > 100）
- 消息列表懒加载（首次加载最近 50 条）

### 缓存策略

- 历史列表：SWR 缓存 5 分钟
- 会话详情：缓存直到用户刷新
- 认证状态：Supabase 自动管理

## 后续迭代

### V2 功能（未包含在本次设计）

- 多设备实时同步（WebSocket）
- 会话分享功能
- 导出对话为 Markdown
- 搜索历史记录
- 会话标签和分类
- 收藏功能

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Google OAuth 配置失败 | 用户无法使用 Google 登录 | 提供详细配置文档，邮箱登录作为备选 |
| 数据库保存失败率高 | 用户历史丢失 | 重试机制 + 错误监控 + 降级到本地存储 |
| 历史记录加载慢 | 用户体验差 | 分页加载 + 骨架屏 + 缓存 |
| 游客迁移逻辑复杂 | 用户困惑 | 清晰的 UI 提示 + 可选操作 |

## 验收标准

### 功能验收

- [ ] 用户可通过邮箱魔法链接登录
- [ ] 用户可通过 Google 账号登录
- [ ] 登录用户的对话自动保存到数据库
- [ ] 用户可在个人中心查看历史记录
- [ ] 用户可继续历史对话
- [ ] 用户可删除历史对话
- [ ] 游客登录后可选择保存当前对话
- [ ] 游客模式不受影响，可正常使用

### 性能验收

- [ ] 登录流程 < 3 秒
- [ ] 历史列表加载 < 1 秒
- [ ] 会话详情加载 < 1 秒
- [ ] 消息保存不阻塞 UI

### 安全验收

- [ ] RLS 策略生效，用户无法访问他人数据
- [ ] API 端点正确验证用户身份
- [ ] 敏感信息不记录到数据库

## 总结

本设计采用渐进式集成策略，在保持游客模式体验的同时，为登录用户提供完整的历史记录功能。通过 Supabase Auth 和 Postgres 的无缝集成，实现了最小化代码改动和最大化功能价值。

预计总工作量：2-3 天。
