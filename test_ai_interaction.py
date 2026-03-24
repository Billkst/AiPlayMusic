#!/usr/bin/env python3
"""测试 AI 互动功能 - 体验模式"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print("1. 访问首页...")
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    
    print("2. 点击 AI 推荐按钮...")
    page.get_by_text("AI 推荐").click()
    time.sleep(2)
    page.screenshot(path="ai_test_1_panel_open.png")
    
    print("3. 检查体验模式...")
    trial_mode = page.locator('text=体验模式已启用')
    if trial_mode.is_visible():
        print("⚠️ 体验模式：需要配置 API Key 才能使用聊天")
        page.screenshot(path="ai_test_trial_mode.png")
    else:
        print("✅ 已配置 API Key")
    
    time.sleep(3)
    browser.close()
