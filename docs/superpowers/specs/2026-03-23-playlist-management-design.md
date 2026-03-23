# 播放列表管理功能设计文档 (Playlist Management Design Spec)

## 1. 目标 (Goals)
扩展 `PlayerContext` 以支持完整的播放列表管理功能，包括播放列表状态、播放控制方法、播放模式逻辑和自动播放下一首。

## 2. 状态设计 (State Design)
我们将扩展 `PlayerState` 接口：
- `playlist: Track[]`: 当前播放列表。
- `currentIndex: number`: 当前播放歌曲在 `playlist` 中的索引。
- `playMode: 'sequence' | 'loop' | 'shuffle'`: 播放模式。
- `shuffledIndices: number[]`: 随机播放时的索引序列。

## 3. 接口设计 (Interface Design)
我们将扩展 `PlayerActions` 接口：
- `playNext()`: 播放下一首。
- `playPrevious()`: 播放上一首。
- `setPlaylist(tracks: Track[], startIndex?: number)`: 设置播放列表。
- `setPlayMode(mode: PlayMode)`: 切换播放模式。

## 4. 核心逻辑 (Core Logic)

### 4.1 播放模式逻辑
- **`sequence` (顺序播放)**:
  - `playNext()`: 如果 `currentIndex < playlist.length - 1`，则 `currentIndex++`；否则停止播放。
  - `playPrevious()`: 如果 `currentIndex > 0`，则 `currentIndex--`；否则不执行操作。
- **`loop` (循环播放)**:
  - `playNext()`: 如果 `currentIndex < playlist.length - 1`，则 `currentIndex++`；否则回到 `0`。
  - `playPrevious()`: 如果 `currentIndex > 0`，则 `currentIndex--`；否则回到 `playlist.length - 1`。
- **`shuffle` (随机播放)**:
  - 切换到 `shuffle` 时，生成一个包含 `0` 到 `playlist.length - 1` 的随机排列数组 `shuffledIndices`。
  - 为了保证当前播放的歌曲不中断，我们将 `shuffledIndices` 的第一个元素设为当前的 `currentIndex`，然后打乱剩余的索引。
  - `playNext()`: 在 `shuffledIndices` 中移动到下一个位置。如果已到末尾，则重新打乱。
  - `playPrevious()`: 在 `shuffledIndices` 中移动到上一个位置。

### 4.2 自动播放下一首
- 监听 `audio` 的 `ended` 事件，自动调用 `playNext()`。

### 4.3 设置播放列表 (`setPlaylist`)
- 如果提供了 `startIndex`，则从该位置开始播放。
- 如果未提供 `startIndex`，且当前歌曲在列表中，则保持当前播放状态并更新 `currentIndex`。
- 如果未提供 `startIndex` 且当前歌曲不在列表中，则从 `0` 开始播放。

## 5. 测试计划 (Testing Plan)
我们将使用 Vitest 编写测试文件 `web/__tests__/playlist.test.ts`：
- 测试 `sequence` 模式下的 `playNext` 和 `playPrevious`。
- 测试 `loop` 模式下的边界情况（首尾跳转）。
- 测试 `shuffle` 模式下的随机性与不重复性。
- 测试 `setPlaylist` 的各种场景。
- 测试 `audio.ended` 触发的自动播放。

## 6. 约束 (Constraints)
- 保持与现有 `PlayerContext` 的兼容性。
- 使用 TypeScript 严格类型。
- 确保所有测试通过。
