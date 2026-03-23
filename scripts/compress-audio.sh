#!/bin/bash

# 音频压缩脚本：MP3 → AAC 128kbps
# 目标：150MB → 45MB

INPUT_DIR="web/public/audio"
OUTPUT_DIR="web/public/audio_compressed"
BITRATE="128k"

mkdir -p "$OUTPUT_DIR"

echo "开始压缩音频文件..."
echo "输入目录: $INPUT_DIR"
echo "输出目录: $OUTPUT_DIR"
echo "目标码率: $BITRATE"
echo ""

total=0
success=0
failed=0

for file in "$INPUT_DIR"/*.mp3; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .mp3)
    output="$OUTPUT_DIR/${filename}.m4a"
    
    echo "处理: $filename.mp3 → ${filename}.m4a"
    
    if ffmpeg -i "$file" -c:a aac -b:a "$BITRATE" -movflags +faststart "$output" -y -loglevel error; then
      ((success++))
      original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
      compressed_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
      reduction=$((100 - compressed_size * 100 / original_size))
      echo "  ✓ 完成 (压缩率: ${reduction}%)"
    else
      ((failed++))
      echo "  ✗ 失败"
    fi
    
    ((total++))
  fi
done

echo ""
echo "压缩完成！"
echo "总计: $total 个文件"
echo "成功: $success 个"
echo "失败: $failed 个"

if [ $success -gt 0 ]; then
  original_total=$(du -sh "$INPUT_DIR" | cut -f1)
  compressed_total=$(du -sh "$OUTPUT_DIR" | cut -f1)
  echo ""
  echo "原始大小: $original_total"
  echo "压缩后: $compressed_total"
fi
