#!/usr/bin/env python3
"""AiPlayMusic 基础功能测试"""

from playwright.sync_api import sync_playwright, expect
import time

def test_aiplaymusic():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("📱 访问应用...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        print("📸 截图：首页")
        page.screenshot(path="screenshot_home.png")
        
        print("✅ 测试完成")
        browser.close()

if __name__ == "__main__":
    test_aiplaymusic()
