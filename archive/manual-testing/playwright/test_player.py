from playwright.sync_api import sync_playwright
import time

def test_player():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("访问应用...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        print("截图：初始状态")
        page.screenshot(path='/tmp/01_initial.png', full_page=True)
        
        print("点击 AI 推荐按钮...")
        ai_button = page.locator('text=AI 推荐').first
        if ai_button.is_visible():
            ai_button.click()
            time.sleep(2)
            page.screenshot(path='/tmp/02_ai_panel.png', full_page=True)
        
        print("检查播放器控制按钮...")
        play_button = page.locator('button:has-text("播放")').first
        prev_button = page.locator('svg.lucide-skip-back').first
        next_button = page.locator('svg.lucide-skip-forward').first
        
        print(f"播放按钮可见: {play_button.is_visible() if play_button.count() > 0 else False}")
        print(f"上一首按钮可见: {prev_button.is_visible() if prev_button.count() > 0 else False}")
        print(f"下一首按钮可见: {next_button.is_visible() if next_button.count() > 0 else False}")
        
        print("检查音乐卡片...")
        song_cards = page.locator('[class*="SongCard"]').all()
        print(f"找到 {len(song_cards)} 个音乐卡片")
        
        print("截图：最终状态")
        page.screenshot(path='/tmp/03_final.png', full_page=True)
        
        print("\n测试完成！截图保存在 /tmp/")
        browser.close()

if __name__ == '__main__':
    test_player()
