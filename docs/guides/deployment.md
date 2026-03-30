# 部署指南

## 前置准备

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com 创建新项目
2. 记录以下信息：
   - Project URL
   - Anon Key
   - Service Role Key

### 2. 执行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中依次执行：

```bash
scripts/supabase/01-profiles.sql
scripts/supabase/02-anonymous-sessions.sql
scripts/supabase/03-admin-roles.sql
scripts/supabase/04-chat-sessions.sql
scripts/supabase/05-chat-messages.sql
scripts/supabase/06-tracks.sql
scripts/supabase/07-misc-tables.sql
scripts/supabase/08-indexes.sql
```

### 3. 导入音乐数据

```bash
cd web
npm install -D tsx
NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx ../scripts/import-catalog.ts
```

### 4. 创建 PostHog 项目

1. 访问 https://posthog.com 创建项目
2. 记录 Project Token

## Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录

```bash
vercel login
```

### 3. 配置环境变量

在 Vercel Dashboard 设置：

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_POSTHOG_TOKEN=your_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
AI_API_KEY=your_ai_key
```

### 4. 部署

```bash
cd web
vercel --prod
```

## 验证

- [ ] 访问部署的 URL
- [ ] 测试游客模式（10 次额度）
- [ ] 测试登录功能
- [ ] 检查 PostHog 事件追踪
- [ ] 验证音乐播放功能
