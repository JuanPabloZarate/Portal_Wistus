"""
SUITE DE PRUEBAS DE ESTRÉS ADVERSARIAL Y MANIPULACIÓN DOM
Objetivo: landing.html (Fraternidad Tinkus Wistus - Carnaval de Oruro 2027 - Monte Style)
Ejecución: Selenium Headless Chrome + HTTP Server local
"""

import http.server
import json
import os
import socketserver
import sys
import threading
import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options


PORT = 8991
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def log_message(self, format, *args):
        pass


class AdversarialStressTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        socketserver.TCPServer.allow_reuse_address = True
        cls.httpd = socketserver.TCPServer(('127.0.0.1', PORT), QuietHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()

        options = Options()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1440,900')
        options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(3)
        cls.base_url = f'http://127.0.0.1:{PORT}/landing.html'

    @classmethod
    def tearDownClass(cls):
        try:
            cls.driver.quit()
        except Exception:
            pass
        try:
            cls.httpd.shutdown()
            cls.httpd.server_close()
        except Exception:
            pass

    def setUp(self):
        self.driver.get(self.base_url)
        time.sleep(0.3)

    # =========================================================================
    # SECCIÓN 1: FORM SUBMISSION EDGE CASES
    # =========================================================================

    def test_enquire_form_empty_fields_constraint(self):
        """1.1 Verifica que el formulario de postulación rechace el envío si faltan campos obligatorios."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Machas');")
        time.sleep(0.2)

        drawer = driver.find_element(By.ID, "enquire")
        self.assertTrue(drawer.get_attribute("open") is not None)

        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")
        submit_btn.click()

        feedback = driver.find_element(By.ID, "enquire-feedback")
        self.assertIn("hidden", feedback.get_attribute("class"), "Feedback no debe aparecer ante campos vacíos.")

    def test_enquire_form_whitespace_only_vulnerability(self):
        """1.2 Evalúa vulnerabilidad: nombres/apellidos con sólo espacios son aceptados por falta de validación JS."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Machas');")
        time.sleep(0.2)

        nombre_input = driver.find_element(By.ID, "enquire-nombre")
        apellidos_input = driver.find_element(By.ID, "enquire-apellidos")
        telefono_input = driver.find_element(By.ID, "enquire-telefono")
        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")
        feedback = driver.find_element(By.ID, "enquire-feedback")

        # Inyectar espacios en blanco exclusivamente
        nombre_input.send_keys("     ")
        apellidos_input.send_keys("     ")
        telefono_input.send_keys("+591 76543210")
        submit_btn.click()
        time.sleep(0.3)

        # Empíricamente se demuestra que trim() se ejecuta pero no valida !nombre ni !apellidos
        feedback_shown = "hidden" not in feedback.get_attribute("class")
        self.assertTrue(feedback_shown, "HALLAZGO ADVERSARIAL: Se aceptan nombres vacíos con sólo espacios.")

    def test_enquire_phone_pattern_boundaries(self):
        """1.3 Prueba los límites de validación de teléfonos bolivianos (+591, 7 a 15 dígitos)."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Sambos');")
        time.sleep(0.2)

        nombre_input = driver.find_element(By.ID, "enquire-nombre")
        apellidos_input = driver.find_element(By.ID, "enquire-apellidos")
        telefono_input = driver.find_element(By.ID, "enquire-telefono")
        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")

        # Caso A: Menos de 7 dígitos numéricos
        nombre_input.send_keys("Prueba")
        apellidos_input.send_keys("Test")
        telefono_input.send_keys("123456")
        submit_btn.click()
        time.sleep(0.3)

        try:
            alert = driver.switch_to.alert
            alert_text = alert.text
            alert.accept()
            self.assertIn("válido de Bolivia", alert_text)
        except Exception:
            self.fail("Se esperaba alerta ante teléfono < 7 dígitos.")

        # Caso B: Más de 15 dígitos numéricos
        telefono_input.clear()
        telefono_input.send_keys("1234567890123456")
        submit_btn.click()
        time.sleep(0.3)

        try:
            alert = driver.switch_to.alert
            alert_text = alert.text
            alert.accept()
            self.assertIn("válido de Bolivia", alert_text)
        except Exception:
            self.fail("Se esperaba alerta ante teléfono > 15 dígitos.")

        # Caso C: Teléfono válido boliviano (+591 76543210)
        telefono_input.clear()
        telefono_input.send_keys("+591 76543210")
        submit_btn.click()
        time.sleep(0.4)

        feedback = driver.find_element(By.ID, "enquire-feedback")
        self.assertNotIn("hidden", feedback.get_attribute("class"))

    def test_enquire_xss_and_special_characters(self):
        """1.4 Verifica la resistencia ante caracteres especiales, comillas y payloads XSS."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Imillas');")
        time.sleep(0.2)

        nombre_input = driver.find_element(By.ID, "enquire-nombre")
        apellidos_input = driver.find_element(By.ID, "enquire-apellidos")
        telefono_input = driver.find_element(By.ID, "enquire-telefono")
        mensaje_input = driver.find_element(By.ID, "enquire-mensaje")
        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")

        nombre_input.send_keys("<script>window.XSS_EXEC=true;</script> 🇧🇴")
        apellidos_input.send_keys("O'Connor & Quispe \"-- 💃🔥")
        telefono_input.send_keys("+591 (2) 2415566")
        mensaje_input.send_keys("<img src=x onerror=\"window.XSS_EXEC=true\"> Inyección &amp; test")

        submit_btn.click()
        time.sleep(0.4)

        xss_state = driver.execute_script("return window.XSS_EXEC;")
        self.assertIsNone(xss_state, "No debe haber ejecución de código XSS.")

    def test_enquire_extreme_payload_length(self):
        """1.5 Prueba el procesamiento de cadenas masivas (~10,000 caracteres) sin congelamiento de UI."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Ñaupas');")
        time.sleep(0.2)

        nombre_input = driver.find_element(By.ID, "enquire-nombre")
        apellidos_input = driver.find_element(By.ID, "enquire-apellidos")
        telefono_input = driver.find_element(By.ID, "enquire-telefono")
        mensaje_input = driver.find_element(By.ID, "enquire-mensaje")
        submit_btn = driver.find_element(By.ID, "btn-submit-enquire")

        long_string = "TinkusWistus2027_" * 600
        driver.execute_script("arguments[0].value = arguments[1];", nombre_input, long_string)
        apellidos_input.send_keys("Apellido")
        telefono_input.send_keys("+591 71234567")
        driver.execute_script("arguments[0].value = arguments[1];", mensaje_input, long_string)

        submit_btn.click()
        time.sleep(0.4)

        feedback = driver.find_element(By.ID, "enquire-feedback")
        self.assertNotIn("hidden", feedback.get_attribute("class"))

    def test_enquire_timer_race_condition(self):
        """1.6 Evalúa condición de carrera: reapertura del drawer antes del timeout de 3.5s provoca cierre intempestivo."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Machas');")
        time.sleep(0.2)

        driver.find_element(By.ID, "enquire-nombre").send_keys("Carlos")
        driver.find_element(By.ID, "enquire-apellidos").send_keys("Mendoza")
        driver.find_element(By.ID, "enquire-telefono").send_keys("+591 76543210")
        driver.find_element(By.ID, "btn-submit-enquire").click()

        # Cerrar manualmente de inmediato
        time.sleep(0.3)
        driver.execute_script("closeEnquireDrawer();")
        drawer = driver.find_element(By.ID, "enquire")
        self.assertIsNone(drawer.get_attribute("open"))

        # Reabrir 0.5s después
        time.sleep(0.5)
        driver.execute_script("openEnquireDrawer('Sambos');")
        self.assertTrue(drawer.get_attribute("open") is not None)

        # Esperar a que el setTimeout de 3.5s original expire
        time.sleep(3.2)
        # El timeout previo no fue cancelado con clearTimeout(), por lo que cierra el drawer
        was_closed_by_orphan_timer = drawer.get_attribute("open") is None
        self.assertTrue(was_closed_by_orphan_timer, "HALLAZGO: Timer huérfano de 3.5s cierra el drawer intempestivamente.")

    def test_newsletter_email_browser_validation(self):
        """1.7 Verifica la validación del formulario de boletín en el footer ante clicks reales."""
        driver = self.driver
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.0)

        email_input = driver.find_element(By.ID, "subscribe-email")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "#subscribe-form button")
        feedback = driver.find_element(By.ID, "subscribe-feedback")

        # Click sin email
        submit_btn.click()
        time.sleep(0.3)
        self.assertIn("hidden", feedback.get_attribute("class"))

        # Click con email sin arroba
        email_input.send_keys("correosinformato")
        submit_btn.click()
        time.sleep(0.3)
        self.assertIn("hidden", feedback.get_attribute("class"))

        # Click con email válido
        email_input.clear()
        email_input.send_keys("contacto@tinkuswistus.bo")
        submit_btn.click()
        time.sleep(0.3)
        self.assertNotIn("hidden", feedback.get_attribute("class"))

    # =========================================================================
    # SECCIÓN 2: EVENT LISTENER ROBUSTNESS
    # =========================================================================

    def test_menu_drawer_zindex_interception_finding(self):
        """2.1 Demuestra que una vez abierto #menu-drawer (z-50), el botón btn-mobile-menu (z-40) queda interceptado."""
        driver = self.driver
        toggle_btn = driver.find_element(By.ID, "btn-mobile-menu")
        menu_drawer = driver.find_element(By.ID, "menu-drawer")

        # Primer click abre el menú drawer
        toggle_btn.click()
        time.sleep(0.2)
        self.assertIn("menu-drawer--open", menu_drawer.get_attribute("class"))

        # Intento de click con Selenium sobre btn-mobile-menu para cerrarlo
        # Esperamos ElementClickInterceptedException porque menu-drawer (z-50 fixed inset-0) cubre la cabecera (z-40)
        from selenium.common.exceptions import ElementClickInterceptedException
        try:
            toggle_btn.click()
            intercepted = False
        except ElementClickInterceptedException:
            intercepted = True

        self.assertTrue(intercepted, "HALLAZGO: btn-mobile-menu queda tapado por menu-drawer al abrirse.")
        # Limpieza mediante botón de cierre explícito del drawer
        driver.find_element(By.ID, "btn-menu-drawer-close").click()

    def test_menu_drawer_escape_key_gap(self):
        """2.2 Demuestra que presionar ESC no cierra #menu-drawer porque es un div sin listener keydown."""
        driver = self.driver
        body = driver.find_element(By.TAG_NAME, "body")
        menu_drawer = driver.find_element(By.ID, "menu-drawer")

        driver.execute_script("openMenuDrawer();")
        time.sleep(0.2)
        self.assertIn("menu-drawer--open", menu_drawer.get_attribute("class"))
        self.assertIn("overflow-hidden", body.get_attribute("class"))

        # Presionar tecla Escape
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.3)

        # Permanece abierto y body bloqueado
        is_still_open = "menu-drawer--open" in menu_drawer.get_attribute("class")
        self.assertTrue(is_still_open, "HALLAZGO: #menu-drawer no escucha ESC, reteniendo overflow-hidden.")

        driver.execute_script("closeMenuDrawer();")

    def test_dialog_escape_key_compliance(self):
        """2.3 Verifica que los elementos <dialog> sí cierren adecuadamente con ESC y liberen el body."""
        driver = self.driver
        body = driver.find_element(By.TAG_NAME, "body")

        # Modal find-a-table
        driver.execute_script("openFindATableModal();")
        time.sleep(0.2)
        modal = driver.find_element(By.ID, "find-a-table")
        self.assertTrue(modal.get_attribute("open") is not None)

        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.3)
        self.assertIsNone(modal.get_attribute("open"))
        self.assertNotIn("overflow-hidden", body.get_attribute("class"))

        # Drawer enquire
        driver.execute_script("openEnquireDrawer('Machas');")
        time.sleep(0.2)
        drawer = driver.find_element(By.ID, "enquire")
        self.assertTrue(drawer.get_attribute("open") is not None)

        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.3)
        self.assertIsNone(drawer.get_attribute("open"))
        self.assertNotIn("overflow-hidden", body.get_attribute("class"))

    def test_dialog_backdrop_click_enquire(self):
        """2.4 Prueba el listener de click en backdrop en el drawer de postulación."""
        driver = self.driver
        driver.execute_script("openEnquireDrawer('Machas');")
        time.sleep(0.2)

        drawer = driver.find_element(By.ID, "enquire")
        self.assertTrue(drawer.get_attribute("open") is not None)

        # Click en coordenadas de backdrop (área exterior al drawer)
        res = driver.execute_script("""
            const dialog = document.getElementById('enquire');
            const evt = new MouseEvent('click', {
                clientX: 1000,
                clientY: 300,
                bubbles: true,
                cancelable: true,
                view: window
            });
            dialog.dispatchEvent(evt);
            return dialog.open;
        """)
        self.assertFalse(res, "Click en área exterior del diálogo debe cerrar el drawer.")

    def test_scroll_event_listener_toggles(self):
        """2.5 Prueba la reactividad del listener de scroll para alternar la clase .scrolled en la cabecera."""
        driver = self.driver
        header = driver.find_element(By.CSS_SELECTOR, "header[data-header]")

        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(0.5)
        self.assertNotIn("scrolled", header.get_attribute("class"))

        driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(0.5)
        self.assertIn("scrolled", header.get_attribute("class"))

        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(0.5)
        self.assertNotIn("scrolled", header.get_attribute("class"))

    # =========================================================================
    # SECCIÓN 3: CARD TILT & CAROUSEL CONTAINER RESPONSIVENESS
    # =========================================================================

    def test_card_3d_tilt_transformation_and_glare(self):
        """3.1 Verifica las matemáticas de rotación 3D y brillo especular de la credencial."""
        driver = self.driver
        card_container = driver.find_element(By.CSS_SELECTOR, "[data-gift-card-animation]")
        card = driver.find_element(By.CSS_SELECTOR, "[data-gift-card]")
        glare = card.find_element(By.CSS_SELECTOR, ".card-glare")

        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", card_container)
        time.sleep(0.3)

        # Simular mousemove sobre contenedor
        driver.execute_script("""
            const c = document.querySelector('[data-gift-card-animation]');
            const card = document.querySelector('[data-gift-card]');
            const rect = card.getBoundingClientRect();
            const evt = new MouseEvent('mousemove', {
                clientX: rect.left + 50,
                clientY: rect.top + 50,
                bubbles: true
            });
            c.dispatchEvent(evt);
        """)
        time.sleep(0.1)

        transform = card.get_attribute("style")
        self.assertIn("rotateX", transform)
        self.assertIn("rotateY", transform)

        glare_style = glare.get_attribute("style")
        self.assertIn("opacity: 1", glare_style)

        # Simular mouseleave
        driver.execute_script("""
            const c = document.querySelector('[data-gift-card-animation]');
            c.dispatchEvent(new MouseEvent('mouseleave'));
        """)
        time.sleep(0.1)

        transform_after = card.get_attribute("style")
        self.assertIn("rotateX(0deg)", transform_after)
        self.assertIn("rotateY(0deg)", transform_after)

    def test_multi_device_viewports_no_horizontal_overflow(self):
        """3.2 Prueba de estrés en 7 viewports responsive comprobando cero fuga de scroll horizontal."""
        driver = self.driver
        viewports = [
            (320, 568, "Mobile Ultra-compact"),
            (375, 667, "iPhone SE"),
            (414, 896, "iPhone XR/11"),
            (768, 1024, "iPad Portrait"),
            (1024, 768, "iPad Landscape"),
            (1440, 900, "Desktop HD"),
            (1920, 1080, "Desktop Full HD"),
        ]

        overflow_violations = []

        for width, height, name in viewports:
            driver.set_window_size(width, height)
            time.sleep(0.2)

            metrics = driver.execute_script("""
                return {
                    scrollWidth: document.documentElement.scrollWidth,
                    innerWidth: window.innerWidth
                };
            """)

            diff = metrics['scrollWidth'] - metrics['innerWidth']
            if diff > 1:
                overflow_violations.append((name, width, diff))

        self.assertEqual(len(overflow_violations), 0, f"Fuga de scroll horizontal detectada: {overflow_violations}")

    def test_carousel_containers_and_slides_integrity(self):
        """3.3 Verifica la estructura, visibilidad y slides de los carruseles de fotos y bloques."""
        driver = self.driver
        gallery_swiper = driver.find_element(By.ID, "gallery-swiper")
        bloques_swiper = driver.find_element(By.ID, "bloques-swiper")

        self.assertTrue(gallery_swiper.is_displayed())
        self.assertTrue(bloques_swiper.is_displayed())

        gallery_slides = gallery_swiper.find_elements(By.CSS_SELECTOR, ".swiper-slide")
        bloques_slides = bloques_swiper.find_elements(By.CSS_SELECTOR, ".swiper-slide")

        self.assertGreaterEqual(len(gallery_slides), 5)
        self.assertGreaterEqual(len(bloques_slides), 4)

    def test_fixed_bottom_bar_removed(self):
        """3.4 Verifica que la barra fija inferior esté completamente eliminada y las acciones se mantengan en el header."""
        driver = self.driver
        bottom_bars = driver.find_elements(By.ID, "fixed-bottom-bar")
        self.assertEqual(len(bottom_bars), 0, "La barra fija inferior debe estar eliminada en todas las resoluciones")
        
        # Verificar que el header superior mantenga las acciones
        header_portal = driver.find_elements(By.CSS_SELECTOR, "header a[href*='index.html']")
        self.assertGreaterEqual(len(header_portal), 1, "El header superior debe mantener el enlace al portal")
        header_postular = driver.find_elements(By.CSS_SELECTOR, "header button[data-open-enquire]")
        self.assertGreaterEqual(len(header_postular), 1, "El header superior debe mantener el botón postular")
        header_menu = driver.find_elements(By.CSS_SELECTOR, "header button[data-menu-drawer-toggle]")
        self.assertGreaterEqual(len(header_menu), 1, "El header superior debe mantener el botón de menú hamburguesa")

    def test_no_critical_console_errors(self):
        """3.5 Verifica que no existan errores críticos de consola o recursos 404 durante la ejecución."""
        driver = self.driver
        logs = driver.get_log("browser")
        severe_errors = [
            l for l in logs
            if l['level'] == 'SEVERE' and 'favicon.ico' not in l['message']
        ]
        self.assertEqual(len(severe_errors), 0, f"Errores severos detectados en consola: {severe_errors}")


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(AdversarialStressTestSuite)
    res = runner.run(suite)
    sys.exit(0 if res.wasSuccessful() else 1)
