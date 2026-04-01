# 数据库表创建指南

## 方法 1: Supabase Dashboard（推荐）

1. 访问 https://supabase.com/dashboard/project/ojzkvhjhmrltoofrsvlv
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New query"
4. 复制 `create-user-tables.sql` 的全部内容
5. 粘贴到编辑器
6. 点击 "Run" 执行

## 方法 2: Supabase CLI

```bash
# 安装 CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref ojzkvhjhmrltoofrsvlv

# 执行 SQL
supabase db execute -f scripts/supabase/create-user-tables.sql
```

## 验证

执行后，在 Supabase Dashboard 的 "Table Editor" 中应该能看到：
- user_playlists
- playlist_tracks
- user_favorites
- play_history
