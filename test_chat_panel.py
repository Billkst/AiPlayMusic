#!/usr/bin/env python3
"""测试 AI 聊天面板显示"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print("访问首页...")
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="debug_1_homepage.png")
    
    print("查找 AI 推荐按钮...")
    ai_button = page.get_by_text("AI 推荐")
    if ai_button.is_visible():
        print("✅ 找到 AI 推荐按钮")
        ai_button.click()
        time.sleep(2)
        page.screenshot(path="debug_2_after_click.png")
        
        # 检查聊天面板
        chat_panel = page.locator('text=AI 音乐助手')
        if chat_panel.is_visible():
            print("✅ 聊天面板已打开")
        else:
            print("❌ 聊天面板未显示")
    else:
        print("❌ 未找到 AI 推荐按钮")
    
    time.sleep(3)
    browser.close()
