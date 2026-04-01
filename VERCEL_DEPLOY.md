# 🚀 Vercel 部署步骤

代码已推送到 GitHub，现在可以部署到 Vercel。

## 快速部署

### 方式 1: 一键部署（推荐）

点击下面的按钮直接部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Billkst/AiPlayMusic&root-directory=web)

### 方式 2: 手动导入

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 输入仓库 URL: `https://github.com/Billkst/AiPlayMusic`
4. 配置：
   - Root Directory: `web`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

## 环境变量配置

在 Vercel Dashboard 添加以下环境变量（从 `web/.env.local` 复制）：

```
AI_PROVIDER
AI_MODEL
AI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
```

## 部署后操作

1. **执行数据库 SQL**
   - 访问 Supabase Dashboard
   - 执行 `scripts/supabase/create-user-tables.sql`

2. **配置 Google OAuth 回调**
   - 在 Supabase Dashboard → Authentication → Providers → Google
   - 添加回调 URL: `https://your-app.vercel.app/auth/callback`

3. **测试功能**
   - 访问部署的网站
   - 测试游客模式、登录、AI 推荐

## 访问地址

部署完成后，Vercel 会提供：
- Production: `https://aiplaymusic.vercel.app`
- Preview: 每次 PR 自动生成预览链接

详细说明见 `DEPLOYMENT.md`
