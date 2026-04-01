# AiPlayMusic 部署指南

## 方法 1: Vercel Dashboard 部署（推荐）

### 步骤 1: 推送代码到 GitHub
```bash
cd /home/liujunxi/project/AiPlayMusic
git add .
git commit -m "准备部署"
git push origin main
```

### 步骤 2: 导入到 Vercel
1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 选择 `Billkst/AiPlayMusic` 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 步骤 3: 配置环境变量
在 Vercel Dashboard 添加以下环境变量：

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

### 步骤 4: 部署
点击 "Deploy" 按钮，等待构建完成。

---

## 方法 2: Vercel CLI 部署

### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤 2: 登录
```bash
vercel login
```

### 步骤 3: 部署
```bash
cd /home/liujunxi/project/AiPlayMusic
vercel --prod
```

按提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- Project name? **aiplaymusic**
- In which directory is your code located? **web**

### 步骤 4: 配置环境变量
```bash
vercel env add AI_PROVIDER
vercel env add AI_MODEL
vercel env add AI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD
```

---

## 部署前检查清单

### 必须完成
- [x] 代码已提交到 GitHub
- [x] `.env.local` 文件已配置
- [x] `vercel.json` 配置正确
- [ ] 数据库表已创建（见 REFACTOR_SUMMARY.md）

### 可选优化
- [ ] 构建测试通过
- [ ] TypeScript 无错误
- [ ] 环境变量已备份

---

## 部署后验证

### 1. 访问网站
打开 Vercel 提供的域名（如 `aiplaymusic.vercel.app`）

### 2. 测试功能
- [ ] 游客模式可用
- [ ] Google 登录可用
- [ ] AI 推荐正常
- [ ] 音乐播放正常
- [ ] 管理员后台可访问

### 3. 检查日志
在 Vercel Dashboard 查看：
- Build Logs（构建日志）
- Function Logs（运行日志）
- Error Logs（错误日志）

---

## 常见问题

### Q1: 构建失败
**原因**: TypeScript 错误或依赖问题
**解决**: 
```bash
cd web
npm run build
```
本地构建成功后再部署。

### Q2: 环境变量未生效
**原因**: 环境变量未添加或拼写错误
**解决**: 在 Vercel Dashboard → Settings → Environment Variables 检查

### Q3: Supabase 连接失败
**原因**: RLS 策略或环境变量错误
**解决**: 
1. 检查 Supabase URL 和 Key
2. 确认数据库表已创建
3. 检查 RLS 策略

### Q4: Google OAuth 失败
**原因**: 回调 URL 未配置
**解决**: 在 Supabase Dashboard → Authentication → Providers → Google
添加 Vercel 域名到 Authorized redirect URIs：
```
https://your-app.vercel.app/auth/callback
```

---

## 自定义域名（可选）

### 步骤 1: 添加域名
在 Vercel Dashboard → Settings → Domains 添加你的域名

### 步骤 2: 配置 DNS
在域名提供商添加 CNAME 记录：
```
CNAME  @  cname.vercel-dns.com
```

### 步骤 3: 等待生效
通常 5-10 分钟生效

---

## 监控和分析

### Vercel Analytics
自动启用，查看：
- 访问量
- 性能指标
- 错误率

### PostHog（可选）
配置 `NEXT_PUBLIC_POSTHOG_TOKEN` 后自动启用用户行为分析

---

## 回滚部署

如果新版本有问题：
1. 访问 Vercel Dashboard → Deployments
2. 找到上一个稳定版本
3. 点击 "Promote to Production"

---

## 下一步

部署成功后：
1. 在 Supabase Dashboard 执行数据库 SQL（见 REFACTOR_SUMMARY.md）
2. 测试所有功能
3. 配置自定义域名（可选）
4. 启用 PostHog 分析（可选）
