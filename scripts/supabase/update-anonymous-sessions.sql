-- 添加 guest_quota 列
alter table anonymous_sessions 
add column if not exists guest_quota_used integer default 0,
add column if not exists guest_quota_limit integer default 20;
