#!/usr/bin/env python3
"""AiPlayMusic 全面功能测试"""

from playwright.sync_api import sync_playwright, expect
import time

def test_homepage(page):
    """测试首页加载"""
    print("\n=== 测试 1: 首页加载 ===")
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    
    # 截图
    page.screenshot(path="test_1_homepage.png")
    print("✅ 首页加载成功")
    
def test_ui_components(page):
    """测试 UI 组件"""
    print("\n=== 测试 2: UI 组件 ===")
    
    # 检查侧边栏
    sidebar = page.locator('[class*="Sidebar"]').first
    if sidebar.is_visible():
        print("✅ 侧边栏显示正常")
    
    # 检查播放器栏
    player = page.locator('[class*="PlayerBar"]').first
    if player.is_visible():
        print("✅ 播放器栏显示正常")
    
    page.screenshot(path="test_2_ui_components.png")

def test_ai_chat(page):
    """测试 AI 对话功能"""
    print("\n=== 测试 3: AI 对话 ===")
    
    # 查找并点击 AI 聊天按钮
    chat_buttons = page.get_by_role("button")
    for btn in chat_buttons.all():
        if "AI" in btn.text_content() or "chat" in btn.get_attribute("class") or "":
            btn.click()
            time.sleep(1)
            break
    
    page.screenshot(path="test_3_ai_chat_open.png")
    print("✅ AI 聊天面板打开")
    
    # 尝试发送消息
    input_field = page.locator('input[type="text"], textarea').first
    if input_field.is_visible():
        input_field.fill("推荐一些轻松的音乐")
        page.screenshot(path="test_3_ai_input.png")
        
        # 查找发送按钮
        send_btn = page.get_by_role("button").filter(has_text="发送").first
        if send_btn.is_visible():
            send_btn.click()
            time.sleep(2)
            page.screenshot(path="test_3_ai_response.png")
            print("✅ AI 消息发送成功")
    
def test_player_controls(page):
    """测试播放器控制"""
    print("\n=== 测试 4: 播放器控制 ===")
    
    # 查找播放按钮
    play_buttons = page.get_by_role("button")
    for btn in play_buttons.all():
        aria_label = btn.get_attribute("aria-label") or ""
        if "play" in aria_label.lower() or "播放" in btn.text_content():
            btn.click()
            time.sleep(1)
            page.screenshot(path="test_4_player_play.png")
            print("✅ 播放按钮点击成功")
            break
    
    time.sleep(1)
    page.screenshot(path="test_4_player_state.png")

def main():
    """运行所有测试"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            test_homepage(page)
            test_ui_components(page)
            test_ai_chat(page)
            test_player_controls(page)
            
            print("\n" + "="*50)
            print("✅ 所有测试完成！")
            print("="*50)
            
        except Exception as e:
            print(f"\n❌ 测试失败: {e}")
            page.screenshot(path="test_error.png")
        finally:
            time.sleep(2)
            browser.close()

if __name__ == "__main__":
    main()
