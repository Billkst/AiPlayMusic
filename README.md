# AiPlayMusic - AI 原生音乐播放器

基于大模型的智能音乐推荐系统，通过自然语言对话理解用户情绪，推荐最适合的音乐。

## ✨ 核心特性

- 🤖 **AI 对话推荐**：自然语言描述心情，AI 理解并推荐
- 🎵 **完整播放器**：上一首/下一首、循环/随机、音量控制
- 🎨 **精美 UI**：Spotify 风格暗色主题
- 🚀 **双模式支持**：体验模式（免费）+ 自定义 API Key
- 📱 **响应式设计**：适配桌面和移动端

## 🚀 快速开始

### 本地开发

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:3000

### 环境变量配置

创建 `web/.env.local`：

```env
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
AI_API_KEY=your_api_key_here
```

## 📦 部署到 Vercel

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署

```bash
cd web
vercel
```

### 4. 配置环境变量

在 Vercel Dashboard 中设置：

- `AI_PROVIDER`: deepseek
- `AI_MODEL`: deepseek-chat
- `AI_API_KEY`: 你的 API Key

### 5. 生产部署

```bash
vercel --prod
```

## 🎯 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **语言**: TypeScript
- **测试**: Vitest
- **部署**: Vercel

## 📝 License

MIT
