#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

def test_aiplaymusic():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("=== 测试 1: 访问主页，检查游客配额显示 ===")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        # 截图主页
        page.screenshot(path='/tmp/homepage.png', full_page=True)
        print("✓ 主页截图已保存到 /tmp/homepage.png")
        
        # 查找 AI 聊天按钮
        chat_button = page.locator('text=AI 推荐').first
        if chat_button.is_visible():
            print("✓ 找到 AI 推荐按钮")
            chat_button.click()
            time.sleep(2)
        
        print("\n=== 测试 2: 检查游客配额显示 ===")
        page.screenshot(path='/tmp/chat_panel.png', full_page=True)
        
        # 查找配额文本
        quota_text = page.locator('text=/体验模式.*次/').first
        if quota_text.is_visible():
            text = quota_text.inner_text()
            print(f"✓ 找到配额显示: {text}")
        else:
            print("✗ 未找到配额显示")
        
        print("\n=== 测试 3: 发送 AI 消息 ===")
        input_field = page.locator('input[placeholder*="告诉"]').first
        if input_field.is_visible():
            input_field.fill("我想听轻松愉快的音乐")
            print("✓ 输入消息")
            
            send_button = page.locator('button[title="发送"]').first
            send_button.click()
            print("✓ 点击发送")
            
            print("⏳ 等待 AI 响应（最多 30 秒）...")
            time.sleep(30)
            page.screenshot(path='/tmp/after_message.png', full_page=True)
            print("✓ 消息发送后截图已保存")
        
        print("\n=== 测试 4: 检查页面内容并选择情绪卡片 ===")
        page_content = page.content()
        with open('/tmp/page_content.html', 'w') as f:
            f.write(page_content)
        print("✓ 页面内容已保存到 /tmp/page_content.html")
        
        all_buttons = page.locator('button').all()
        print(f"✓ 页面上共有 {len(all_buttons)} 个按钮")
        
        for i, btn in enumerate(all_buttons[:10]):
            try:
                text = btn.inner_text()
                if text and len(text) < 50:
                    print(f"  按钮 {i}: {text}")
            except:
                pass
        
        mood_button = page.locator('button').filter(has_text='轻松').first
        if mood_button.is_visible():
            print("✓ 找到情绪卡片")
            mood_button.click()
            print("✓ 点击情绪卡片")
            time.sleep(25)
            page.screenshot(path='/tmp/after_mood.png', full_page=True)
        else:
            print("✗ 未找到情绪卡片")
        
        print("\n=== 测试 5: 检查推荐歌曲和 Not My Vibe 按钮 ===")
        recommendations = page.locator('[class*="SongCard"]').count()
        print(f"✓ 找到 {recommendations} 个推荐歌曲")
        
        not_my_vibe_btn = page.locator('text=Not My Vibe').first
        if not_my_vibe_btn.is_visible():
            print("✓ Not My Vibe 按钮可见")
            is_enabled = not not_my_vibe_btn.is_disabled()
            print(f"✓ Not My Vibe 按钮{'可点击' if is_enabled else '不可点击'}")
            
            if is_enabled:
                not_my_vibe_btn.click()
                print("✓ 点击 Not My Vibe 按钮")
                time.sleep(25)
                page.screenshot(path='/tmp/after_not_my_vibe.png', full_page=True)
                new_recommendations = page.locator('[class*="SongCard"]').count()
                print(f"✓ 换一批后找到 {new_recommendations} 个推荐歌曲")
        else:
            print("✗ 未找到 Not My Vibe 按钮")
        
        print("\n=== 测试 6: 访问管理员后台 ===")
        page.goto('http://localhost:3000/admin')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='/tmp/admin_login.png', full_page=True)
        print("✓ 管理员登录页截图已保存")
        
        password_input = page.locator('input[type="password"]').first
        password_input.fill('admin123')
        
        login_button = page.locator('button:has-text("解锁访问")').first
        login_button.click()
        time.sleep(2)
        
        page.screenshot(path='/tmp/admin_dashboard.png', full_page=True)
        print("✓ 管理员后台截图已保存")
        
        print("\n=== 测试 7: 检查游客会话统计 ===")
        stats_tab = page.locator('button:has-text("使用统计")').first
        if stats_tab.is_visible():
            stats_tab.click()
            time.sleep(2)
            page.screenshot(path='/tmp/admin_stats.png', full_page=True)
            print("✓ 统计页面截图已保存")
            
            guest_stats = page.locator('text=游客会话统计').first
            if guest_stats.is_visible():
                print("✓ 找到游客会话统计模块")
            else:
                print("✗ 未找到游客会话统计模块")
        
        print("\n=== 测试完成 ===")
        print("所有截图已保存到 /tmp/ 目录")
        
        time.sleep(2)
        browser.close()

if __name__ == '__main__':
    test_aiplaymusic()
