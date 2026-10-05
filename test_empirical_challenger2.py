"""
Comprehensive Empirical & Adversarial Stress Test Suite
Challenger: challenger_2 (teamwork_preview_challenger)
Target: Tinkus Wistus - Carnaval de Oruro 2027 Editorial Landing Page & Bidirectional Integration
"""

import sys
import os
import time
import json
import threading
import http.server
import socketserver
from pathlib import Path
from PIL import Image
import xml.etree.ElementTree as ET

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

ROOT_DIR = Path(__file__).resolve().parent
PORT = 8089

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_http_server():
    os.chdir(str(ROOT_DIR))
    try:
        httpd = socketserver.TCPServer(("", PORT), QuietHandler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        time.sleep(0.4)
        return httpd
    except OSError:
        # Port already in use from previous process
        return None

def get_driver(width=1440, height=900, is_mobile=False):
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    
    if is_mobile:
        mobile_emulation = {
            "deviceMetrics": {"width": width, "height": height, "pixelRatio": 2.0},
            "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }
        opts.add_experimental_option("mobileEmulation", mobile_emulation)
    else:
        opts.add_argument(f"--window-size={width},{height}")
    
    return webdriver.Chrome(options=opts)

def run_stress_suite():
    server = start_http_server()
    base_url = f"http://localhost:{PORT}"
    
    report = {
        "metadata": {
            "agent": "challenger_2",
            "role": "critic, specialist",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "project_root": str(ROOT_DIR)
        },
        "tests": {
            "T1_bidirectional_flows": {},
            "T2_asset_integrity": {},
            "T3_viewport_layouts": {},
            "T4_modal_drawer_interactions": {},
            "T5_block_preselection": {},
            "T6_3d_card_physics": {},
            "T7_form_validation_adversarial": {},
            "T8_cdn_offline_resilience": {},
            "T9_performance_and_dom_metrics": {},
            "T10_browser_console_errors": {}
        },
        "failures": [],
        "warnings": [],
        "verdict": "UNKNOWN"
    }

    # =========================================================================
    # T1: BIDIRECTIONAL FLOWS (landing.html <-> index.html)
    # =========================================================================
    print(">>> [T1] Verifying Bidirectional Flows...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)

        # 1. Outbound from landing.html
        outbound_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='index.html']")
        outbound_targets = [a.get_attribute("href") for a in outbound_links]
        
        # Test clicking Header Portal Fraterno
        header_link = driver.find_element(By.CSS_SELECTOR, "a.nav-portal-btn")
        driver.execute_script("arguments[0].click();", header_link)
        time.sleep(1)
        landed_on_index = "index.html" in driver.current_url
        
        # 2. Inbound from index.html (Login view button)
        return_link_login = driver.find_element(By.CSS_SELECTOR, "a[href='landing.html']")
        return_text = return_link_login.text
        driver.execute_script("arguments[0].click();", return_link_login)
        time.sleep(1)
        returned_to_landing = "landing.html" in driver.current_url

        # 3. Test Header Portal navigation to index.html
        header_portal_btn = driver.find_element(By.CSS_SELECTOR, "header a[href*='index.html']")
        driver.execute_script("arguments[0].click();", header_portal_btn)
        time.sleep(1)
        modal_landed_on_index = "index.html" in driver.current_url

        # 4. Inbound from index.html (Footer link)
        return_link_footer = driver.find_element(By.CSS_SELECTOR, ".login-card-main a[href='landing.html']")
        driver.execute_script("arguments[0].click();", return_link_footer)
        time.sleep(1)
        returned_again = "landing.html" in driver.current_url

        # 5. Check index.html inbound links total count and locations
        driver.get(f"{base_url}/index.html")
        time.sleep(0.5)
        inbound_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='landing.html']")
        inbound_details = [
            {"text": a.text.strip(), "href": a.get_attribute("href"), "parent_tag": a.find_element(By.XPATH, "..").tag_name}
            for a in inbound_links
        ]

        report["tests"]["T1_bidirectional_flows"] = {
            "outbound_count": len(outbound_links),
            "outbound_targets": outbound_targets,
            "header_click_to_index": landed_on_index,
            "login_click_to_landing": returned_to_landing,
            "modal_click_to_index": modal_landed_on_index,
            "footer_click_to_landing": returned_again,
            "inbound_count_in_index": len(inbound_links),
            "inbound_details": inbound_details,
            "round_trip_success": landed_on_index and returned_to_landing and modal_landed_on_index and returned_again
        }
        if not report["tests"]["T1_bidirectional_flows"]["round_trip_success"]:
            report["failures"].append("Bidirectional flow cycle failed on one or more paths")

    except Exception as e:
        report["tests"]["T1_bidirectional_flows"]["error"] = str(e)
        report["failures"].append(f"T1 Bidirectional flow exception: {e}")
    finally:
        driver.quit()

    # =========================================================================
    # T2: ASSET INTEGRITY (Existence, Validity, Sizes, Render)
    # =========================================================================
    print(">>> [T2] Verifying Local Assets & Formats...")
    assets_to_test = [
        "assets/img/wistus-banner.jpg",
        "assets/img/wistus-badge.svg",
        "assets/img/wistus-logo-w.svg",
        "assets/img/wistus-escudo.svg",
        "assets/img/perfil-pagina.png",
    ]
    assets_data = {}
    for rel in assets_to_test:
        fpath = ROOT_DIR / rel
        exists = fpath.exists()
        size = fpath.stat().st_size if exists else 0
        valid = False
        info = {}
        if exists and size > 0:
            if rel.endswith(".svg"):
                try:
                    tree = ET.parse(fpath)
                    root = tree.getroot()
                    valid = "svg" in root.tag.lower()
                    info = {"tag": root.tag, "viewBox": root.attrib.get("viewBox", "N/A")}
                except Exception as ex:
                    valid = False
                    info = {"error": str(ex)}
            elif rel.endswith((".jpg", ".png")):
                try:
                    with Image.open(fpath) as im:
                        valid = True
                        info = {"format": im.format, "dimensions": im.size, "mode": im.mode}
                except Exception as ex:
                    valid = False
                    info = {"error": str(ex)}
        assets_data[rel] = {"exists": exists, "size_bytes": size, "valid": valid, "info": info}
        if not (exists and size > 0 and valid):
            report["failures"].append(f"Asset failed integrity: {rel} (exists={exists}, size={size}, valid={valid})")
    
    # Check browser rendering of all images
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)
        img_elements = driver.find_elements(By.TAG_NAME, "img")
        unrendered = []
        for img in img_elements:
            src = img.get_attribute("src")
            nw = driver.execute_script("return arguments[0].naturalWidth;", img)
            nh = driver.execute_script("return arguments[0].naturalHeight;", img)
            if nw == 0 or nh == 0:
                unrendered.append({"src": src, "naturalWidth": nw, "naturalHeight": nh})
        assets_data["browser_render"] = {
            "total_images_in_dom": len(img_elements),
            "unrendered_count": len(unrendered),
            "unrendered": unrendered
        }
        if unrendered:
            report["failures"].append(f"Unrendered images detected in browser: {unrendered}")
    finally:
        driver.quit()

    report["tests"]["T2_asset_integrity"] = assets_data

    # =========================================================================
    # T3: VIEWPORT LAYOUT INTEGRITY (375px mobile, 768px tablet, 1440px desktop)
    # =========================================================================
    print(">>> [T3] Stress-Testing Viewports (375px, 768px, 1440px, 320px)...")
    viewports = [
        {"name": "mobile_375", "w": 375, "h": 667, "is_mobile": True},
        {"name": "tablet_768", "w": 768, "h": 1024, "is_mobile": False},
        {"name": "desktop_1440", "w": 1440, "h": 900, "is_mobile": False},
        {"name": "adversarial_320", "w": 320, "h": 568, "is_mobile": True}
    ]
    vp_outcomes = {}
    for vp in viewports:
        w, h, is_mob, vname = vp["w"], vp["h"], vp["is_mobile"], vp["name"]
        driver = get_driver(w, h, is_mobile=is_mob)
        v_data = {}
        try:
            driver.get(f"{base_url}/landing.html")
            time.sleep(1)

            inner_w = driver.execute_script("return window.innerWidth;")
            doc_scroll_w = driver.execute_script("return document.documentElement.scrollWidth;")
            body_scroll_w = driver.execute_script("return document.body.scrollWidth;")
            
            # Horizontal overflow check
            overflow = (doc_scroll_w > inner_w) or (body_scroll_w > inner_w)
            v_data["overflow"] = {
                "inner_w": inner_w,
                "doc_scroll_w": doc_scroll_w,
                "body_scroll_w": body_scroll_w,
                "has_overflow": overflow
            }
            if overflow:
                report["failures"].append(f"Horizontal scroll overflow at {vname}: innerWidth={inner_w}, scrollWidth={doc_scroll_w}")

            # 3D Card sizing check relative to inner_w
            card_rect = driver.execute_script("""
                const c = document.getElementById('card-3d-wistus');
                const r = c.getBoundingClientRect();
                return {width: r.width, height: r.height, left: r.left, right: r.right};
            """)
            card_fits = (card_rect["right"] <= inner_w + 1) and (card_rect["left"] >= 0)
            v_data["card_3d_fits"] = {
                "rect": card_rect,
                "fits": card_fits
            }
            if not card_fits:
                report["failures"].append(f"3D Card violates viewport at {vname}: rect={card_rect}, innerWidth={inner_w}")

            # Header scroll transition check
            header = driver.find_element(By.CSS_SELECTOR, "header[data-header]")
            initial_scrolled = "scrolled" in header.get_attribute("class")
            driver.execute_script("window.scrollTo(0, 150);")
            time.sleep(0.3)
            after_scrolled = "scrolled" in header.get_attribute("class")
            v_data["header_scroll"] = {
                "initial_scrolled": initial_scrolled,
                "scrolled_at_150px": after_scrolled,
                "works": (not initial_scrolled) and after_scrolled
            }
            if not ((not initial_scrolled) and after_scrolled):
                report["failures"].append(f"Header scroll detection failed at {vname}")

            # Bottom action bar should NOT be present (removed across all screen sizes)
            bars = driver.find_elements(By.CSS_SELECTOR, "[data-find-a-table-btn]")
            bar_absent = (len(bars) == 0)
            v_data["fixed_bottom_bar"] = {
                "absent": bar_absent
            }
            if not bar_absent:
                report["failures"].append(f"Bottom action bar unexpectedly displayed at {vname}")

        except Exception as ex:
            v_data["error"] = str(ex)
            report["failures"].append(f"Viewport test exception at {vname}: {ex}")
        finally:
            driver.quit()
        vp_outcomes[vname] = v_data
    report["tests"]["T3_viewport_layouts"] = vp_outcomes

    # =========================================================================
    # T4: MODAL & DRAWER STACKING AND ESCAPE HANDLING
    # =========================================================================
    print(">>> [T4] Testing Modal & Drawer Transitions and Escape Key...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)

        find_modal = driver.find_element(By.ID, "find-a-table")
        enquire_drawer = driver.find_element(By.ID, "enquire")

        # 1. Open Find-a-Table Modal via JS showModal
        driver.execute_script("arguments[0].showModal(); document.body.classList.add('overflow-hidden');", find_modal)
        time.sleep(0.4)
        m_open1 = driver.execute_script("return arguments[0].open;", find_modal)
        body_locked1 = "overflow-hidden" in driver.find_element(By.TAG_NAME, "body").get_attribute("class")

        # 2. Press ESC to close
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.4)
        m_closed1 = not driver.execute_script("return arguments[0].open;", find_modal)
        body_unlocked1 = "overflow-hidden" not in driver.find_element(By.TAG_NAME, "body").get_attribute("class")

        # 3. Transition: Open Find-a-Table Modal, then click "Postular" inside it
        driver.execute_script("arguments[0].showModal(); document.body.classList.add('overflow-hidden');", find_modal)
        time.sleep(0.4)
        postular_inside_modal = driver.find_element(By.CSS_SELECTOR, "#find-a-table button[data-open-enquire]")
        driver.execute_script("arguments[0].click();", postular_inside_modal)
        time.sleep(0.5)

        m_closed2 = not driver.execute_script("return arguments[0].open;", find_modal)
        drawer_open1 = driver.execute_script("return arguments[0].open;", enquire_drawer)

        # 4. Close drawer via ESC
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.4)
        drawer_closed1 = not driver.execute_script("return arguments[0].open;", enquire_drawer)
        body_unlocked2 = "overflow-hidden" not in driver.find_element(By.TAG_NAME, "body").get_attribute("class")

        report["tests"]["T4_modal_drawer_interactions"] = {
            "modal_opens": m_open1,
            "body_locks_on_modal": body_locked1,
            "escape_closes_modal": m_closed1,
            "body_unlocks_after_modal": body_unlocked1,
            "modal_to_drawer_transition_closes_modal": m_closed2,
            "modal_to_drawer_transition_opens_drawer": drawer_open1,
            "escape_closes_drawer": drawer_closed1,
            "body_unlocks_after_drawer": body_unlocked2,
            "success": m_open1 and m_closed1 and m_closed2 and drawer_open1 and drawer_closed1
        }
        if not report["tests"]["T4_modal_drawer_interactions"]["success"]:
            report["failures"].append("Modal/Drawer stacking or Escape interaction failed")

    except Exception as ex:
        report["tests"]["T4_modal_drawer_interactions"]["error"] = str(ex)
        report["failures"].append(f"T4 Modal/Drawer exception: {ex}")
    finally:
        driver.quit()

    # =========================================================================
    # T5: BLOQUE PRESELECTION IN ENQUIRE DRAWER
    # =========================================================================
    print(">>> [T5] Testing Bloque Postular Preselection Flow...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)

        bloques = ["Machas", "Imillas", "Ñaupas", "Sambos"]
        preselection_results = {}
        for b_name in bloques:
            # Find the button for this bloque
            btn = driver.find_element(By.CSS_SELECTOR, f"button[data-open-enquire][data-bloque='{b_name}']")
            driver.execute_script("arguments[0].click();", btn)
            time.sleep(0.3)
            
            # Check select dropdown value
            select = driver.find_element(By.ID, "enquire-bloque")
            selected_val = select.get_attribute("value")
            is_match = (selected_val == b_name)
            preselection_results[b_name] = {"selected_val": selected_val, "match": is_match}
            
            # Close drawer
            close_btn = driver.find_element(By.ID, "btn-drawer-close")
            driver.execute_script("arguments[0].click();", close_btn)
            time.sleep(0.3)

        all_preselect_ok = all(v["match"] for v in preselection_results.values())
        report["tests"]["T5_block_preselection"] = {
            "results": preselection_results,
            "success": all_preselect_ok
        }
        if not all_preselect_ok:
            report["failures"].append("Bloque preselection failed for one or more blocks")

    except Exception as ex:
        report["tests"]["T5_block_preselection"]["error"] = str(ex)
        report["failures"].append(f"T5 Bloque preselection exception: {ex}")
    finally:
        driver.quit()

    # =========================================================================
    # T6: 3D CARD PHYSICS & TILT REACTION
    # =========================================================================
    print(">>> [T6] Testing 3D Credencial Tilt & Glare Physics...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)

        card_container = driver.find_element(By.ID, "gift-card-animation")
        card = driver.find_element(By.ID, "card-3d-wistus")
        glare = card.find_element(By.CLASS_NAME, "card-glare")

        # Initial transform
        t0 = driver.execute_script("return arguments[0].style.transform;", card)
        g0 = driver.execute_script("return arguments[0].style.opacity;", glare)

        # Trigger mousemove simulation via JavaScript event
        driver.execute_script("""
            const container = document.getElementById('gift-card-animation');
            const card = document.getElementById('card-3d-wistus');
            const rect = card.getBoundingClientRect();
            const event = new MouseEvent('mousemove', {
                clientX: rect.left + 50,
                clientY: rect.top + 30,
                bubbles: true
            });
            container.dispatchEvent(event);
        """)
        time.sleep(0.2)
        t_hover = driver.execute_script("return arguments[0].style.transform;", card)
        g_hover = driver.execute_script("return arguments[0].style.opacity;", glare)

        # Trigger mouseleave
        driver.execute_script("""
            const container = document.getElementById('gift-card-animation');
            const event = new MouseEvent('mouseleave', { bubbles: true });
            container.dispatchEvent(event);
        """)
        time.sleep(0.2)
        t_reset = driver.execute_script("return arguments[0].style.transform;", card)
        g_reset = driver.execute_script("return arguments[0].style.opacity;", glare)

        has_tilt_active = "rotate" in t_hover and t_hover != t0
        glare_activated = (g_hover == "1")
        transform_reset = "0deg" in t_reset
        glare_reset = (g_reset == "0")

        report["tests"]["T6_3d_card_physics"] = {
            "initial_transform": t0,
            "hover_transform": t_hover,
            "hover_glare_opacity": g_hover,
            "reset_transform": t_reset,
            "reset_glare_opacity": g_reset,
            "tilt_works": has_tilt_active,
            "glare_works": glare_activated,
            "reset_works": transform_reset and glare_reset,
            "success": has_tilt_active and glare_activated and transform_reset and glare_reset
        }
        if not report["tests"]["T6_3d_card_physics"]["success"]:
            report["failures"].append("3D card tilt/glare physics failed to trigger or reset properly")

    except Exception as ex:
        report["tests"]["T6_3d_card_physics"]["error"] = str(ex)
        report["failures"].append(f"T6 3D card physics exception: {ex}")
    finally:
        driver.quit()

    # =========================================================================
    # T7: FORM VALIDATION ADVERSARIAL TESTING
    # =========================================================================
    print(">>> [T7] Adversarially Stress-Testing Forms...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)

        # 1. Enquire form invalid phone (< 7 digits)
        join_btn = driver.find_element(By.ID, "btn-header-join")
        driver.execute_script("arguments[0].click();", join_btn)
        time.sleep(0.6)  # allow 400ms CSS transform transition to finish

        driver.find_element(By.ID, "enquire-nombre").send_keys("Pedro")
        driver.find_element(By.ID, "enquire-apellidos").send_keys("Mamani")
        driver.find_element(By.ID, "enquire-telefono").send_keys("123")  # too short!
        
        # Override alert to capture without blocking
        driver.execute_script("""
            window.__lastAlert = null;
            window.alert = function(msg) { window.__lastAlert = msg; };
        """)
        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")
        driver.execute_script("arguments[0].click();", submit_btn)
        time.sleep(0.3)
        
        alert_msg = driver.execute_script("return window.__lastAlert;")
        caught_short_phone = alert_msg is not None and "válido" in alert_msg

        # 2. Enquire form valid phone (+591 76543210)
        driver.find_element(By.ID, "enquire-telefono").clear()
        driver.find_element(By.ID, "enquire-telefono").send_keys("+591 76543210")
        driver.execute_script("arguments[0].click();", submit_btn)
        time.sleep(0.5)
        
        feedback_visible = driver.execute_script("""
            const f = document.getElementById('enquire-feedback');
            return f && !f.classList.contains('hidden');
        """)

        # Close enquire drawer to un-inert the background document
        driver.execute_script("""
            const d = document.getElementById('enquire');
            if (d && d.open) d.close();
            document.body.classList.remove('overflow-hidden');
        """)
        time.sleep(0.4)

        # 3. Newsletter form valid email
        email_input = driver.find_element(By.ID, "subscribe-email")
        driver.execute_script("arguments[0].scrollIntoView();", email_input)
        time.sleep(0.3)
        email_input.send_keys("test.usuario@tinkuswistus.bo")
        sub_btn = driver.find_element(By.CSS_SELECTOR, "#subscribe-form button[type='submit']")
        driver.execute_script("arguments[0].click();", sub_btn)
        time.sleep(0.4)
        sub_feedback_visible = driver.execute_script("""
            const f = document.getElementById('subscribe-feedback');
            return f && !f.classList.contains('hidden');
        """)

        report["tests"]["T7_form_validation_adversarial"] = {
            "invalid_phone_rejected": caught_short_phone,
            "valid_form_shows_feedback": feedback_visible,
            "newsletter_shows_feedback": sub_feedback_visible,
            "success": caught_short_phone and feedback_visible and sub_feedback_visible
        }
        if not report["tests"]["T7_form_validation_adversarial"]["success"]:
            report["failures"].append("Form validation did not reject short phone or display feedback correctly")

    except Exception as ex:
        report["tests"]["T7_form_validation_adversarial"]["error"] = str(ex)
        report["failures"].append(f"T7 form validation exception: {ex}")
    finally:
        driver.quit()

    # =========================================================================
    # T8: CDN OFFLINE & FALLBACK RESILIENCE
    # =========================================================================
    print(">>> [T8] Testing CDN Offline Resilience...")
    # Read HTML and verify inline style fallbacks and font declarations
    with open(ROOT_DIR / "landing.html", "r", encoding="utf-8") as f:
        html_text = f.read()
    
    has_font_fallbacks = (
        "Georgia" in html_text and
        "system-ui" in html_text and
        "monospace" in html_text
    )
    has_swiper_guard = "typeof Swiper !== 'undefined'" in html_text
    has_image_onerror = "onerror=" in html_text

    report["tests"]["T8_cdn_offline_resilience"] = {
        "font_family_fallbacks_present": has_font_fallbacks,
        "swiper_undefined_guard_present": has_swiper_guard,
        "image_error_fallback_present": has_image_onerror,
        "success": has_font_fallbacks and has_swiper_guard and has_image_onerror
    }
    if not report["tests"]["T8_cdn_offline_resilience"]["success"]:
        report["failures"].append("CDN fallbacks missing from landing.html")

    # =========================================================================
    # T9: PERFORMANCE & DOM METRICS
    # =========================================================================
    print(">>> [T9] Measuring DOM & Performance Metrics...")
    driver = get_driver(1440, 900)
    try:
        t_start = time.time()
        driver.get(f"{base_url}/landing.html")
        load_time = time.time() - t_start

        dom_nodes = driver.execute_script("return document.getElementsByTagName('*').length;")
        scripts_count = driver.execute_script("return document.getElementsByTagName('script').length;")
        stylesheets_count = driver.execute_script("return document.getElementsByTagName('link').length;")
        
        # Lighthouse-like navigation timing
        nav_timing = driver.execute_script("""
            const t = performance.getEntriesByType('navigation')[0];
            if (!t) return null;
            return {
                domContentLoaded: t.domContentLoadedEventEnd - t.startTime,
                loadComplete: t.loadEventEnd - t.startTime
            };
        """)

        report["tests"]["T9_performance_and_dom_metrics"] = {
            "load_time_seconds": round(load_time, 3),
            "dom_node_count": dom_nodes,
            "scripts_count": scripts_count,
            "stylesheets_count": stylesheets_count,
            "navigation_timing_ms": nav_timing,
            "dom_is_lean": dom_nodes < 800
        }
        if dom_nodes >= 1500:
            report["warnings"].append(f"High DOM node count: {dom_nodes}")

    except Exception as ex:
        report["tests"]["T9_performance_and_dom_metrics"]["error"] = str(ex)
    finally:
        driver.quit()

    # =========================================================================
    # T10: BROWSER CONSOLE LOGS & SEVERE ERRORS
    # =========================================================================
    print(">>> [T10] Capturing Browser Console Logs...")
    driver = get_driver(1440, 900)
    try:
        driver.get(f"{base_url}/landing.html")
        time.sleep(1)
        logs = driver.get_log("browser")
        severe = [l for l in logs if l.get("level") == "SEVERE"]
        report["tests"]["T10_browser_console_errors"] = {
            "total_logs": len(logs),
            "severe_count": len(severe),
            "severe_entries": severe
        }
        if severe:
            report["failures"].append(f"Severe console errors detected: {severe}")
    finally:
        driver.quit()

    # Final Verdict Calculation
    if len(report["failures"]) == 0:
        report["verdict"] = "APPROVE"
    else:
        report["verdict"] = "REJECT"

    # Save to disk
    result_path = ROOT_DIR / "adversarial_stress_report.json"
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "="*70)
    print(f"  ADVERSARIAL STRESS TEST VERDICT: {report['verdict']}")
    print(f"  Failures Count: {len(report['failures'])}")
    print(f"  Warnings Count: {len(report['warnings'])}")
    if report["failures"]:
        print("  FAILURES:")
        for fail in report["failures"]:
            print(f"    - {fail}")
    else:
        print("  ALL 10 EMPIRICAL & ADVERSARIAL TEST TIERS PASSED.")
    print("="*70 + "\n")
    return report

if __name__ == "__main__":
    run_stress_suite()
