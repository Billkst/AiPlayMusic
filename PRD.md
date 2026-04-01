# AiPlayMusic 产品需求文档 (PRD)

**版本**: v2.0  
**更新日期**: 2026-04-01  
**状态**: 开发中

---

## 1. 产品概述

### 1.1 产品定位
AiPlayMusic 是一款基于 AI 的智能音乐播放器，通过自然语言对话理解用户情绪和场景，提供个性化音乐推荐。

### 1.2 核心价值
- **智能推荐**：AI 理解用户情绪，推荐最适合的音乐
- **对话式交互**：自然语言描述心情，无需复杂操作
- **个性化管理**：歌单、收藏、历史记录完整管理

### 1.3 目标用户
- 希望快速找到符合当前心情音乐的用户
- 不想花时间浏览大量歌曲的用户
- 喜欢通过对话方式获取推荐的用户

---

## 2. 技术架构

### 2.1 技术栈
- **前端**: Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **后端**: Supabase (Postgres + Auth + Storage)
- **AI**: Google Gemini (gemini-2.5-flash)
- **部署**: Vercel
- **分析**: PostHog

### 2.2 设计系统
- **风格**: Spotify 风格暗色主题 + Vibrant & Block-based
- **配色**: 
  - 背景: #0F0F23
  - 主色: #1E1B4B
  - CTA: #22C55E
- **字体**: Righteous (标题) / Poppins (正文)
- **图标**: Lucide React（禁止使用 emoji）

---

## 3. 功能模块

### 3.1 用户认证系统 ✅

#### 3.1.1 登录方式
- **Google OAuth**: 一键登录
- **Magic Link**: 邮箱验证码登录
- **游客模式**: 20 次免费对话额度

#### 3.1.2 游客配额管理
- 每个游客会话 20 次对话额度
- 实时显示剩余额度
- Cookie + Supabase 双重追踪
- 配额用尽后引导注册

#### 3.1.3 数据库表
```sql
anonymous_sessions:
  - session_token (游客标识)
  - guest_quota_used (已使用)
  - guest_quota_limit (总额度)
  - created_at
```

---

### 3.2 AI 音乐推荐系统 ✅

#### 3.2.1 对话流程
1. **情绪识别**: 用户描述心情 → AI 理解情绪
2. **场景引导**: 提供情绪卡片选项（快乐/悲伤/放松等）
3. **精准推荐**: 基于情绪和场景推荐 3-5 首歌
4. **个性化理由**: 每首歌附带推荐原因

#### 3.2.2 智能特性
- **多轮对话**: 支持追问和细化需求
- **排除机制**: "Not My Vibe" 换一批，不重复推荐
- **上下文记忆**: 记住用户偏好和拒绝记录

#### 3.2.3 音乐库
- 当前: 30 首本地音乐（JSON 文件）
- 计划: 迁移到 Supabase tracks 表

---

### 3.3 音乐播放器 ✅

#### 3.3.1 基础功能
- 播放/暂停
- 上一首/下一首
- 进度条拖动
- 音量控制

#### 3.3.2 高级功能
- 循环模式（单曲/列表/随机）
- 播放列表管理
- 实时显示歌词（计划）

---

### 3.4 用户内容管理 🚧

#### 3.4.1 歌单管理 ✅
- **创建歌单**: Sidebar "创建" 按钮
- **查看歌单**: 点击跳转详情页
- **编辑歌单**: 修改名称/描述
- **删除歌单**: 确认后删除

**API 路由**:
- `GET /api/playlists` - 获取用户歌单列表
- `POST /api/playlists` - 创建新歌单
- `PATCH /api/playlists` - 更新歌单
- `DELETE /api/playlists?id=xxx` - 删除歌单

**数据库表**:
```sql
user_playlists:
  - id, user_id, name, description
  - cover_url, is_public
  - created_at, updated_at

playlist_tracks:
  - id, playlist_id, track_id
  - position, added_at
```

#### 3.4.2 收藏功能 ✅
- **收藏歌曲**: 点击爱心图标
- **查看收藏**: "我喜欢的音乐" 歌单
- **取消收藏**: 再次点击爱心

**API 路由**:
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/[id]` - 取消收藏

**数据库表**:
```sql
user_favorites:
  - id, user_id, track_id
  - created_at
  - UNIQUE(user_id, track_id)
```

#### 3.4.3 播放历史 ✅
- **自动记录**: 播放歌曲时自动保存
- **查看历史**: 最近播放 50 首
- **清除历史**: 批量删除

**API 路由**:
- `GET /api/history` - 获取播放历史
- `POST /api/history` - 记录播放

**数据库表**:
```sql
play_history:
  - id, user_id, track_id
  - played_at
```

---

### 3.5 界面布局

#### 3.5.1 左侧边栏 (Sidebar) ✅
- **音乐库标题**
- **创建按钮**: 弹窗创建歌单
- **我喜欢的音乐**: 固定显示
- **用户歌单列表**: 动态加载
- **加载状态**: 显示 "加载中..."
- **空状态**: 显示 "暂无歌单"

#### 3.5.2 主内容区
- **首页**: AI 对话 + 推荐列表
- **歌单详情页**: `/playlists/[id]`
- **搜索页**: 计划中

#### 3.5.3 底部播放器
- 固定在底部
- 显示当前播放歌曲
- 控制按钮 + 进度条

---

### 3.6 管理员后台 ✅

#### 3.6.1 访问控制
- 路径: `/admin`
- 密码保护: 默认 `admin123`

#### 3.6.2 功能模块
1. **AI 配置管理**
   - Provider (google/deepseek)
   - Model (gemini-2.5-flash)
   - API Key

2. **游客限流配置**
   - 每日额度
   - 重置周期

3. **使用统计**
   - 今日访客数
   - 今日请求数
   - 游客会话统计（总会话/活跃/总使用）
   - 最近 20 个会话详情

---

## 4. 开发进度

### 4.1 已完成 ✅
- [x] 用户认证（Google OAuth + Magic Link + 游客模式）
- [x] AI 音乐推荐（多轮对话 + 智能排除）
- [x] 音乐播放器（完整功能）
- [x] 管理员后台（配置 + 统计）
- [x] 歌单 API（CRUD）
- [x] 收藏 API（增删查）
- [x] 播放历史 API（记录查询）
- [x] Sidebar 重构（动态歌单）
- [x] 歌单详情页

### 4.2 进行中 🚧
- [ ] 数据库表创建（需手动执行 SQL）
- [ ] 歌单歌曲管理（添加/删除歌曲到歌单）
- [ ] 收藏按钮集成到播放器
- [ ] 播放历史自动记录

### 4.3 待开发 📋
- [ ] 搜索功能
- [ ] 歌词显示
- [ ] 音乐数据迁移到 Supabase
- [ ] 响应式优化
- [ ] 加载/错误/成功状态优化

---

## 5. 部署配置

### 5.1 环境变量
```env
# AI 配置
AI_PROVIDER=google
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your_google_ai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 管理员
ADMIN_PASSWORD=admin123

# PostHog (可选)
NEXT_PUBLIC_POSTHOG_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 5.2 Vercel 部署
```bash
cd web
vercel --prod
```

---

## 6. 待解决问题

### 6.1 数据库
- **问题**: user_playlists, playlist_tracks, play_history 表未创建
- **解决**: 在 Supabase Dashboard 执行 SQL（见 REFACTOR_SUMMARY.md）

### 6.2 音乐库
- **问题**: tracks 表为空，依赖 JSON fallback
- **解决**: 迁移 JSON 数据到 Supabase

### 6.3 交互体验
- **问题**: 缺少加载/错误/成功状态
- **解决**: 添加 Toast 通知和 Loading 组件

---

## 7. 文件结构

### 7.1 核心页面
```
web/app/
├── page.tsx                    # 主页
├── admin/page.tsx              # 管理员后台
├── playlists/[id]/page.tsx     # 歌单详情页
├── login/page.tsx              # 登录页
└── profile/page.tsx            # 用户资料页
```

### 7.2 API 路由
```
web/app/api/
├── chat/route.ts               # AI 对话
├── tracks/route.ts             # 音乐列表
├── catalog/route.ts            # 音乐目录
├── guest-quota/route.ts        # 游客配额
├── playlists/route.ts          # 歌单 CRUD
├── favorites/
│   ├── route.ts                # 收藏列表
│   └── [id]/route.ts           # 删除收藏
├── history/route.ts            # 播放历史
└── admin/
    ├── stats/route.ts          # 统计数据
    └── config/route.ts         # 配置管理
```

### 7.3 核心组件
```
web/components/
├── AIChatPanel.tsx             # AI 聊天面板
├── MusicPlayer.tsx             # 音乐播放器
├── Sidebar.tsx                 # 左侧边栏
├── SongCard.tsx                # 歌曲卡片
└── MoodCard.tsx                # 情绪卡片
```

### 7.4 Hooks
```
web/hooks/
├── use-chat.ts                 # AI 对话逻辑
└── use-playlists.ts            # 歌单数据
```

---

## 8. 下一步计划

### 8.1 短期目标（本周）
1. 执行数据库 SQL 创建表
2. 实现歌单歌曲管理（添加/删除）
3. 集成收藏按钮到播放器
4. 自动记录播放历史

### 8.2 中期目标（本月）
1. 搜索功能
2. 音乐数据迁移
3. 交互体验优化
4. 响应式设计完善

### 8.3 长期目标（季度）
1. 歌词显示
2. 社交分享
3. 推荐算法优化
4. 性能优化

---

## 9. 参考文档

- **功能文档**: `CURRENT_FEATURES.md`
- **重构总结**: `REFACTOR_SUMMARY.md`
- **设计系统**: `design-system/aiplaymusic/MASTER.md`
- **数据库 SQL**: `scripts/supabase/create-user-tables.sql`
