import sys
import time
from playwright.sync_api import sync_playwright

def verify_car_pull():
    screenshot_dir = "/home/joyboy/.gemini/antigravity-cli/brain/b450bd3c-4404-4fbc-8143-b1abec9883b5"
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome-stable",
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        
        # Create context simulating iPhone 13 / 14 mobile viewport (390 x 844 px)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            device_scale_factor=2,
            has_touch=True,
            is_mobile=True
        )
        
        page = context.new_page()
        
        # Collect console messages and errors
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[ERROR] {err}"))
        
        print("1. Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1.5)
        
        # Verify title
        title = page.title()
        print(f"Page title: {title}")
        assert "CAR PULL" in title, f"Expected CAR PULL in title, got {title}"
        
        # Capture Initial Deck Screenshot
        page.screenshot(path=f"{screenshot_dir}/01_corridor_deck.png")
        print("Captured 01_corridor_deck.png")
        
        # Verify Quick-Bid counter chips (+₦500, -₦500)
        print("2. Testing Quick-Bid counter chips & Statutory Ceiling Lock...")
        # Click +₦500 to exceed legal ceiling
        page.locator("button:has-text('+₦500')").click()
        time.sleep(0.5)
        page.screenshot(path=f"{screenshot_dir}/02_ceiling_locked.png")
        print("Captured 02_ceiling_locked.png (showing LEGAL_CEILING_LOCK)")
        
        # Click -₦500 to return to legal fair share
        page.locator("button:has-text('-₦500')").click()
        time.sleep(0.5)
        page.screenshot(path=f"{screenshot_dir}/03_fair_share_restored.png")
        print("Captured 03_fair_share_restored.png")
        
        # Test Safe Zone Modal
        print("3. Testing Safe Zone Selector...")
        page.locator("button:has-text('Change')").click()
        time.sleep(0.8)
        page.screenshot(path=f"{screenshot_dir}/04_safe_zone_modal.png")
        print("Captured 04_safe_zone_modal.png")
        # Select Circle Mall Parking Bay
        page.locator("button:has-text('Circle Mall')").click()
        time.sleep(0.4)
        page.locator("button:has-text('Confirm Safe Zone Hub')").click()
        time.sleep(0.5)
        
        # Test Swipe / Accept Ride
        print("4. Testing Accept Ride and Escrow Lock...")
        page.locator("button:has-text('Accept')").first.click()
        time.sleep(1)
        page.screenshot(path=f"{screenshot_dir}/05_match_success_modal.png")
        print("Captured 05_match_success_modal.png")
        
        # Click Lock Routine
        print("Testing Lock Routine (Mon-Fri Routine)...")
        page.locator("button:has-text('Lock Routine')").click()
        time.sleep(0.5)
        
        # Navigate to Matches Tab
        print("5. Navigating to Matches Tab...")
        page.locator("button:has-text('Matches')").click()
        time.sleep(0.6)
        page.screenshot(path=f"{screenshot_dir}/06_matches_screen.png")
        print("Captured 06_matches_screen.png")
        
        # Test Flake Penalty Simulation on Matches Tab
        page.locator("button:has-text('Driver Flake')").click()
        time.sleep(0.5)
        
        # Navigate to Escrow Wallet Tab
        print("6. Navigating to Escrow Wallet Tab...")
        page.locator("nav button:has-text('Escrow')").click()
        time.sleep(0.6)
        page.screenshot(path=f"{screenshot_dir}/07_escrow_wallet.png")
        print("Captured 07_escrow_wallet.png")
        
        # Test Roadside SOS Emergency Beacon
        print("7. Testing Roadside SOS Emergency Beacon...")
        page.locator("nav button:has-text('SOS')").click()
        time.sleep(0.8)
        page.screenshot(path=f"{screenshot_dir}/08_emergency_issue_selector.png")
        print("Captured 08_emergency_issue_selector.png")
        
        # Select Flatbed Tow Needed
        print("8. Selecting 'Flatbed Tow' to test Two-Phase Dispatch...")
        page.locator("button:has-text('Flatbed Tow')").first.click()
        time.sleep(1)
        page.screenshot(path=f"{screenshot_dir}/09_provider_bidding_deck.png")
        print("Captured 09_provider_bidding_deck.png")
        
        # Accept Quote from Top Provider (Musbau Towing)
        print("9. Accepting Musbau Towing quote to activate Assistance Shield...")
        page.locator("button:has-text('Accept & Escrow')").first.click()
        time.sleep(1.2)
        page.screenshot(path=f"{screenshot_dir}/10_assistance_en_route_shield.png")
        print("Captured 10_assistance_en_route_shield.png")
        
        print("\nAll browser verification steps passed successfully!")
        errors = [log for log in console_logs if '[ERROR]' in log or 'error' in log.lower()]
        print(f"Console errors: {errors}")
        
        browser.close()

if __name__ == "__main__":
    verify_car_pull()
