# AiPlayMusic 当前功能文档

## 项目概述
基于 AI 的音乐推荐播放器，通过自然语言对话理解用户情绪并推荐音乐。

## 技术栈
- **前端**: Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **后端**: Supabase (Postgres + Auth + Storage)
- **AI**: Google Gemini (gemini-2.5-flash)
- **部署**: Vercel
- **分析**: PostHog

---

## 已实现功能

### 1. 用户认证系统
- ✅ Google OAuth 登录（已配置）
- ✅ Magic Link 邮箱登录
- ✅ 游客模式（20次免费对话额度）
- ✅ 游客配额追踪和消费

### 2. AI 音乐推荐
- ✅ 自然语言对话理解用户情绪
- ✅ 多轮引导式对话（情绪卡片 → 场景选项 → 推荐）
- ✅ 基于 30 首本地音乐库的推荐
- ✅ 每首歌附带个性化推荐理由
- ✅ "Not My Vibe" 换一批功能
- ✅ 排除已拒绝歌曲的智能推荐

### 3. 音乐播放器
- ✅ 播放/暂停
- ✅ 上一首/下一首
- ✅ 进度条拖动
- ✅ 音量控制
- ✅ 循环/随机播放模式
- ✅ 播放列表管理

### 4. 管理员后台
- ✅ 密码保护访问（默认: admin123）
- ✅ AI 配置管理（Provider/Model/API Key）
- ✅ 游客限流配置（每日额度/重置周期）
- ✅ 使用统计监控：
  - 今日访客数
  - 今日请求数
  - 游客会话统计（总会话/活跃会话/总使用次数）
  - 最近 20 个会话详情

### 5. 数据持久化
- ✅ 登录用户聊天记录自动保存到 Supabase
- ✅ 游客会话追踪（Cookie + Supabase）
- ✅ 游客配额实时更新

---

## 当前问题和限制

### 界面问题
1. **静态展示为主**：
   - 左侧边栏（音乐库/创建/歌单/艺人）无实际功能
   - 没有页面跳转和路由
   - 缺少用户个人内容管理

2. **交互体验不足**：
   - 缺少加载状态提示
   - 缺少错误提示
   - 缺少成功反馈

3. **功能缺失**：
   - 无用户个人歌单管理
   - 无收藏功能
   - 无播放历史
   - 无搜索功能

### 技术债务
1. 音乐库数据硬编码在 JSON 文件中
2. Supabase `tracks` 表为空，依赖 fallback 数据
3. 部分 UI 组件耦合度高

---

## 文件结构

### 核心页面
- `web/app/page.tsx` - 主页
- `web/app/admin/page.tsx` - 管理员后台

### 核心组件
- `web/components/AIChatPanel.tsx` - AI 聊天面板
- `web/components/MusicPlayer.tsx` - 音乐播放器
- `web/components/SongCard.tsx` - 歌曲卡片
- `web/components/MoodCard.tsx` - 情绪卡片
- `web/components/Sidebar.tsx` - 左侧边栏

### API 路由
- `web/app/api/chat/route.ts` - AI 对话
- `web/app/api/tracks/route.ts` - 获取音乐列表
- `web/app/api/catalog/route.ts` - 获取音乐目录
- `web/app/api/guest-quota/route.ts` - 游客配额查询
- `web/app/api/admin/stats/route.ts` - 管理员统计
- `web/app/api/admin/config/route.ts` - 管理员配置

### 核心逻辑
- `web/hooks/use-chat.ts` - AI 对话逻辑
- `web/lib/guest-session.ts` - 游客会话管理
- `web/lib/catalog.ts` - 音乐目录管理
- `web/lib/response-parser.ts` - AI 响应解析
- `web/lib/supabase/` - Supabase 客户端

---

## 数据库表结构

### anonymous_sessions
```sql
- id: uuid (主键)
- session_token: text (游客标识)
- guest_quota_used: integer (已使用次数)
- guest_quota_limit: integer (总额度)
- created_at: timestamp
```

### tracks (当前为空，使用 fallback)
```sql
- id: text
- name: text
- artist: text
- cover_url: text
- audio_url: text
- duration: integer
- genre_tags: text[]
- mood_tags: text[]
- description: text
- is_active: boolean
```

---

## 环境变量

### 必需配置
```env
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash
AI_API_KEY=AIzaSyD1XBcEPDuUO_wvqJmz2IRiYR4Exfi53M4

NEXT_PUBLIC_SUPABASE_URL=https://ojzkvhjhmrltoofrsvlv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

ADMIN_PASSWORD=admin123
```

---

## 下一步重构目标

### 1. 功能完善
- 实现用户个人歌单管理
- 添加收藏功能
- 添加播放历史
- 实现搜索功能

### 2. 界面重构
- 左侧边栏改为动态内容
- 添加页面路由（首页/我的音乐/歌单详情/搜索）
- 优化交互体验（加载/错误/成功状态）
- 响应式设计优化

### 3. 数据迁移
- 将 JSON 音乐数据导入 Supabase
- 实现用户数据关联
- 添加用户行为追踪
