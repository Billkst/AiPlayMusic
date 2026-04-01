<div align="center">

# 🎵 AiPlayMusic

**基于 AI 的智能音乐推荐播放器**

通过自然语言对话理解你的情绪，推荐最适合当下心情的音乐

---

[![部署状态](https://img.shields.io/badge/部署-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-play-music.vercel.app)
[![技术栈](https://img.shields.io/badge/Next.js-15-blue?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange?style=for-the-badge&logo=google)](https://ai.google.dev)
[![数据库](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![许可证](https://img.shields.io/badge/MIT-purple?style=for-the-badge)](LICENSE)

[🚀 在线体验](https://ai-play-music.vercel.app) | [📖 完整文档](./PRD.md) | [🛠️ 部署指南](./DEPLOYMENT.md) | [📝 项目总结](./PROJECT_SUMMARY.md)

</div>

---

## ✨ 核心特性

### 🤖 AI 智能推荐
- **自然语言交互** - 用日常语言描述心情，AI 理解并推荐
- **多轮引导对话** - 情绪卡片 → 场景选项 → 精准推荐
- **智能排除机制** - "Not My Vibe" 换一批，不重复推荐
- **个性化理由** - 每首歌附带推荐原因

### 🎵 完整播放器
- 播放/暂停、上一首/下一首
- 进度条拖动、音量控制
- 循环/随机播放模式
- 播放列表管理

### 👤 用户系统
- **Google OAuth** 一键登录
- **Magic Link** 邮箱验证登录
- **游客模式** 20 次免费体验
- 个人歌单、收藏、播放历史

### 🎨 精美界面
- Spotify 风格暗色主题
- 响应式设计，适配桌面和移动端
- 流畅动画和交互体验

---

## 🚀 快速开始

### 在线体验

访问 [https://ai-play-music.vercel.app](https://ai-play-music.vercel.app)

- **游客模式**: 20 次免费对话
- **登录后**: 无限制使用 + 个人歌单管理

### 本地开发

```bash
# 克隆项目
git clone https://github.com/Billkst/AiPlayMusic.git
cd AiPlayMusic/web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS 4
- **语言**: TypeScript
- **图标**: Lucide React

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (Google OAuth + Magic Link)
- **存储**: Supabase Storage
- **AI**: Google Gemini 2.5 Flash

### 部署
- **平台**: Vercel
- **分析**: PostHog (可选)

---

## 📦 项目结构

```
AiPlayMusic/
├── web/                      # Next.js 应用
│   ├── app/                  # App Router 页面
│   │   ├── page.tsx          # 主页
│   │   ├── admin/            # 管理员后台
│   │   ├── playlists/        # 歌单详情
│   │   └── api/              # API 路由
│   ├── components/           # React 组件
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具函数
│   └── public/               # 静态资源
├── scripts/                  # 脚本工具
│   └── supabase/             # 数据库 SQL
├── design-system/            # 设计系统
├── PRD.md                    # 产品需求文档
├── DEPLOYMENT.md             # 部署指南
├── PROJECT_SUMMARY.md        # 项目总结
└── README.md                 # 项目说明
```

---

## 🔧 环境变量配置

创建 `web/.env.local` 文件：

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
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

详细配置说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🚢 部署

### Vercel 部署（推荐）

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 设置 Root Directory 为 `web`
4. 配置环境变量
5. 部署

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 数据库设置

在 Supabase Dashboard 执行：

```bash
scripts/supabase/create-user-tables.sql
```

---

## 📚 文档

- [📖 产品需求文档 (PRD.md)](./PRD.md) - 完整的产品需求和功能说明
- [🛠️ 部署指南 (DEPLOYMENT.md)](./DEPLOYMENT.md) - 详细的部署步骤
- [📝 项目总结 (PROJECT_SUMMARY.md)](./PROJECT_SUMMARY.md) - 项目开发历程和技术总结
- [🎨 设计系统](./design-system/aiplaymusic/MASTER.md) - UI/UX 设计规范

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Supabase](https://supabase.com) - 后端服务
- [Google Gemini](https://ai.google.dev) - AI 引擎
- [Vercel](https://vercel.com) - 部署平台
- [Lucide](https://lucide.dev) - 图标库

---

<div align="center">

**如果这个项目对你有帮助，请给个 Star ⭐**

Made with ❤️ by [Billkst](https://github.com/Billkst)

[⬆ 返回顶部](#-aiplaymusic)

</div>
