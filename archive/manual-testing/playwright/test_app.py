from playwright.sync_api import sync_playwright
import time

def test_aiplaymusic():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("=== 测试开始 ===\n")
        
        # 1. 访问应用
        print("1. 访问 http://localhost:3000")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/tmp/test_01_homepage.png', full_page=True)
        print("   ✓ 首页加载成功")
        
        # 2. 检查 Logo
        print("\n2. 检查 Logo")
        logo = page.locator('text=AiPlayMusic').first
        if logo.is_visible():
            print("   ✓ AiPlayMusic Logo 显示正常")
        else:
            print("   ✗ Logo 未找到")
        
        # 3. 点击 AI 推荐
        print("\n3. 点击 AI 推荐按钮")
        ai_button = page.locator('button:has-text("AI 推荐")').first
        ai_button.click()
        time.sleep(2)
        page.screenshot(path='/tmp/test_02_ai_panel.png', full_page=True)
        print("   ✓ AI 面板打开")
        
        # 4. 点击情境卡片
        print("\n4. 点击情境卡片")
        mood_card = page.locator('text=深夜 emo').first
        if mood_card.is_visible():
            mood_card.click()
            time.sleep(3)
            print("   ✓ 情境卡片点击成功")
        
        # 5. 等待 AI 回复
        print("\n5. 等待 AI 回复...")
        time.sleep(5)
        page.screenshot(path='/tmp/test_03_ai_response.png', full_page=True)
        
        # 6. 检查播放器按钮
        print("\n6. 检查播放器控制按钮")
        prev_btn = page.locator('svg.lucide-skip-back').first
        next_btn = page.locator('svg.lucide-skip-forward').first
        
        print(f"   上一首按钮: {'✓ 存在' if prev_btn.count() > 0 else '✗ 不存在'}")
        print(f"   下一首按钮: {'✓ 存在' if next_btn.count() > 0 else '✗ 不存在'}")
        
        print("\n=== 测试完成 ===")
        print("截图已保存到 /tmp/test_*.png")
        
        time.sleep(2)
        browser.close()

if __name__ == '__main__':
    test_aiplaymusic()
