# AiPlayMusic MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-native web music player where users express moods via natural language, AI recommends songs from a curated catalog within 3 turns, and users can instantly preview tracks — all within an elevated Spotify-clone UI.

**Architecture:** Next.js 15 App Router single-page app. Browser-side AI communication via OpenAI-compatible protocol to multiple LLM providers. Global audio player state managed by React Context. Static JSON music catalog with local audio files. AI responses parsed for structured song IDs to enforce zero-hallucination.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, HTML5 Audio API, Vitest (unit tests)

---

## File Structure

```
web/                                    # 重命名自 spotify-clone-(chinese)
├── app/
│   ├── layout.tsx                      # [modify] 注入 PlayerProvider
│   ├── page.tsx                        # [modify] 接入新组件和状态
│   └── globals.css                     # [keep]
├── components/
│   ├── TopBar.tsx                      # [modify] 升级 AI 万能按钮
│   ├── Sidebar.tsx                     # [keep]
│   ├── MainContent.tsx                 # [keep]
│   ├── PlayerBar.tsx                   # [modify] 接入真实播放状态
│   ├── AIChatPanel.tsx                 # [rewrite] 全面重构
│   ├── MoodCard.tsx                    # [create] 破冰情境卡片
│   ├── SongCard.tsx                    # [create] 音乐实体卡片
│   └── ProviderConfigPanel.tsx         # [create] AI 厂商配置面板
├── lib/
│   ├── utils.ts                        # [keep]
│   ├── catalog.ts                      # [create] 曲库加载与查询
│   ├── music-catalog.json              # [create] 30 首歌元数据
│   ├── providers.ts                    # [create] AI 厂商预置列表
│   ├── chat-engine.ts                  # [create] AI 对话引擎核心
│   ├── prompt-builder.ts              # [create] System Prompt 构建
│   ├── response-parser.ts             # [create] AI 响应解析
│   └── turn-controller.ts             # [create] 对话轮次控制
├── contexts/
│   └── PlayerContext.tsx               # [create] 全局播放器状态
├── hooks/
│   ├── use-mobile.ts                   # [keep]
│   ├── use-player.ts                   # [create] 播放器 hook
│   └── use-chat.ts                     # [create] 聊天状态 hook
├── __tests__/
│   ├── response-parser.test.ts         # [create] 响应解析器测试
│   ├── turn-controller.test.ts         # [create] 轮次控制器测试
│   └── prompt-builder.test.ts          # [create] Prompt 构建器测试
├── public/
│   ├── audio/                          # [create] 30 个免版权 mp3
│   └── covers/                         # [create] 30 张封面图
├── package.json                        # [modify] 添加 vitest
├── vitest.config.ts                    # [create]
└── tsconfig.json                       # [keep]
```

---

## Task 1: 项目结构迁移与基础设施

**Files:**
- Move: `spotify-clone-(chinese)/*` → `web/*`
- Create: `web/vitest.config.ts`
- Modify: `web/package.json`

- [ ] **Step 1: 将 spotify-clone-(chinese) 重命名为 web**

```bash
mv "spotify-clone-(chinese)" web
```

- [ ] **Step 2: 安装开发依赖**

```bash
cd web && npm install && npm install -D vitest @testing-library/jest-dom
```

- [ ] **Step 3: 创建 vitest 配置**

创建 `web/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: 在 package.json 添加 test 脚本**

在 `scripts` 中添加:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: 验证项目能正常启动**

```bash
npm run dev
```
Expected: Next.js dev server 启动，无报错

- [ ] **Step 6: 验证测试框架能运行**

```bash
npm run test
```
Expected: vitest 启动，0 tests (无测试文件时正常退出)

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: rename project dir to web/, add vitest"
```

---

## Task 2: 精选曲库数据层

**Files:**
- Create: `web/lib/music-catalog.json`
- Create: `web/lib/catalog.ts`
- Create: `web/public/audio/.gitkeep`
- Create: `web/public/covers/.gitkeep`

- [ ] **Step 1: 创建曲库 JSON 数据文件**

创建 `web/lib/music-catalog.json`，包含 30 首歌，6 个情绪分区各 5 首。

数据结构:
```json
[
  {
    "id": "fire-001",
    "name": "Unstoppable Force",
    "artist": "Royalty Free Artist",
    "coverUrl": "/covers/fire-001.jpg",
    "audioUrl": "/audio/fire-001.mp3",
    "duration": 195,
    "genreTags": ["electronic", "rock"],
    "moodTags": ["极致燃向", "激情", "能量爆发"],
    "description": "一首让肾上腺素飙升的电子摇滚，适合健身、冲刺和一切需要爆发的时刻。"
  }
]
```

6 个情绪分区的 ID 前缀:
- `fire-` 极致燃向 (001-005)
- `emo-` 深夜 emo (001-005)
- `focus-` 绝对专注 (001-005)
- `chill-` 慵懒微醺 (001-005)
- `drive-` 户外兜风 (001-005)
- `sleep-` 助眠放空 (001-005)

- [ ] **Step 2: 创建曲库查询模块**

创建 `web/lib/catalog.ts`:
```typescript
import catalogData from './music-catalog.json'

export interface Track {
  id: string
  name: string
  artist: string
  coverUrl: string
  audioUrl: string
  duration: number
  genreTags: string[]
  moodTags: string[]
  description: string
}

const catalog: Track[] = catalogData as Track[]

export function getAllTracks(): Track[] {
  return catalog
}

export function getTrackById(id: string): Track | undefined {
  return catalog.find(t => t.id === id)
}

export function getTracksByIds(ids: string[]): Track[] {
  return ids.map(id => getTrackById(id)).filter((t): t is Track => t !== undefined)
}

export function getTracksByMood(mood: string): Track[] {
  return catalog.filter(t => t.moodTags.some(tag => tag.includes(mood)))
}

export function getCatalogForPrompt(): string {
  return JSON.stringify(
    catalog.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
      genreTags: t.genreTags,
      moodTags: t.moodTags,
      description: t.description,
    })),
    null,
    2
  )
}
```

- [ ] **Step 3: 创建音频和封面占位目录**

```bash
mkdir -p web/public/audio web/public/covers
touch web/public/audio/.gitkeep web/public/covers/.gitkeep
```

注意：实际音频文件和封面图需要后续从免版权平台下载。MVP 阶段先用占位数据，确保数据层接口可用。

- [ ] **Step 4: 验证 TypeScript 类型正确**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add music catalog data layer with 30 tracks"
```

---

## Task 3: AI 核心逻辑层 — Prompt Builder + Response Parser + Turn Controller

**Files:**
- Create: `web/lib/prompt-builder.ts`
- Create: `web/lib/response-parser.ts`
- Create: `web/lib/turn-controller.ts`
- Create: `web/__tests__/prompt-builder.test.ts`
- Create: `web/__tests__/response-parser.test.ts`
- Create: `web/__tests__/turn-controller.test.ts`

### 3A: Response Parser (TDD)

- [ ] **Step 1: 写 response-parser 的失败测试**

创建 `web/__tests__/response-parser.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseRecommendations, parseOptions } from '@/lib/response-parser'

describe('parseRecommendations', () => {
  it('should extract valid recommendations from AI response', () => {
    const text = `很高兴为你推荐！
RECOMMENDATIONS: [{"id": "chill-001", "reason": "适合放松"}, {"id": "chill-002", "reason": "微醺氛围"}]`
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(2)
    expect(result.recommendations[0].id).toBe('chill-001')
    expect(result.recommendations[0].reason).toBe('适合放松')
    expect(result.cleanText).not.toContain('RECOMMENDATIONS')
  })

  it('should return empty array when no RECOMMENDATIONS block', () => {
    const text = '让我再了解一下你的喜好'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
    expect(result.cleanText).toBe(text)
  })

  it('should handle malformed JSON gracefully', () => {
    const text = 'RECOMMENDATIONS: [{"id": broken}]'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
  })

  it('should handle empty array', () => {
    const text = 'RECOMMENDATIONS: []'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(0)
  })

  it('should filter out items missing id or reason', () => {
    const text = 'RECOMMENDATIONS: [{"id": "chill-001"}, {"reason": "nice"}, {"id": "chill-002", "reason": "good"}]'
    const result = parseRecommendations(text)
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0].id).toBe('chill-002')
  })
})

describe('parseOptions', () => {
  it('should extract OPTIONS from AI response', () => {
    const text = `你好！今天想听什么？
OPTIONS: ["专注工作", "放松休息", "运动健身"]`
    const result = parseOptions(text)
    expect(result.options).toEqual(['专注工作', '放松休息', '运动健身'])
    expect(result.cleanText).not.toContain('OPTIONS')
  })

  it('should return empty array when no OPTIONS block', () => {
    const text = '好的，让我来推荐'
    const result = parseOptions(text)
    expect(result.options).toHaveLength(0)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd web && npm run test
```
Expected: FAIL — module not found

- [ ] **Step 3: 实现 response-parser**

创建 `web/lib/response-parser.ts`:
```typescript
export interface Recommendation {
  id: string
  reason: string
}

export interface ParsedRecommendations {
  cleanText: string
  recommendations: Recommendation[]
}

export interface ParsedOptions {
  cleanText: string
  options: string[]
}

export function parseRecommendations(text: string): ParsedRecommendations {
  const match = text.match(/RECOMMENDATIONS:\s*(\[[\s\S]*?\])/)
  if (!match) {
    return { cleanText: text, recommendations: [] }
  }

  const cleanText = text.replace(/RECOMMENDATIONS:\s*\[[\s\S]*?\]/, '').trim()

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) {
      return { cleanText, recommendations: [] }
    }
    const recommendations = parsed.filter(
      (item: any): item is Recommendation =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.reason === 'string'
    )
    return { cleanText, recommendations }
  } catch {
    return { cleanText, recommendations: [] }
  }
}

export function parseOptions(text: string): ParsedOptions {
  const match = text.match(/OPTIONS:\s*(\[[\s\S]*?\])/)
  if (!match) {
    return { cleanText: text, options: [] }
  }

  const cleanText = text.replace(/OPTIONS:\s*\[[\s\S]*?\]/, '').trim()

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) {
      return { cleanText, options: [] }
    }
    return { cleanText, options: parsed.filter((s: any) => typeof s === 'string') }
  } catch {
    return { cleanText, options: [] }
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd web && npm run test
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add response parser with tests (TDD)"
```

### 3B: Turn Controller (TDD)

- [ ] **Step 6: 写 turn-controller 的失败测试**

创建 `web/__tests__/turn-controller.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { TurnController } from '@/lib/turn-controller'

describe('TurnController', () => {
  it('should start at turn 0', () => {
    const tc = new TurnController()
    expect(tc.currentTurn).toBe(0)
    expect(tc.shouldForceRecommend).toBe(false)
  })

  it('should increment turn on user message', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    expect(tc.currentTurn).toBe(1)
  })

  it('should force recommend at turn 3', () => {
    const tc = new TurnController()
    tc.recordUserTurn() // 1
    tc.recordUserTurn() // 2
    tc.recordUserTurn() // 3
    expect(tc.shouldForceRecommend).toBe(true)
  })

  it('should not force recommend before turn 3', () => {
    const tc = new TurnController()
    tc.recordUserTurn() // 1
    tc.recordUserTurn() // 2
    expect(tc.shouldForceRecommend).toBe(false)
  })

  it('should reset to initial state', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    tc.reset()
    expect(tc.currentTurn).toBe(0)
    expect(tc.shouldForceRecommend).toBe(false)
    expect(tc.rejectedIds).toHaveLength(0)
  })

  it('should track rejected IDs for "not my vibe"', () => {
    const tc = new TurnController()
    tc.addRejectedIds(['chill-001', 'chill-002'])
    expect(tc.rejectedIds).toEqual(['chill-001', 'chill-002'])
    tc.addRejectedIds(['fire-001'])
    expect(tc.rejectedIds).toEqual(['chill-001', 'chill-002', 'fire-001'])
  })

  it('should reset turn count but keep rejected IDs on "not my vibe"', () => {
    const tc = new TurnController()
    tc.recordUserTurn()
    tc.recordUserTurn()
    tc.addRejectedIds(['chill-001'])
    tc.resetForNewVibe()
    expect(tc.currentTurn).toBe(0)
    expect(tc.rejectedIds).toEqual(['chill-001'])
  })
})
```

- [ ] **Step 7: 运行测试确认失败**

```bash
cd web && npm run test
```
Expected: FAIL

- [ ] **Step 8: 实现 turn-controller**

创建 `web/lib/turn-controller.ts`:
```typescript
const MAX_TURNS = 3

export class TurnController {
  private _currentTurn = 0
  private _rejectedIds: string[] = []

  get currentTurn(): number {
    return this._currentTurn
  }

  get shouldForceRecommend(): boolean {
    return this._currentTurn >= MAX_TURNS
  }

  get rejectedIds(): string[] {
    return [...this._rejectedIds]
  }

  recordUserTurn(): void {
    this._currentTurn++
  }

  addRejectedIds(ids: string[]): void {
    this._rejectedIds.push(...ids)
  }

  /** 全量重置（重新开始） */
  reset(): void {
    this._currentTurn = 0
    this._rejectedIds = []
  }

  /** 换一批：重置轮次但保留拒绝列表 */
  resetForNewVibe(): void {
    this._currentTurn = 0
  }
}
```

- [ ] **Step 9: 运行测试确认通过**

```bash
cd web && npm run test
```
Expected: ALL PASS

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add turn controller with tests (TDD)"
```

### 3C: Prompt Builder (TDD)

- [ ] **Step 11: 写 prompt-builder 的失败测试**

创建 `web/__tests__/prompt-builder.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/prompt-builder'

describe('buildSystemPrompt', () => {
  const mockCatalog = JSON.stringify([
    { id: 'chill-001', name: 'Test Song', artist: 'Test Artist', moodTags: ['放松'] }
  ])

  it('should include catalog data in prompt', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('chill-001')
    expect(prompt).toContain('Test Song')
  })

  it('should include RECOMMENDATIONS format instruction', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('RECOMMENDATIONS:')
  })

  it('should include OPTIONS format instruction', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).toContain('OPTIONS:')
  })

  it('should include force-recommend instruction at turn 3', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 3, rejectedIds: [] })
    expect(prompt).toContain('必须')
    expect(prompt).toContain('RECOMMENDATIONS')
  })

  it('should include rejected IDs when present', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: ['chill-001', 'fire-002'] })
    expect(prompt).toContain('chill-001')
    expect(prompt).toContain('fire-002')
    expect(prompt).toMatch(/排除|不要|禁止/)
  })

  it('should not include rejection section when no rejected IDs', () => {
    const prompt = buildSystemPrompt({ catalogJson: mockCatalog, currentTurn: 0, rejectedIds: [] })
    expect(prompt).not.toContain('已被用户拒绝')
  })
})
```

- [ ] **Step 12: 运行测试确认失败**

```bash
cd web && npm run test
```
Expected: FAIL

- [ ] **Step 13: 实现 prompt-builder**

创建 `web/lib/prompt-builder.ts`:
```typescript
interface PromptConfig {
  catalogJson: string
  currentTurn: number
  rejectedIds: string[]
}

export function buildSystemPrompt(config: PromptConfig): string {
  const { catalogJson, currentTurn, rejectedIds } = config

  let prompt = `你是一个专业的 AI 音乐推荐助手，拥有极高的共情能力和音乐品味。

## 你的性格
- 温暖、有趣、善于倾听
- 用自然、走心的语言和用户交流，而非冰冷的算法推荐
- 每次推荐都附带一句个性化的推荐理由

## 核心规则（铁律，不可违反）
1. 你只能从以下曲库中推荐歌曲，严禁推荐曲库之外的任何歌曲
2. 推荐时必须使用歌曲的精确 ID
3. 每次推荐 3-5 首歌曲

## 可用曲库
${catalogJson}

## 对话流程
- 如果用户有明确的歌曲/歌手需求，直接在曲库中匹配，找不到则用高情商话术安抚并推荐风格最接近的替代
- 如果用户表达模糊（情绪、场景），你可以通过最多 2 轮追问来细化理解
- 当前是第 ${currentTurn + 1} 轮对话`

  if (currentTurn >= 3) {
    prompt += `\n\n## 重要指令
当前已经是第 ${currentTurn + 1} 轮对话，你必须立即给出最终的音乐推荐结果，不能再继续追问。
请在回复中包含 RECOMMENDATIONS 块。`
  }

  if (rejectedIds.length > 0) {
    prompt += `\n\n## 已被用户拒绝的歌曲（禁止再次推荐）
以下歌曲 ID 已被用户标记为"Not My Vibe"，请排除这些歌曲，不要再次推荐：
${JSON.stringify(rejectedIds)}`
  }

  prompt += `\n\n## 输出格式
- 当你还在引导用户、尚未给出最终推荐时，在回复末尾提供 3-4 个快捷选项供用户点击：
  OPTIONS: ["选项1", "选项2", "选项3"]

- 当你决定给出最终推荐时，在回复末尾输出推荐结果（必须是合法 JSON）：
  RECOMMENDATIONS: [{"id": "歌曲ID", "reason": "一句走心的推荐理由"}, ...]

注意：OPTIONS 和 RECOMMENDATIONS 不能同时出现。一次回复中只能有其中一个。`

  return prompt
}
```

- [ ] **Step 14: 运行测试确认通过**

```bash
cd web && npm run test
```
Expected: ALL PASS

- [ ] **Step 15: Commit**

```bash
git add -A && git commit -m "feat: add prompt builder with tests (TDD)"
```

---

## Task 4: AI 厂商配置与对话引擎

**Files:**
- Create: `web/lib/providers.ts`
- Create: `web/lib/chat-engine.ts`

- [ ] **Step 1: 创建 AI 厂商预置列表**

创建 `web/lib/providers.ts`:
```typescript
export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  defaultModels: string[]
  /** 部分厂商需要特殊 headers */
  headerKey?: string
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    defaultModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    defaultModels: ['gpt-4o', 'gpt-4o-mini'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    baseUrl: 'https://api.moonshot.cn',
    defaultModels: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  },
  {
    id: 'zhipu',
    name: '智谱 (GLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas',
    defaultModels: ['glm-4-flash', 'glm-4'],
  },
  {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    defaultModels: ['qwen-turbo', 'qwen-plus'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModels: ['gemini-2.0-flash', 'gemini-2.5-flash-preview-05-20'],
  },
]

export function getProviderById(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === id)
}
```

- [ ] **Step 2: 创建统一对话引擎**

创建 `web/lib/chat-engine.ts`:
```typescript
import { getProviderById } from './providers'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatConfig {
  providerId: string
  apiKey: string
  model: string
}

export interface ChatResponse {
  content: string
  error?: string
}

export async function sendChatMessage(
  messages: ChatMessage[],
  config: ChatConfig
): Promise<ChatResponse> {
  const provider = getProviderById(config.providerId)
  if (!provider) {
    return { content: '', error: `未知的 AI 厂商: ${config.providerId}` }
  }

  if (!config.apiKey) {
    return { content: '', error: '请先配置 API Key' }
  }

  const url = `${provider.baseUrl}/v1/chat/completions`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.8,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { content: '', error: 'API Key 无效或已过期，请检查你的配置。' }
      }
      return { content: '', error: `API 请求失败 (${response.status})，请稍后重试。` }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    return { content }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { content: '', error: 'AI 响应超时，请检查网络连接后重试。' }
    }
    return { content: '', error: '网络连接失败，请检查网络状态后重试。' }
  }
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add AI provider config and chat engine"
```

---

## Task 5: 全局播放器状态（PlayerContext）

**Files:**
- Create: `web/contexts/PlayerContext.tsx`
- Create: `web/hooks/use-player.ts`
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: 创建 PlayerContext**

创建 `web/contexts/PlayerContext.tsx`:
```typescript
'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import type { Track } from '@/lib/catalog'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
}

interface PlayerActions {
  playTrack: (track: Track) => void
  togglePlay: () => void
  seek: (time: number) => void
  stop: () => void
}

type PlayerContextType = PlayerState & PlayerActions

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => setIsPlaying(false))
    audio.addEventListener('error', () => setIsPlaying(false))

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack?.id === track.id) {
      // 同一首歌，切换播放/暂停
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
      return
    }

    // 新歌曲
    audio.src = track.audioUrl
    audio.play()
    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [currentTrack, isPlaying])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }, [currentTrack, isPlaying])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.src = ''
    setCurrentTrack(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, currentTime, duration, playTrack, togglePlay, seek, stop }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within PlayerProvider')
  return context
}
```

- [ ] **Step 2: 创建 use-player hook（re-export）**

创建 `web/hooks/use-player.ts`:
```typescript
export { usePlayer } from '@/contexts/PlayerContext'
```

- [ ] **Step 3: 在 layout.tsx 注入 PlayerProvider**

修改 `web/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/contexts/PlayerContext'

export const metadata: Metadata = {
  title: 'AiPlayMusic - AI 原生音乐播放器',
  description: '基于大模型的智能听歌体验，从被动搜索到意图共鸣',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: 验证编译无报错**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add global player context with HTML5 Audio"
```

---

## Task 6: 底部 PlayerBar 接入真实播放状态

**Files:**
- Modify: `web/components/PlayerBar.tsx`

- [ ] **Step 1: 重写 PlayerBar 接入 usePlayer**

将 `PlayerBar.tsx` 改为从 PlayerContext 读取当前播放曲目、播放状态、进度，替换所有硬编码数据。保留现有 UI 结构和样式，仅将静态数据替换为动态数据。

关键改动点:
- 左侧"Now Playing"：从 `currentTrack` 读取封面、歌名、艺人
- 中间控制区：播放/暂停按钮调用 `togglePlay()`，进度条反映 `currentTime / duration`
- 进度条支持点击拖拽 seek
- 无歌曲播放时显示空状态

- [ ] **Step 2: 验证编译 + 手动测试**

```bash
cd web && npx tsc --noEmit && npm run dev
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: connect PlayerBar to real audio state"
```

---

## Task 7: UI 组件 — MoodCard + SongCard

**Files:**
- Create: `web/components/MoodCard.tsx`
- Create: `web/components/SongCard.tsx`

- [ ] **Step 1: 创建 MoodCard（破冰情境卡片）**

创建 `web/components/MoodCard.tsx`：

塔罗牌风格的精美卡片，每张含:
- 情绪图标 emoji
- 情绪标题
- 一句简短描述
- hover 动效（scale + 发光边框）
- 点击回调

6 个预设情绪:
```typescript
const MOODS = [
  { emoji: '🔥', title: '极致燃向', desc: '肾上腺素拉满的时刻' },
  { emoji: '🌙', title: '深夜 emo', desc: '一个人的情绪角落' },
  { emoji: '🎯', title: '绝对专注', desc: '进入心流的通道' },
  { emoji: '🍷', title: '慵懒微醺', desc: '慢下来，享受此刻' },
  { emoji: '🚗', title: '户外兜风', desc: '风和自由的味道' },
  { emoji: '🌿', title: '助眠放空', desc: '把世界关在门外' },
]
```

- [ ] **Step 2: 创建 SongCard（音乐实体卡片）**

创建 `web/components/SongCard.tsx`：

在聊天流中渲染的歌曲卡片，含:
- 歌曲封面图（圆角，左侧）
- 歌名 + 艺人
- AI 的推荐理由（斜体小字）
- 播放/暂停按钮（根据当前播放状态切换图标）
- 点击调用 `playTrack(track)`
- 暗色卡片背景，hover 高亮效果

- [ ] **Step 3: 验证编译**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add MoodCard and SongCard components"
```

---

## Task 8: AI 聊天面板全面重构

**Files:**
- Rewrite: `web/components/AIChatPanel.tsx`
- Create: `web/components/ProviderConfigPanel.tsx`
- Create: `web/hooks/use-chat.ts`

- [ ] **Step 1: 创建 use-chat hook**

创建 `web/hooks/use-chat.ts`：

管理聊天状态的核心 hook，封装:
- `messages` 数组 (含 role, text, options?, recommendations?)
- `isLoading` 状态
- `turnController` 实例
- `sendMessage(text)` — 构建 prompt → 调用 chat-engine → 解析响应 → 更新消息
- `handleNotMyVibe(rejectedIds)` — 重置轮次，添加拒绝列表，重新请求
- `resetChat()` — 清空一切，回到初始状态
- 读取 localStorage 中的厂商配置
- 将曲库数据注入 system prompt

- [ ] **Step 2: 创建 ProviderConfigPanel**

创建 `web/components/ProviderConfigPanel.tsx`：

替代现有的配置 UI，改为:
- AI 厂商下拉菜单（从 `AI_PROVIDERS` 列表渲染）
- API Key 密码输入框
- 模型选择（下拉，根据所选厂商动态切换默认模型列表）
- 保存/取消按钮
- 持久化到 localStorage

- [ ] **Step 3: 重写 AIChatPanel**

全面重构 `web/components/AIChatPanel.tsx`：

核心变更:
- 使用 `useChat` hook 管理所有聊天逻辑（移除内联的 Gemini SDK 调用）
- 初始状态：AI 打招呼 + 渲染 `MoodCard` 组件（而非纯文本选项）
- AI 消息中的推荐结果：渲染 `SongCard` 组件列表
- 推荐结果下方：渲染"Not My Vibe"按钮
- 头部新增"重新开始"按钮（刷新图标）
- 未配置 API Key 时：展示引导卡片而非空面板
- 保留右侧滑入动画
- 保留配置齿轮图标入口

- [ ] **Step 4: 验证编译 + 手动测试完整对话流**

```bash
cd web && npx tsc --noEmit && npm run dev
```

手动验收:
1. 点击 AI 按钮 → 面板滑入 → 显示打招呼 + 情境卡片
2. 点击情境卡片 → AI 回复（需配置 API Key）
3. 多轮对话 → 第 3 轮强制推荐
4. 推荐卡片 → 点击播放 → PlayerBar 同步
5. Not My Vibe → 换一批
6. 重新开始 → 回到初始状态
7. 未配置 Key → 引导提示

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: rewrite AI chat panel with full conversation flow"
```

---

## Task 9: 异常兜底完善

**Files:**
- Modify: `web/components/AIChatPanel.tsx`
- Modify: `web/hooks/use-chat.ts`

- [ ] **Step 1: 完善 use-chat 中的错误处理**

确保以下场景都有优雅处理:
- `sendChatMessage` 返回 error → 在消息流中渲染错误气泡 + 重试按钮
- 响应解析失败（无有效 ID）→ 显示 AI 原始文本 + "推荐解析失败" 提示 + 重试按钮
- 未配置 API Key → 阻断发送，展示配置引导

- [ ] **Step 2: 在 AIChatPanel 中渲染错误状态 UI**

- 错误气泡：红色/橙色边框，含错误描述文字
- 重试按钮：点击后用上一条用户消息重新调用 AI
- 配置引导卡片：醒目按钮直接跳转设置面板

- [ ] **Step 3: 验证各异常场景的 UI 表现**

手动测试:
- 填错 API Key → 应显示"Key 无效"
- 断网 → 应显示"网络连接失败"
- 点重试 → 应重新发送请求

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add error handling and graceful degradation"
```

---

## Task 10: 收集免版权音频素材

**Files:**
- Update: `web/lib/music-catalog.json` (更新真实文件名)
- Add: `web/public/audio/*.mp3` (30 个音频文件)
- Add: `web/public/covers/*.jpg` (30 张封面图)

- [ ] **Step 1: 从免版权平台下载 30 首音频**

来源: Pixabay Music (https://pixabay.com/music/) 或 Free Music Archive

按 6 个情绪分区各下载 5 首:
- 极致燃向: 高能电子/摇滚
- 深夜 emo: 忧伤钢琴/民谣
- 绝对专注: Lo-fi/环境音
- 慵懒微醺: Jazz/Bossa Nova
- 户外兜风: Indie/轻快流行
- 助眠放空: Ambient/自然音

命名规范: `{分区前缀}-{序号}.mp3`（如 `fire-001.mp3`）

- [ ] **Step 2: 准备 30 张封面图**

来源: Unsplash (https://unsplash.com/) 免版权图片
尺寸: 300x300 或 500x500
命名规范: `{分区前缀}-{序号}.jpg`

- [ ] **Step 3: 更新 music-catalog.json 中的真实元数据**

根据实际下载的音频更新每首歌的 name, artist, duration, description。

- [ ] **Step 4: 更新 next.config.ts 的图片域名配置**

如果封面图使用本地文件则无需修改。如果使用 Unsplash CDN，需要添加域名白名单。

- [ ] **Step 5: 验证所有音频和图片可正常加载**

```bash
cd web && npm run dev
```

在浏览器中手动检查几首歌的播放和封面显示。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add 30 royalty-free audio tracks and cover art"
```

---

## Task 11: 最终集成验证

- [ ] **Step 1: 运行全部单元测试**

```bash
cd web && npm run test
```
Expected: ALL PASS

- [ ] **Step 2: TypeScript 编译检查**

```bash
cd web && npx tsc --noEmit
```
Expected: 无错误

- [ ] **Step 3: 生产构建检查**

```bash
cd web && npm run build
```
Expected: 构建成功

- [ ] **Step 4: 完整端到端手动验收**

验收清单:
- [ ] 首页布局完整（Sidebar + MainContent + PlayerBar）
- [ ] AI 万能按钮醒目可见
- [ ] 点击按钮 → 聊天面板滑入
- [ ] AI 打招呼 + 6 张情境卡片
- [ ] 点击卡片 / 输入文字 → AI 共情回复
- [ ] 3 轮内出现推荐结果
- [ ] 推荐结果以精美卡片呈现
- [ ] 点击播放 → 音频正常播放
- [ ] PlayerBar 同步显示曲目和进度
- [ ] Not My Vibe → 换一批新推荐
- [ ] 重新开始 → 回到初始状态
- [ ] 厂商配置 → 切换 AI 厂商正常
- [ ] 未配置 Key → 引导提示
- [ ] 网络错误 → 优雅降级 + 重试

- [ ] **Step 5: 最终 Commit**

```bash
git add -A && git commit -m "feat: AiPlayMusic MVP complete — AI-native music player"
```
