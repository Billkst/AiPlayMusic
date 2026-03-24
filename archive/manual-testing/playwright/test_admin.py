#!/usr/bin/env python3
"""测试管理后台界面"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print("1. 访问管理后台...")
    page.goto("http://localhost:3000/admin")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    page.screenshot(path="admin_1_login.png")
    print("✅ 登录页面截图已保存")
    
    print("2. 输入密码...")
    page.fill('input[type="password"]', 'admin123')
    time.sleep(1)
    page.screenshot(path="admin_2_password.png")
    
    print("3. 点击登录...")
    page.click('button:has-text("解锁访问")')
    time.sleep(2)
    page.screenshot(path="admin_3_dashboard.png")
    print("✅ 配置页面截图已保存")
    
    print("\n✅ 测试完成，请查看截图")
    time.sleep(3)
    browser.close()
