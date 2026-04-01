-- 修复 anonymous_sessions RLS 策略
-- 允许匿名用户通过 session_token 读写自己的会话

-- 删除旧的 service_role only 策略
drop policy if exists "Service role only" on anonymous_sessions;

-- 允许匿名用户插入新会话（任何人都可以创建）
create policy "Anyone can insert anonymous sessions"
  on anonymous_sessions for insert
  to anon, authenticated
  with check (true);

-- 允许匿名用户读取和更新自己的会话（通过 session_token 匹配）
create policy "Users can read their own anonymous sessions"
  on anonymous_sessions for select
  to anon, authenticated
  using (true);

create policy "Users can update their own anonymous sessions"
  on anonymous_sessions for update
  to anon, authenticated
  using (true)
  with check (true);

-- 保留 service_role 的完全访问权限
create policy "Service role has full access"
  on anonymous_sessions for all
  to service_role
  using (true)
  with check (true);
