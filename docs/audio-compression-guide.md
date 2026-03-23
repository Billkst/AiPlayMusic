# 音频压缩指南

## 目标
将 30 个 MP3 文件从 150MB 压缩到 45MB（AAC 128kbps）

## 前置条件

### 安装 FFmpeg
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

验证安装：
```bash
ffmpeg -version
```

## 执行压缩

### 方法 1：使用提供的脚本（推荐）
```bash
cd /home/liujunxi/project/AiPlayMusic
chmod +x scripts/compress-audio.sh
./scripts/compress-audio.sh
```

### 方法 2：手动压缩单个文件
```bash
cd /home/liujunxi/project/AiPlayMusic/web/public/audio
ffmpeg -i input.mp3 -c:a aac -b:a 128k -movflags +faststart output.m4a
```

## 压缩后操作

### 1. 验证文件大小
```bash
du -sh web/public/audio_compressed/
```
期望：< 50MB

### 2. 替换原文件
```bash
cd web/public
rm -rf audio
mv audio_compressed audio
```

### 3. 更新文件扩展名
将 `music-catalog.json` 中的 `.mp3` 改为 `.m4a`

### 4. 测试播放
启动开发服务器测试所有音频文件可正常播放
