# 混合曲库生产化升级设计文档 (Hybrid Catalog Production Upgrade Design Spec)

## 1. 目标 (Goals)

将当前基于本地静态曲库的 `AiPlayMusic` 升级为可上线的 `Next.js + Vercel + Supabase + Sentry` 产品化架构，并满足以下业务目标：

- 支持 `Magic Link + Google 登录`。
- 支持游客体验，单设备/匿名会话可免费体验 `10` 次。
- 游客聊天记录临时保存，登录后自动绑定到用户账号。
- 保留现有本地精选曲库，但不再将其作为唯一曲库来源。
- 建立“混合曲库”模式：
  - `站内可播` 依赖自有或开放授权音源。
  - `大曲库发现` 依赖正规可接入的外部目录源。
  - 对不可合法站内播放的内容，提供元数据展示与外部跳转能力。
- 用 `Sentry` 建立前后端错误监控和关键链路观测。

## 2. 非目标 (Non-Goals)

本阶段**不**追求以下能力：

- 不把网易云音乐或其他消费级平台的逆向 API 作为生产主链路。
- 不以“全量第三方曲库站内完整播放”作为首发前提。
- 不引入微服务拆分；继续维持 `Next.js` 单体应用演进路线。
- 不在第一阶段引入 `Clerk`、`Upstash`、`Pinecone`、`PostHog`。
- 不做复杂版权管理后台，不做企业级商务授权系统。

## 3. 当前问题 (Current Gaps)

当前仓库存在以下生产阻碍：

- `web/app/api/admin/config/route.ts` 通过本地文件 `.admin-config.json` 保存配置，不适合 `Vercel` 的无状态部署模型。
- `web/lib/rate-limiter.ts` 使用内存 `Map` 做限流，多实例和冷启动场景下不可靠。
- `web/lib/chat-engine.ts` 仍保留浏览器直连模型能力，无法统一审计、限流、成本控制和故障监控。
- `web/lib/catalog.ts` 与 `web/lib/music-catalog.json` 假设所有歌曲都已经具备静态 `audioUrl`，无法表达第三方曲目、预览地址、外链跳转等多种播放能力。
- `web/contexts/PlayerContext.tsx` 直接将 `track.audioUrl` 赋给 `audio.src`，播放器能力与当前静态曲库模型高度耦合。
- 当前无正式用户体系、无聊天持久化、无推荐事件沉淀、无统一错误监控。

## 4. 方案概览 (Recommended Approach)

采用“`生产单体 + 混合曲库`”方案：

### 4.1 应用层

- 保留 `Next.js App Router` 作为唯一 Web 应用和 API 层。
- 部署平台使用 `Vercel`。
- 所有 AI 调用统一经由服务端代理完成，不再允许浏览器直连模型服务。

### 4.2 数据与认证层

- 使用 `Supabase` 作为唯一后端底座：
  - `Postgres`：业务数据持久化。
  - `Auth`：`Magic Link + Google 登录`。
  - `Storage`：开放授权音源、封面、导入素材等静态资产。

### 4.3 观测层

- 使用 `Sentry`：
  - 前端运行时错误。
  - API 路由错误。
  - 关键链路性能与异常上下文。

### 4.4 曲库层

将曲库拆分为三类来源：

- `self_hosted_open`：自托管开放授权曲目（CC0 / CC BY）。
- `licensed_partner`：通过正规 API 或商业合作接入的目录源。
- `external_reference`：只能展示元数据、预览或跳转的平台来源。

### 4.5 播放能力分层

每首曲目必须显式声明播放能力：

- `direct_play`：可站内完整播放。
- `preview_only`：仅可播放片段或试听。
- `external_jump`：仅可跳转第三方平台。
- `unavailable`：仅保留元数据，用于推荐或收藏展示。

## 5. 用户体验设计 (User Experience)

### 5.1 游客体验

- 未登录用户进入首页即可打开 AI 音乐助手。
- 游客拥有 `10` 次免费体验额度。
- 系统为游客生成匿名会话标识并保存临时聊天记录。
- 当游客：
  - 额度耗尽，或
  - 尝试保存历史、收藏歌曲、同步偏好
  时，引导登录。

### 5.2 登录用户体验

- 支持 `Magic Link` 登录。
- 支持 `Google OAuth` 登录。
- 登录后自动将匿名会话数据迁移到用户账号下。
- 用户可查看历史对话、收藏歌曲、最近推荐、外部账号绑定状态。

### 5.3 曲目播放体验

- 对 `direct_play` 曲目：站内播放器完整播放。
- 对 `preview_only` 曲目：站内只播试听片段，并在 UI 中标注“试听”。
- 对 `external_jump` 曲目：提供“打开来源平台”动作，不尝试伪装成可站内播放。
- AI 推荐结果必须在展示层清楚区分“可播”“试听”“跳转”。

## 6. 数据模型设计 (Data Model)

以下为第一阶段核心数据表：

### 6.1 `profiles`

- `id`：对应 `Supabase Auth` 用户 ID。
- `display_name`
- `avatar_url`
- `created_at`
- `last_seen_at`

### 6.2 `anonymous_sessions`

- `id`
- `session_token`
- `device_fingerprint_hash`
- `guest_quota_used`
- `guest_quota_limit`（默认 10）
- `promoted_to_user_id`（登录后回填）
- `created_at`
- `updated_at`

### 6.3 `chat_sessions`

- `id`
- `owner_type`：`anonymous | user`
- `anonymous_session_id`
- `user_id`
- `title`
- `status`
- `created_at`
- `updated_at`

### 6.4 `chat_messages`

- `id`
- `chat_session_id`
- `role`：`system | user | assistant`
- `content`
- `metadata_json`
- `created_at`

### 6.5 `tracks`

- `id`
- `source_type`：`self_hosted_open | licensed_partner | external_reference`
- `source_key`：外部来源唯一标识
- `name`
- `artist`
- `album`
- `cover_url`
- `audio_url`
- `preview_url`
- `external_url`
- `playback_mode`：`direct_play | preview_only | external_jump | unavailable`
- `license_type`：`CC0 | CC_BY | commercial_partner | metadata_only | other`
- `attribution_text`
- `duration`
- `genre_tags`
- `mood_tags`
- `description`
- `is_active`
- `created_at`
- `updated_at`

### 6.6 `recommendation_events`

- `id`
- `chat_session_id`
- `user_id`
- `anonymous_session_id`
- `recommended_track_ids`
- `rejection_track_ids`
- `context_summary`
- `created_at`

### 6.7 `favorites`

- `id`
- `user_id`
- `track_id`
- `created_at`

### 6.8 `provider_accounts`

- `id`
- `user_id`
- `provider_name`
- `provider_user_id`
- `access_scope`
- `metadata_json`
- `created_at`
- `updated_at`

> 说明：本阶段不默认实现网易云账号登录。该表用于未来接入正规外部音乐平台账号时的扩展位。

### 6.9 `app_settings`

- `key`
- `value_json`
- `updated_by`
- `updated_at`

用于替代本地 `.admin-config.json`，保存可在线修改的运营级配置，例如游客额度、默认推荐策略、来源开关等。密钥类配置仍优先放 `Vercel` 环境变量。

### 6.10 `admin_roles`

- `user_id`
- `role`：`admin | operator`
- `granted_by`
- `created_at`

用于替代当前基于共享密码的后台访问方式。首期也可退化为白名单邮箱，但数据库角色表是推荐终态。

## 6.11 Supabase 安全边界 (Supabase Security Boundaries)

- `anonymous_sessions`：仅服务端使用 `service role` 访问，浏览器不可直接写入游客额度。
- `chat_sessions` / `chat_messages`：
  - 登录用户只允许访问自己的数据。
  - 匿名会话数据默认仅允许服务端通过 session token 映射后访问。
- `favorites`：仅登录用户可读写自己的收藏。
- `app_settings` / `admin_roles`：仅管理员角色可读写。
- 所有额度扣减、匿名转正、来源映射、后台配置更新均走服务端 Route Handler 或 Server Action，不依赖浏览器直写数据库。

## 7. 核心流程设计 (Core Flows)

### 7.1 游客访问与额度校验

1. 首次访问时生成匿名会话 token。
2. 服务端根据 cookie / session token 创建或读取 `anonymous_sessions`。
3. 每次 AI 对话前校验剩余额度。
4. 当额度不足时返回结构化错误并引导登录。

### 7.2 匿名会话升级为正式账号

1. 游客完成登录。
2. 服务端读取当前匿名会话。
3. 将该匿名会话下的 `chat_sessions`、`chat_messages`、`recommendation_events` 迁移给用户。
4. 更新 `anonymous_sessions.promoted_to_user_id`。

### 7.3 AI 对话请求

1. 前端发送用户输入到统一服务端聊天接口。
2. 服务端：
   - 校验用户或匿名会话。
   - 校验游客额度。
   - 记录请求日志和消息。
   - 构建 prompt。
   - 调用大模型。
   - 将模型返回的推荐结果映射为 `tracks` 表中的统一曲目实体。
3. 返回前端时，附带每首曲目的 `playback_mode`。

### 7.4 播放流程

1. 用户点击推荐卡片。
2. 如果 `playback_mode === direct_play`：
   - 播放器加载 `audio_url`。
3. 如果 `playback_mode === preview_only`：
   - 播放器加载 `preview_url`，并显示试听标签。
4. 如果 `playback_mode === external_jump`：
   - 不触发站内播放，展示跳转按钮。

### 7.5 推荐结果映射规则

为避免 AI 推荐出大量“只能跳转、不能播放”的结果，服务端在推荐映射时必须遵守以下优先级：

1. 优先返回 `direct_play` 曲目。
2. 若候选不足，再补 `preview_only` 曲目。
3. 仅在前两类不足时返回 `external_jump` 曲目。
4. 单次推荐结果中，至少一半条目应为 `direct_play` 或 `preview_only`；若做不到，UI 必须显示“部分歌曲需跳转播放”的提示。
5. 对 `unavailable` 曲目不直接返回给用户，只用于内部候选过滤或运营分析。

## 8. 曲库与来源策略 (Catalog Strategy)

### 8.1 首发可播曲库策略

- 将现有本地精选曲库迁移为 `tracks` 表中的 `self_hosted_open` 数据。
- 第一阶段新增可播放内容以开放授权资源为主：
  - `CC0`
  - `CC BY`
- 对 `CC BY` 曲目在 UI 和详情页展示署名文本。

### 8.2 大曲库扩展策略

- 第二层目录源接入原则：
  - 必须为官方、合规、可长期维护来源。
  - 能提供清晰的商用与嵌入许可。
- 对不能合法站内播放的来源，只保留目录搜索、展示和跳转能力。

### 8.2.1 曲库导入机制

- 现有 `web/lib/music-catalog.json` 在过渡期保留为 seed 输入源，而不再作为运行时真数据源。
- 新增导入脚本负责将本地精选曲库写入 `tracks` 表。
- 外部目录源通过独立同步任务或后台导入动作写入 `tracks` 表中的对应来源记录。
- 运行时推荐、搜索、播放一律读取统一曲目模型，不再直接依赖本地 JSON。

### 8.3 不采用的来源策略

- 不接入逆向 API 作为生产主链路。
- 不使用标注含糊、无法确认商用范围的“免费音乐”。
- 不使用 `CC BY-NC` 内容作为商业产品曲库。

## 9. 管理后台设计 (Admin Design)

### 9.1 配置迁移

- 删除本地文件配置依赖。
- 运营配置迁移到 `app_settings`。
- 密钥配置迁移到 `Vercel` 环境变量。

### 9.2 后台能力

后台首期支持：

- 游客额度配置。
- 默认推荐模型配置。
- 开放音乐来源开关。
- 曲库条目启停。
- 关键统计查看：游客转化、播放行为、推荐点击。

### 9.3 权限设计

- 不再使用单纯 `x-admin-password`。
- 管理端通过用户角色或白名单邮箱控制访问。

## 10. Sentry 设计 (Observability)

需要覆盖以下错误与事件：

- 前端：
  - 播放器加载失败。
  - 登录失败。
  - 推荐结果渲染异常。
- 服务端：
  - AI 请求失败。
  - Supabase 查询失败。
  - 匿名会话升级失败。
  - 来源映射失败。

关键上下文字段：

- `user_id`
- `anonymous_session_id`
- `chat_session_id`
- `track_id`
- `source_type`
- `playback_mode`

## 11. 迁移步骤 (Migration Plan)

### Phase 1：底座生产化

- 接入 `Supabase` 客户端与环境变量。
- 接入 `Sentry`。
- 建立数据库 schema。
- 接入 `Supabase Auth`。
- 建立匿名会话机制。
- 将 AI 请求完全收口到服务端。

### Phase 2：聊天与游客能力

- 持久化聊天会话与消息。
- 游客额度改为数据库驱动。
- 实现匿名历史升级绑定账号。

### Phase 3：曲库模型升级

- 将本地 `music-catalog.json` 迁移为数据库化或导入脚本管理。
- 为曲目增加 `source_type` 与 `playback_mode`。
- 更新推荐结果映射逻辑。

### Phase 4：后台与运营

- 后台改用用户角色控制。
- 配置迁移到 `app_settings` + 环境变量。
- 增加来源开关、游客额度、统计面板。

### Phase 5：外部目录增强

- 接入合规的外部目录来源。
- 增加目录聚合搜索。
- 明确展示播放能力分层。

## 11.1 测试与发布策略 (Testing and Rollout)

### 测试层次

- 单元测试：
  - 匿名额度计算
  - 推荐映射优先级
  - 播放能力分层逻辑
- 集成测试：
  - 游客会话创建与额度扣减
  - 登录后匿名历史绑定
  - 后台配置读写权限
- 端到端测试：
  - 游客首次进入并成功完成对话
  - 登录用户查看迁移后的历史记录
  - `direct_play / preview_only / external_jump` 三类曲目交互表现

### 发布策略

- 先以 feature flag 切换到新聊天链路和新曲库模型。
- 保留旧本地曲库播放链路作为短期回退路径，直到新数据模型稳定。
- 对外部目录增强功能分阶段放量，避免首发同时引入来源同步、播放分层和推荐重构三类风险。

## 12. 风险与约束 (Risks)

- `开放授权曲库` 无法天然覆盖热门中文流行歌需求，因此产品需要接受“推荐质量依赖可播合法资源池”的现实约束。
- `第三方目录源` 能否用于站内播放取决于平台授权，而不是技术实现本身。
- `CC BY` 需要稳定的署名展示机制，否则存在合规风险。
- 匿名会话升级涉及数据合并与幂等处理，需要严格测试。
- 现有播放器、推荐链路、后台配置都要同步改造，不能只替换一层存储。

## 13. 验收标准 (Acceptance Criteria)

- 用户可以通过 `Magic Link` 或 `Google` 登录。
- 游客可免费体验 `10` 次，额度在多实例环境下保持一致。
- 游客历史在登录后正确迁移到用户账号。
- 所有 AI 请求都经过服务端代理。
- 曲目可以明确区分 `direct_play / preview_only / external_jump`。
- 后台配置不再依赖本地文件。
- 前后端错误能够在 `Sentry` 中看到完整上下文。

## 14. 推荐决策 (Decision)

本项目采用 `方案 2：混合曲库模式`。

原因：

- 用户不接受小规模静态曲库作为主体验。
- 现实中不存在一个面向普通产品稳定开放、又能免费合规承载主流中文大曲库站内完整播放的单一来源。
- `混合曲库 + 播放能力分层` 是兼顾上线可行性、产品体验和长期扩展性的最稳妥路径。
