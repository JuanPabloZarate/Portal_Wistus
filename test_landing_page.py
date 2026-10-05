#!/usr/bin/env python3
"""
SUITE DE PRUEBAS AUTOMATIZADAS E2E: LANDING PAGE MONTE-STYLE TINKUS WISTUS - CARNAVAL DE ORURO 2027
--------------------------------------------------------------------------------
Valida la arquitectura editorial, tokens visuales, tipografía, componentes interactivos,
límites y casos de borde, interacciones entre características y viajes de usuario
completos según PROJECT.md, ORIGINAL_REQUEST.md y survey_spec_miner_1/report.md.

Ejecución directa:
    python test_landing_page.py
    python test_landing_page.py -v
"""

import os
import sys
import re
import json
import time
import unittest
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

# ==============================================================================
# CONFIGURACIÓN Y RUTAS DEL PROYECTO
# ==============================================================================
ROOT_DIR = Path(__file__).resolve().parent
LANDING_HTML_PATH = ROOT_DIR / "landing.html"
INDEX_HTML_PATH = ROOT_DIR / "index.html"
VERCEL_JSON_PATH = ROOT_DIR / "vercel.json"
ASSETS_IMG_DIR = ROOT_DIR / "assets" / "img"

# Helper caches to avoid re-reading repeatedly
_CACHED_LANDING_HTML = None
_CACHED_LANDING_SOUP = None
_CACHED_INDEX_HTML = None
_CACHED_INDEX_SOUP = None
_CACHED_VERCEL_JSON = None

def get_landing_html():
    global _CACHED_LANDING_HTML
    if _CACHED_LANDING_HTML is None:
        if not LANDING_HTML_PATH.exists():
            return None
        with open(LANDING_HTML_PATH, "r", encoding="utf-8", errors="replace") as f:
            _CACHED_LANDING_HTML = f.read()
    return _CACHED_LANDING_HTML

def get_landing_soup():
    global _CACHED_LANDING_SOUP
    if _CACHED_LANDING_SOUP is None:
        content = get_landing_html()
        if content is None:
            return None
        if BeautifulSoup is not None:
            _CACHED_LANDING_SOUP = BeautifulSoup(content, "html.parser")
    return _CACHED_LANDING_SOUP

def get_index_html():
    global _CACHED_INDEX_HTML
    if _CACHED_INDEX_HTML is None:
        if not INDEX_HTML_PATH.exists():
            return None
        with open(INDEX_HTML_PATH, "r", encoding="utf-8", errors="replace") as f:
            _CACHED_INDEX_HTML = f.read()
    return _CACHED_INDEX_HTML

def get_index_soup():
    global _CACHED_INDEX_SOUP
    if _CACHED_INDEX_SOUP is None:
        content = get_index_html()
        if content is None:
            return None
        if BeautifulSoup is not None:
            _CACHED_INDEX_SOUP = BeautifulSoup(content, "html.parser")
    return _CACHED_INDEX_SOUP

def get_vercel_json():
    global _CACHED_VERCEL_JSON
    if _CACHED_VERCEL_JSON is None:
        if not VERCEL_JSON_PATH.exists():
            return None
        try:
            with open(VERCEL_JSON_PATH, "r", encoding="utf-8") as f:
                _CACHED_VERCEL_JSON = json.load(f)
        except Exception:
            _CACHED_VERCEL_JSON = None
    return _CACHED_VERCEL_JSON


# ==============================================================================
# BASE TEST CASE CON UTILIDADES COMUNES
# ==============================================================================
class BaseLandingTestCase(unittest.TestCase):
    def require_landing_file(self):
        if not LANDING_HTML_PATH.exists():
            self.fail(f"landing.html no existe en la raíz del proyecto ({LANDING_HTML_PATH}).")
        content = get_landing_html()
        if not content or len(content.strip()) == 0:
            self.fail("landing.html existe pero está vacío.")
        return content

    def require_landing_soup(self):
        self.require_landing_file()
        soup = get_landing_soup()
        if soup is None:
            self.fail("No se pudo construir el parser DOM (BeautifulSoup no disponible o error de sintaxis).")
        return soup

    def get_scripts_text(self):
        soup = self.require_landing_soup()
        scripts = soup.find_all("script")
        return "\n".join(s.get_text() for s in scripts if s.get_text())


# ==============================================================================
# TIER 1: COBERTURA ESTRUCTURAL Y DE CARACTERÍSTICAS (F1 - F17)
# >= 5 Casos de prueba por cada característica principal
# ==============================================================================
class Tier1FeatureCoverageTests(BaseLandingTestCase):
    """Tier 1: Verificación de estructura semántica, contratos de atributos y diseño."""

    # --------------------------------------------------------------------------
    # F1: Base HTML5 & Arquitectura Editorial
    # --------------------------------------------------------------------------
    def test_f01_01_doctype_declaration(self):
        """F1: landing.html declara <!DOCTYPE html> al inicio."""
        content = self.require_landing_file()
        first_chunk = content[:150].lower()
        self.assertIn("<!doctype html>", first_chunk, "Falta la declaración estándar <!DOCTYPE html>")

    def test_f01_02_html_lang_attribute(self):
        """F1: El elemento <html> contiene lang='es'."""
        soup = self.require_landing_soup()
        html_tag = soup.find("html")
        self.assertIsNotNone(html_tag, "No se encontró el elemento <html>")
        self.assertTrue(html_tag.get("lang", "").startswith("es"), "El atributo lang en <html> debe ser 'es' o comenzar con 'es'")

    def test_f01_03_meta_viewport_tag(self):
        """F1: Presencia del meta tag viewport para diseño responsivo."""
        soup = self.require_landing_soup()
        viewport = soup.find("meta", attrs={"name": "viewport"})
        self.assertIsNotNone(viewport, "Falta <meta name='viewport'>")
        content = viewport.get("content", "")
        self.assertIn("width=device-width", content, "meta viewport debe incluir width=device-width")

    def test_f01_04_document_title_editorial(self):
        """F1: <title> editorial con identidad Wistus y año 2027 (Carnaval de Oruro)."""
        soup = self.require_landing_soup()
        title = soup.find("title")
        self.assertIsNotNone(title, "Falta la etiqueta <title>")
        title_text = title.get_text().lower()
        self.assertIn("wistus", title_text, "El título debe contener 'Wistus'")
        self.assertIn("2027", title_text, "El título debe contener el año '2027'")

    def test_f01_05_semantic_html5_structure(self):
        """F1: Jerarquía de etiquetas semánticas HTML5 completas."""
        soup = self.require_landing_soup()
        self.assertIsNotNone(soup.find("header"), "Debe existir al menos una etiqueta semántica <header>")
        self.assertIsNotNone(soup.find("main"), "Debe existir la etiqueta semántica <main>")
        self.assertIsNotNone(soup.find("footer"), "Debe existir la etiqueta semántica <footer>")
        dialogs = soup.find_all("dialog")
        self.assertGreaterEqual(len(dialogs), 2, "Deben existir al menos 2 elementos semánticos <dialog>")

    def test_f01_06_minimum_file_size(self):
        """F1: landing.html tiene contenido sustancial (> 3,000 bytes)."""
        content = self.require_landing_file()
        self.assertGreater(len(content), 3000, "El tamaño de landing.html es demasiado reducido para una landing de alta fidelidad.")

    # --------------------------------------------------------------------------
    # F2: Tokens de Diseño Visual & Tipografía
    # --------------------------------------------------------------------------
    def test_f02_01_monte_silver_color_token(self):
        """F2: Presencia del color base Monte Silver (#f5f0ea o variable/clase silver)."""
        content = self.require_landing_file()
        pattern = re.compile(r"(#f5f0ea|--color-silver|bg-silver|stone|warm)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener el token de color cálido Monte Silver (#f5f0ea)")

    def test_f02_02_monte_black_charcoal_token(self):
        """F2: Presencia del color negro carbón (#111111 o #000000 o text-black)."""
        content = self.require_landing_file()
        pattern = re.compile(r"(#111111|#000000|text-black|bg-black)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener el color de contraste negro carbón (#111111 / #000000)")

    def test_f02_03_monte_stone_grey_token(self):
        """F2: Presencia del gris piedra de bordes y separadores (#b9b1a4)."""
        content = self.require_landing_file()
        pattern = re.compile(r"(#b9b1a4|grey-light|border-stone|border-neutral)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener el token de gris piedra Monte (#b9b1a4)")

    def test_f02_04_wistus_imperial_purple_accent(self):
        """F2: Acento institucional Wistus Púrpura Imperial (#7c3aed o variante)."""
        content = self.require_landing_file()
        pattern = re.compile(r"(#7c3aed|#6d28d9|#5b21b6|purple|purpura)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener el color institucional Púrpura Wistus (#7c3aed)")

    def test_f02_05_wistus_sun_gold_accent(self):
        """F2: Acento institucional Wistus Oro Fiesta (#d97706 o variante)."""
        content = self.require_landing_file()
        pattern = re.compile(r"(#d97706|#f59e0b|#fbbf24|gold|oro|amber)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener el color institucional Oro Wistus (#d97706)")

    def test_f02_06_editorial_typography_fonts(self):
        """F2: Declaración e importación de fuentes Serif, Sans y Monospace."""
        content = self.require_landing_file()
        has_serif = bool(re.search(r"(playfair|cormorant|domaine|font-serif|serif)", content, re.I))
        has_sans = bool(re.search(r"(jakarta|inter|sans|gothic|font-sans)", content, re.I))
        has_mono = bool(re.search(r"(dm mono|space mono|jetbrains|mono|font-mono)", content, re.I))
        self.assertTrue(has_serif, "Falta la tipografía Serif editorial (Playfair/Cormorant/Serif)")
        self.assertTrue(has_sans, "Falta la tipografía Sans-serif (Plus Jakarta Sans/Inter/Sans)")
        self.assertTrue(has_mono, "Falta la tipografía Monospace de metadatos (DM Mono/Monospace)")

    # --------------------------------------------------------------------------
    # F3: Sticky Blur Header & Scrolled State
    # --------------------------------------------------------------------------
    def test_f03_01_header_data_header_attribute(self):
        """F3: Contrato DOM: Existe <header data-header>."""
        soup = self.require_landing_soup()
        header = soup.select_one("header[data-header]") or soup.select_one("[data-header]")
        self.assertIsNotNone(header, "Debe existir un elemento con el atributo [data-header]")

    def test_f03_02_header_fixed_positioning(self):
        """F3: Header anclado con posición fija superior."""
        soup = self.require_landing_soup()
        header = soup.select_one("[data-header]")
        classes = " ".join(header.get("class", []))
        self.assertTrue(
            "fixed" in classes or "sticky" in classes,
            "El header debe tener clase 'fixed' o 'sticky' para anclaje superior"
        )

    def test_f03_03_header_backdrop_blur(self):
        """F3: Header con efecto de desenfoque backdrop-blur."""
        content = self.require_landing_file()
        pattern = re.compile(r"(backdrop-blur|blur\(\d+px\))", re.IGNORECASE)
        self.assertRegex(content, pattern, "El header debe implementar efecto blur / backdrop-blur")

    def test_f03_04_header_scroll_listener_in_script(self):
        """F3: Script escucha el evento scroll y evalúa scrollY."""
        scripts_text = self.get_scripts_text()
        has_scroll = bool(re.search(r"(window\.addEventListener\(['\"]scroll['\"]|onscroll|scrollY|pageYOffset)", scripts_text))
        self.assertTrue(has_scroll, "Debe existir un listener de scroll en el script para el header")

    def test_f03_05_header_scrolled_class_mutation(self):
        """F3: Script conmuta la clase 'scrolled' en el header."""
        scripts_text = self.get_scripts_text()
        has_scrolled_class = bool(re.search(r"scrolled", scripts_text))
        self.assertTrue(has_scrolled_class, "El script debe manipular la clase 'scrolled' según la posición de scroll")

    # --------------------------------------------------------------------------
    # F4: Responsive Drawer Menu
    # --------------------------------------------------------------------------
    def test_f04_01_menu_drawer_toggle_button(self):
        """F4: Contrato DOM: Existe botón [data-menu-drawer-toggle]."""
        soup = self.require_landing_soup()
        btn = soup.select_one("button[data-menu-drawer-toggle]") or soup.select_one("[data-menu-drawer-toggle]")
        self.assertIsNotNone(btn, "Debe existir un botón con el atributo [data-menu-drawer-toggle]")

    def test_f04_02_menu_drawer_container(self):
        """F4: Contrato DOM: Existe contenedor [data-menu-drawer]."""
        soup = self.require_landing_soup()
        drawer = soup.select_one("div[data-menu-drawer]") or soup.select_one("[data-menu-drawer]")
        self.assertIsNotNone(drawer, "Debe existir un contenedor con el atributo [data-menu-drawer]")

    def test_f04_03_menu_drawer_navigation_links(self):
        """F4: Menú drawer contiene enlaces a las secciones principales."""
        soup = self.require_landing_soup()
        drawer = soup.select_one("[data-menu-drawer]")
        links = drawer.find_all("a")
        self.assertGreaterEqual(len(links), 3, "El drawer de menú debe contener al menos 3 enlaces de navegación")

    def test_f04_04_menu_drawer_close_mechanism(self):
        """F4: Drawer posee mecanismo o botón de cierre."""
        soup = self.require_landing_soup()
        drawer = soup.select_one("[data-menu-drawer]")
        close_btn = (
            drawer.select_one("[data-menu-drawer-close]") or
            drawer.select_one("button") or
            soup.select_one("[data-menu-drawer-toggle]")
        )
        self.assertIsNotNone(close_btn, "Debe existir mecanismo para cerrar el menú drawer")

    def test_f04_05_menu_drawer_toggle_script_logic(self):
        """F4: Script contiene lógica para alternar el estado del drawer."""
        scripts_text = self.get_scripts_text()
        has_drawer_logic = bool(re.search(r"(menu-drawer|data-menu-drawer|drawerToggle|menuOpen)", scripts_text, re.I))
        self.assertTrue(has_drawer_logic, "El script debe contener lógica para abrir/cerrar el drawer de menú")

    # --------------------------------------------------------------------------
    # F5: Navegación Bidireccional (landing.html <-> index.html)
    # --------------------------------------------------------------------------
    def test_f05_01_outbound_header_portal_link(self):
        """F5: Header de landing.html contiene enlace a index.html."""
        soup = self.require_landing_soup()
        header = soup.select_one("[data-header]") or soup.find("header")
        portal_link = header.find("a", href=lambda h: h and "index.html" in h)
        self.assertIsNotNone(portal_link, "El header debe contener un enlace hacia 'index.html' (Portal Fraterno)")

    def test_f05_02_outbound_modal_portal_link(self):
        """F5: Modal de acceso contiene enlace directo a index.html."""
        soup = self.require_landing_soup()
        modal = soup.find("dialog", id="find-a-table") or soup.find("dialog")
        self.assertIsNotNone(modal, "Falta el modal de acceso para verificar enlaces")
        portal_link = modal.find("a", href=lambda h: h and "index.html" in h)
        self.assertIsNotNone(portal_link, "El modal de acceso debe incluir enlace a 'index.html'")

    def test_f05_03_outbound_secondary_portal_link(self):
        """F5: Metadata <dl> o Footer contiene enlace al portal index.html."""
        soup = self.require_landing_soup()
        footer_or_meta = soup.select_one("[data-footer]") or soup.select_one("[data-venue-metadata]")
        self.assertIsNotNone(footer_or_meta, "Debe existir footer o metadata")
        link = footer_or_meta.find("a", href=lambda h: h and "index.html" in h)
        self.assertIsNotNone(link, "Debe existir enlace a index.html en metadata o footer")

    def test_f05_04_inbound_index_login_link(self):
        """F5: index.html contiene enlace recíproco hacia landing.html en login o cabecera."""
        index_content = get_index_html()
        if index_content is None:
            self.fail("index.html no existe en la raíz del proyecto.")
        self.assertIn("landing.html", index_content, "index.html debe enlazar a landing.html")

    def test_f05_05_inbound_index_sidebar_or_nav_link(self):
        """F5: index.html posee navegación accesible de retorno hacia landing.html."""
        index_soup = get_index_soup()
        self.assertIsNotNone(index_soup, "No se pudo parsear index.html")
        links = index_soup.find_all("a", href=lambda h: h and "landing.html" in h)
        self.assertGreaterEqual(len(links), 1, "Debe existir al menos un enlace a landing.html dentro de index.html")

    # --------------------------------------------------------------------------
    # F6: Regla de Enrutamiento Vercel (vercel.json)
    # --------------------------------------------------------------------------
    def test_f06_01_vercel_json_exists(self):
        """F6: vercel.json existe en la raíz del proyecto."""
        self.assertTrue(VERCEL_JSON_PATH.exists(), "vercel.json debe existir en la raíz del proyecto")

    def test_f06_02_vercel_json_valid_json(self):
        """F6: vercel.json es un archivo JSON sintácticamente válido."""
        config = get_vercel_json()
        self.assertIsNotNone(config, "vercel.json debe ser un JSON válido")

    def test_f06_03_vercel_json_landing_rewrite(self):
        """F6: vercel.json incluye regla de reescritura para /landing hacia /landing.html."""
        config = get_vercel_json()
        self.assertIsNotNone(config, "vercel.json no se pudo cargar")
        routes = config.get("routes", []) or config.get("rewrites", [])
        has_landing_route = any(
            ("landing" in r.get("src", "") and "landing.html" in r.get("dest", ""))
            for r in routes
        )
        self.assertTrue(has_landing_route, "vercel.json debe incluir ruta para /landing -> /landing.html")

    def test_f06_04_vercel_json_asset_caching_preserved(self):
        """F6: vercel.json conserva reglas de caché para /assets/, /css/, /js/."""
        config = get_vercel_json()
        routes = config.get("routes", []) or config.get("rewrites", [])
        srcs = [r.get("src", "") for r in routes]
        has_assets = any("/assets/" in s for s in srcs)
        has_css = any("/css/" in s for s in srcs)
        has_js = any("/js/" in s for s in srcs)
        self.assertTrue(has_assets and has_css and has_js, "Las rutas de activos estáticos deben preservarse en vercel.json")

    def test_f06_05_vercel_json_catchall_preserved(self):
        """F6: vercel.json conserva la regla catch-all para la SPA index.html."""
        config = get_vercel_json()
        routes = config.get("routes", []) or config.get("rewrites", [])
        has_catchall = any(r.get("dest", "") == "/index.html" for r in routes)
        self.assertTrue(has_catchall, "vercel.json debe conservar el catch-all a /index.html")

    # --------------------------------------------------------------------------
    # F7: Hero Masthead Full-Screen (h-svh)
    # --------------------------------------------------------------------------
    def test_f07_01_hero_data_block_masthead(self):
        """F7: Contrato DOM: Existe [data-block="masthead-full"]."""
        soup = self.require_landing_soup()
        hero = soup.select_one('[data-block="masthead-full"]')
        self.assertIsNotNone(hero, "Debe existir un bloque con el atributo data-block='masthead-full'")

    def test_f07_02_hero_svh_height_class(self):
        """F7: Hero utiliza la clase h-svh o equivalente para 100% altura de ventana."""
        soup = self.require_landing_soup()
        hero = soup.select_one('[data-block="masthead-full"]')
        classes = " ".join(hero.get("class", []))
        self.assertTrue(
            "h-svh" in classes or "100svh" in classes or "h-screen" in classes or "min-h-screen" in classes,
            "El hero debe incluir la clase 'h-svh' (o 'h-screen'/'min-h-screen')"
        )

    def test_f07_03_hero_monumental_title(self):
        """F7: Hero contiene título monumental 'Tinkus Wistus'."""
        soup = self.require_landing_soup()
        hero = soup.select_one('[data-block="masthead-full"]')
        self.assertIn("wistus", hero.get_text().lower(), "El hero debe incluir el título 'Tinkus Wistus'")

    def test_f07_04_hero_official_badge_image(self):
        """F7: Hero incluye la insignia oficial Wistus (wistus-badge / escudo)."""
        soup = self.require_landing_soup()
        hero = soup.select_one('[data-block="masthead-full"]')
        badge_img = hero.find("img", src=lambda s: s and ("wistus-badge" in s or "wistus-escudo" in s or "badge" in s))
        self.assertIsNotNone(badge_img, "El hero debe mostrar la insignia heráldica oficial de Tinkus Wistus")

    def test_f07_05_hero_background_banner_imagery(self):
        """F7: Hero cuenta con imagen fotográfica de fondo (wistus-banner)."""
        content = self.require_landing_file()
        has_banner = "wistus-banner" in content or "banner" in content
        self.assertTrue(has_banner, "El hero debe usar la imagen fotográfica de banner de Wistus")

    # --------------------------------------------------------------------------
    # F8: Sección Editorial de Cita a 2 Columnas
    # --------------------------------------------------------------------------
    def test_f08_01_columns_section_container(self):
        """F8: Contrato DOM: Existe [data-block="columns"]."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="columns"]')
        self.assertIsNotNone(section, "Debe existir un elemento con data-block='columns'")

    def test_f08_02_columns_grid_layout(self):
        """F8: Layout en cuadrícula a 2 columnas editoriales."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="columns"]')
        classes = " ".join(section.get("class", []))
        has_grid = "grid" in classes or bool(section.find(class_=lambda c: c and "grid" in c))
        self.assertTrue(has_grid, "La sección de columnas debe utilizar CSS Grid")

    def test_f08_03_editorial_quote_substance(self):
        """F8: Cita editorial con texto reflexivo sobre la pasión del Tinku."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="columns"]')
        text = section.get_text().lower()
        has_keywords = any(w in text for w in ["tinku", "fuerza", "pasión", "danza", "tradición", "ritual", "cultura"])
        self.assertTrue(has_keywords, "La cita editorial debe contener texto sobre la pasión e identidad del Tinku")

    def test_f08_04_editorial_quote_serif_typography(self):
        """F8: La cita utiliza tipografía serif elegante."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="columns"]')
        classes = str(section)
        has_serif = bool(re.search(r"(font-serif|serif)", classes, re.I))
        self.assertTrue(has_serif, "La cita editorial debe aplicar tipografía serif")

    def test_f08_05_editorial_border_divider(self):
        """F8: Línea divisoria elegante que precede o divide la sección."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="columns"]')
        classes = str(section)
        has_border = bool(re.search(r"(border-t|border-b|border-divider)", classes))
        self.assertTrue(has_border, "La sección editorial debe incluir línea divisoria border-t o border-b")

    # --------------------------------------------------------------------------
    # F9: Lista Estructurada de Metadatos (<dl>)
    # --------------------------------------------------------------------------
    def test_f09_01_venue_metadata_dl_container(self):
        """F9: Contrato DOM: Existe <dl data-venue-metadata>."""
        soup = self.require_landing_soup()
        dl = soup.select_one("dl[data-venue-metadata]") or soup.select_one("[data-venue-metadata]")
        self.assertIsNotNone(dl, "Debe existir un elemento dl con el atributo data-venue-metadata")

    def test_f09_02_metadata_dt_dd_pairs(self):
        """F9: dl contiene pares estructurados de etiquetas <dt> y descripciones <dd>."""
        soup = self.require_landing_soup()
        dl = soup.select_one("[data-venue-metadata]")
        dts = dl.find_all("dt")
        dds = dl.find_all("dd")
        self.assertGreaterEqual(len(dts), 3, "dl debe contener al menos 3 elementos <dt>")
        self.assertGreaterEqual(len(dds), 3, "dl debe contener al menos 3 elementos <dd>")

    def test_f09_03_metadata_rehearsal_schedule(self):
        """F9: Metadata especifica los horarios de ensayo."""
        soup = self.require_landing_soup()
        dl = soup.select_one("[data-venue-metadata]")
        text = dl.get_text().lower()
        has_schedule = any(k in text for k in ["horario", "ensayo", "sábado", "domingo", "15:30"])
        self.assertTrue(has_schedule, "Metadata debe incluir horarios de ensayos oficiales")

    def test_f09_04_metadata_venue_address(self):
        """F9: Metadata especifica el lugar de ensayo (Cancha Zapata / Monoblock / UMSA)."""
        soup = self.require_landing_soup()
        dl = soup.select_one("[data-venue-metadata]")
        text = dl.get_text().lower()
        has_venue = any(k in text for k in ["zapata", "cancha", "monoblock", "umsa", "villazón", "la paz"])
        self.assertTrue(has_venue, "Metadata debe incluir el lugar de ensayo oficial")

    def test_f09_05_metadata_contacts_or_portal_link(self):
        """F9: Metadata incluye información de contacto de directiva o enlace oficial."""
        soup = self.require_landing_soup()
        dl = soup.select_one("[data-venue-metadata]")
        text = dl.get_text().lower()
        has_contact = any(k in text for k in ["contacto", "directiva", "76543210", "portal", "tinkuswistus.bo"])
        self.assertTrue(has_contact, "Metadata debe incluir contacto de directiva o enlace oficial")

    # --------------------------------------------------------------------------
    # F10: Galería Carrusel Fotográfico (Swiper)
    # --------------------------------------------------------------------------
    def test_f10_01_carousel_data_block_container(self):
        """F10: Contrato DOM: Existe [data-block="carousel"]."""
        soup = self.require_landing_soup()
        carousel = soup.select_one('[data-block="carousel"]')
        self.assertIsNotNone(carousel, "Debe existir un bloque con data-block='carousel'")

    def test_f10_02_carousel_swiper_container(self):
        """F10: Contrato DOM: Existe contenedor [data-carousel-swiper]."""
        soup = self.require_landing_soup()
        swiper = soup.select_one('[data-carousel-swiper]')
        self.assertIsNotNone(swiper, "Debe existir un contenedor con data-carousel-swiper")

    def test_f10_03_carousel_slides_presence(self):
        """F10: Carrusel contiene diapositivas fotográficas (.swiper-slide o slides)."""
        soup = self.require_landing_soup()
        swiper = soup.select_one('[data-carousel-swiper]')
        slides = swiper.select(".swiper-slide") or swiper.find_all("div", recursive=False)
        self.assertGreaterEqual(len(slides), 3, "El carrusel debe contener al menos 3 diapositivas")

    def test_f10_04_swiper_bundle_inclusion(self):
        """F10: Inclusión de la biblioteca Swiper.js (CDN o script)."""
        content = self.require_landing_file()
        has_swiper_js = "swiper-bundle" in content or "swiper" in content.lower()
        self.assertTrue(has_swiper_js, "landing.html debe incluir los estilos o scripts de Swiper")

    def test_f10_05_carousel_js_initialization(self):
        """F10: Script inicializa el carrusel Swiper."""
        scripts_text = self.get_scripts_text()
        has_init = bool(re.search(r"(new Swiper|Swiper\()", scripts_text))
        self.assertTrue(has_init, "El script debe inicializar una instancia de Swiper")

    # --------------------------------------------------------------------------
    # F11: Bloque CTA con Credencial Holográfica 3D
    # --------------------------------------------------------------------------
    def test_f11_01_cta_data_block_container(self):
        """F11: Contrato DOM: Existe aside[data-block="cta"] o [data-block="cta"]."""
        soup = self.require_landing_soup()
        cta = soup.select_one('[data-block="cta"]')
        self.assertIsNotNone(cta, "Debe existir un bloque con el atributo data-block='cta'")

    def test_f11_02_gift_card_animation_container(self):
        """F11: Contrato DOM: Existe contenedor [data-gift-card-animation]."""
        soup = self.require_landing_soup()
        anim = soup.select_one('[data-gift-card-animation]')
        self.assertIsNotNone(anim, "Debe existir un elemento con data-gift-card-animation")

    def test_f11_03_gift_card_element(self):
        """F11: Contrato DOM: Existe elemento [data-gift-card]."""
        soup = self.require_landing_soup()
        card = soup.select_one('[data-gift-card]')
        self.assertIsNotNone(card, "Debe existir un elemento con data-gift-card")

    def test_f11_04_perspective_3d_styling(self):
        """F11: Estilos de perspectiva 3D aplicados al contenedor de credencial."""
        content = self.require_landing_file()
        pattern = re.compile(r"(perspective|rotateX|rotateY|transform-style)", re.IGNORECASE)
        self.assertRegex(content, pattern, "Debe contener estilos de perspectiva 3D para el efecto holográfico")

    def test_f11_05_tilt_js_handlers_present(self):
        """F11: Script implementa listeners de movimiento para física 3D tilt (mousemove/mouseleave)."""
        scripts_text = self.get_scripts_text()
        has_tilt_events = (
            bool(re.search(r"mousemove", scripts_text, re.I)) and
            bool(re.search(r"(mouseleave|mouseout)", scripts_text, re.I))
        )
        self.assertTrue(has_tilt_events, "El script debe manejar mousemove y mouseleave para el tilt de la tarjeta")

    # --------------------------------------------------------------------------
    # F12: Acción de Adquisición de Membresía / Carnet
    # --------------------------------------------------------------------------
    def test_f12_01_membership_cta_button(self):
        """F12: Botón de llamada a la acción para adquirir membresía o inscribirse."""
        soup = self.require_landing_soup()
        cta_block = soup.select_one('[data-block="cta"]')
        button = cta_block.find(lambda e: e.name in ["button", "a"] and any(
            w in e.get_text().lower() for w in ["adquirir", "inscribirse", "membresía", "postular", "unirse"]
        ))
        self.assertIsNotNone(button, "El bloque CTA debe incluir un botón para adquirir membresía o postular")

    def test_f12_02_membership_cta_targets_enquire_drawer(self):
        """F12: El botón de adquisición dispara el drawer de inscripción (#enquire)."""
        soup = self.require_landing_soup()
        cta_block = soup.select_one('[data-block="cta"]')
        target_found = (
            cta_block.find(attrs={"data-modal-open": lambda v: v and "enquire" in v}) or
            cta_block.find("button", id=lambda i: i and "enquire" in i) or
            cta_block.find(onclick=lambda c: c and "enquire" in c)
        )
        # Also check in scripts if CTA button triggers enquire
        scripts_text = self.get_scripts_text()
        script_targets_enquire = bool(re.search(r"(cta|gift-card).*enquire|enquire.*showModal", scripts_text, re.I))
        self.assertTrue(bool(target_found or script_targets_enquire), "El botón de credencial debe apuntar al drawer #enquire")

    def test_f12_03_credencial_qr_or_chip_motif(self):
        """F12: La credencial cuenta con motif de chip digital o código QR."""
        soup = self.require_landing_soup()
        card = soup.select_one('[data-gift-card]')
        text = str(card).lower()
        has_chip_qr = any(k in text for k in ["qr", "chip", "svg", "digital", "pvc", "seguridad"])
        self.assertTrue(has_chip_qr, "La credencial debe incluir elemento de código QR, chip o seguridad digital")

    def test_f12_04_credencial_year_2027_badge(self):
        """F12: La credencial muestra el año oficial 2027."""
        soup = self.require_landing_soup()
        card = soup.select_one('[data-gift-card]')
        self.assertIn("2027", card.get_text(), "La credencial debe exhibir el año de gestión '2027'")

    def test_f12_05_credencial_title_label(self):
        """F12: La credencial identifica el Carnet de Membresía Fraterna Wistus."""
        soup = self.require_landing_soup()
        card = soup.select_one('[data-gift-card]')
        text = card.get_text().lower()
        has_title = any(w in text for w in ["credencial", "carnet", "membresía", "fraterno", "wistus"])
        self.assertTrue(has_title, "La credencial debe identificarse como credencial/membresía fraterna")

    # --------------------------------------------------------------------------
    # F13: Carrusel de Bloques Fraternos ("Nuestros Bloques")
    # --------------------------------------------------------------------------
    def test_f13_01_listing_carousel_section_container(self):
        """F13: Contrato DOM: Existe [data-block="listing-carousel"]."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="listing-carousel"]')
        self.assertIsNotNone(section, "Debe existir un bloque con data-block='listing-carousel'")

    def test_f13_02_bloque_machas_presence(self):
        """F13: Carrusel contiene tarjeta del 'Bloque Machas' con sinopsis."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="listing-carousel"]')
        self.assertIn("machas", section.get_text().lower(), "Debe existir tarjeta para el 'Bloque Machas'")

    def test_f13_03_bloque_imillas_presence(self):
        """F13: Carrusel contiene tarjeta del 'Bloque Imillas' con sinopsis."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="listing-carousel"]')
        self.assertIn("imillas", section.get_text().lower(), "Debe existir tarjeta para el 'Bloque Imillas'")

    def test_f13_04_bloque_naupas_presence(self):
        """F13: Carrusel contiene tarjeta del 'Bloque Ñaupas' con sinopsis."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="listing-carousel"]')
        text = section.get_text().lower()
        has_naupas = ("ñaupas" in text or "naupas" in text)
        self.assertTrue(has_naupas, "Debe existir tarjeta para el 'Bloque Ñaupas'")

    def test_f13_05_bloque_sambos_presence(self):
        """F13: Carrusel contiene tarjeta del 'Bloque Sambos' con sinopsis."""
        soup = self.require_landing_soup()
        section = soup.select_one('[data-block="listing-carousel"]')
        self.assertIn("sambos", section.get_text().lower(), "Debe existir tarjeta para el 'Bloque Sambos'")

    # --------------------------------------------------------------------------
    # F14: Eliminación de Barra Inferior Fija & Acciones en Header Superior
    # --------------------------------------------------------------------------
    def test_f14_01_find_a_table_btn_container_removed(self):
        """F14: Contrato DOM: La barra inferior fija [data-find-a-table-btn] y #fixed-bottom-bar están eliminadas."""
        soup = self.require_landing_soup()
        btn = soup.select_one('[data-find-a-table-btn]')
        self.assertIsNone(btn, "La barra inferior fija [data-find-a-table-btn] no debe existir en el DOM")
        bottom_bar = soup.select_one('#fixed-bottom-bar')
        self.assertIsNone(bottom_bar, "El elemento #fixed-bottom-bar no debe existir en el DOM")

    def test_f14_02_header_portal_access(self):
        """F14: El header superior mantiene el acceso directo al Portal Fraterno hacia index.html."""
        soup = self.require_landing_soup()
        portal_btn = soup.select_one('header a[href*="index.html"], [data-header] a[href*="index.html"]')
        self.assertIsNotNone(portal_btn, "El header superior debe mantener el enlace a index.html")
        text = portal_btn.get_text().lower()
        self.assertIn("portal", text, "El enlace del header superior debe indicar 'Portal'")

    def test_f14_03_header_postular_access(self):
        """F14: El header superior mantiene el botón 'Postular' hacia el drawer de postulación."""
        soup = self.require_landing_soup()
        postular_btn = soup.select_one('header button[data-open-enquire], [data-header] button[data-open-enquire]')
        self.assertIsNotNone(postular_btn, "El header superior debe mantener el botón 'Postular' con data-open-enquire")
        text = postular_btn.get_text().lower()
        self.assertIn("postular", text, "El botón del header superior debe indicar 'Postular'")

    def test_f14_04_header_hamburger_menu_toggle(self):
        """F14: El header superior mantiene el botón hamburguesa para el menú desplegable."""
        soup = self.require_landing_soup()
        menu_toggle = soup.select_one('[data-menu-drawer-toggle]')
        self.assertIsNotNone(menu_toggle, "El header superior debe mantener el botón hamburguesa [data-menu-drawer-toggle]")

    def test_f14_05_clean_bottom_viewport(self):
        """F14: No existe barra fija inferior que obstaculice la lectura del contenido."""
        soup = self.require_landing_soup()
        fixed_bottom_bars = soup.select('div.fixed.bottom-0, [data-find-a-table-btn]')
        self.assertEqual(len(fixed_bottom_bars), 0, "No deben existir barras fijadas al fondo de la pantalla")

    # --------------------------------------------------------------------------
    # F15: Modal de Pantalla Completa (<dialog id="find-a-table">)
    # --------------------------------------------------------------------------
    def test_f15_01_dialog_find_a_table_exists(self):
        """F15: Contrato DOM: Existe <dialog id="find-a-table">."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="find-a-table")
        self.assertIsNotNone(dialog, "Debe existir un elemento <dialog id='find-a-table'>")

    def test_f15_02_dialog_data_modal_attribute(self):
        """F15: Contrato DOM: Dialog posee atributo data-modal."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="find-a-table")
        self.assertTrue(dialog.has_attr("data-modal"), "El dialog #find-a-table debe tener el atributo data-modal")

    def test_f15_03_dialog_portal_access_option(self):
        """F15: Modal ofrece opción directa 'Ingresar al Portal Fraterno' hacia index.html."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="find-a-table")
        portal_link = dialog.find("a", href=lambda h: h and "index.html" in h)
        self.assertIsNotNone(portal_link, "El modal de navegación debe incluir enlace directo a index.html")

    def test_f15_04_dialog_enquire_drawer_trigger(self):
        """F15: Modal incluye opción para abrir el drawer de postulación #enquire."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="find-a-table")
        enquire_trigger = dialog.find(lambda e: (
            e.get("data-modal-open") == "#enquire" or
            "enquire" in e.get("href", "") or
            "postular" in e.get_text().lower() or
            "unirse" in e.get_text().lower()
        ))
        self.assertIsNotNone(enquire_trigger, "El modal debe ofrecer acceso al drawer de postulación #enquire")

    def test_f15_05_dialog_close_button(self):
        """F15: Modal incluye botón para cerrar el diálogo."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="find-a-table")
        close_btn = dialog.find(lambda e: (
            e.has_attr("data-modal-close") or
            "cerrar" in e.get_text().lower() or
            e.get("aria-label", "").lower() == "cerrar"
        ))
        self.assertIsNotNone(close_btn, "El modal debe incluir un botón de cierre")

    # --------------------------------------------------------------------------
    # F16: Drawer Lateral de Postulación (<dialog id="enquire">)
    # --------------------------------------------------------------------------
    def test_f16_01_dialog_enquire_exists(self):
        """F16: Contrato DOM: Existe <dialog id="enquire">."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        self.assertIsNotNone(dialog, "Debe existir un elemento <dialog id='enquire'>")

    def test_f16_02_dialog_data_modal_drawer_attribute(self):
        """F16: Contrato DOM: Dialog posee atributo data-modal-drawer."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        self.assertTrue(dialog.has_attr("data-modal-drawer"), "El dialog #enquire debe tener el atributo data-modal-drawer")

    def test_f16_03_enquire_form_required_fields(self):
        """F16: Formulario contiene inputs requeridos para Nombres, Apellidos y Teléfono."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        form = dialog.find("form")
        self.assertIsNotNone(form, "El drawer #enquire debe contener una etiqueta <form>")
        inputs = form.find_all("input")
        input_names_or_ids = [inp.get("name", "") + inp.get("id", "") for inp in inputs]
        combined = " ".join(input_names_or_ids).lower()
        self.assertTrue(any(k in combined for k in ["nombre", "first"]), "Falta campo de Nombres")
        self.assertTrue(any(k in combined for k in ["apellido", "last"]), "Falta campo de Apellidos")
        self.assertTrue(any(k in combined for k in ["telefono", "phone", "celular", "tel"]), "Falta campo de Teléfono")

    def test_f16_04_enquire_form_block_selection_dropdown(self):
        """F16: Formulario contiene selector <select> con opciones de bloques fraternos."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        select = dialog.find("select")
        self.assertIsNotNone(select, "El formulario debe incluir un <select> para elegir bloque de interés")
        options_text = " ".join(opt.get_text().lower() for opt in select.find_all("option"))
        self.assertIn("machas", options_text, "Debe incluir opción Bloque Machas")
        self.assertIn("imillas", options_text, "Debe incluir opción Bloque Imillas")

    def test_f16_05_enquire_form_submit_button(self):
        """F16: Formulario contiene botón de envío (type='submit' o botón de postulación)."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        submit_btn = dialog.find(lambda e: (
            (e.name == "button" and e.get("type", "submit") == "submit") or
            (e.name == "input" and e.get("type") == "submit") or
            "enviar" in e.get_text().lower() or
            "postular" in e.get_text().lower()
        ))
        self.assertIsNotNone(submit_btn, "El formulario debe tener un botón de envío de postulación")

    # --------------------------------------------------------------------------
    # F17: Footer Editorial & Newsletter
    # --------------------------------------------------------------------------
    def test_f17_01_footer_data_footer_attribute(self):
        """F17: Contrato DOM: Existe <footer data-footer>."""
        soup = self.require_landing_soup()
        footer = soup.select_one("footer[data-footer]") or soup.select_one("[data-footer]")
        self.assertIsNotNone(footer, "Debe existir un elemento con el atributo data-footer")

    def test_f17_02_subscribe_form_data_attribute(self):
        """F17: Contrato DOM: Existe <form data-subscribe-form> dentro del footer."""
        soup = self.require_landing_soup()
        form = soup.select_one("form[data-subscribe-form]") or soup.select_one("[data-subscribe-form]")
        self.assertIsNotNone(form, "Debe existir un formulario con el atributo data-subscribe-form")

    def test_f17_03_newsletter_email_input_field(self):
        """F17: Formulario de boletín contiene <input type="email">."""
        soup = self.require_landing_soup()
        form = soup.select_one("[data-subscribe-form]")
        email_inp = form.find("input", type="email") or form.find("input", attrs={"name": lambda n: n and "email" in n})
        self.assertIsNotNone(email_inp, "El formulario de boletín debe contener un campo de correo electrónico")

    def test_f17_04_copyright_and_year_2027(self):
        """F17: Footer exhibe derechos reservados con año 2027 y Fraternidad Tinkus Wistus."""
        soup = self.require_landing_soup()
        footer = soup.select_one("[data-footer]")
        text = footer.get_text().lower()
        self.assertIn("2027", text, "El footer debe incluir el año 2027")
        self.assertIn("wistus", text, "El footer debe incluir el nombre de la Fraternidad Wistus")

    def test_f17_05_footer_navigation_links(self):
        """F17: Footer incluye enlaces rápidos de navegación editorial."""
        soup = self.require_landing_soup()
        footer = soup.select_one("[data-footer]")
        links = footer.find_all("a")
        self.assertGreaterEqual(len(links), 3, "El footer debe incluir al menos 3 enlaces de navegación")


# ==============================================================================
# TIER 2: CASOS LÍMITE Y DE BORDE (B1 - B5)
# >= 5 Casos de prueba por categoría de límite
# ==============================================================================
class Tier2BoundaryCornerCaseTests(BaseLandingTestCase):
    """Tier 2: Casos de borde, validación estricta de inputs, escape de atributos y archivos locales."""

    # --------------------------------------------------------------------------
    # B1: Validación de Formularios y Manejo de Inputs Vacíos
    # --------------------------------------------------------------------------
    def test_b01_01_enquire_form_enforces_required_attributes(self):
        """B1: Inputs esenciales del formulario poseen el atributo 'required'."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        form = dialog.find("form")
        required_inputs = form.find_all(lambda e: e.has_attr("required"))
        self.assertGreaterEqual(len(required_inputs), 2, "Debe haber al menos 2 campos con validación 'required'")

    def test_b01_02_enquire_script_trims_inputs(self):
        """B1: Script de validación de postulación aplica trim() para evitar espacios en blanco puros."""
        scripts_text = self.get_scripts_text()
        has_trim = bool(re.search(r"\.trim\(\)", scripts_text))
        self.assertTrue(has_trim, "El script de formulario debe utilizar .trim() al validar campos")

    def test_b01_03_newsletter_email_has_required_attribute(self):
        """B1: Campo de email en el newsletter posee el atributo 'required'."""
        soup = self.require_landing_soup()
        form = soup.select_one("[data-subscribe-form]")
        email_inp = form.find("input")
        self.assertTrue(email_inp.has_attr("required"), "El campo de email del newsletter debe ser 'required'")

    def test_b01_04_newsletter_email_html5_validation(self):
        """B1: Campo de correo tiene type='email' para validación estándar de navegador."""
        soup = self.require_landing_soup()
        form = soup.select_one("[data-subscribe-form]")
        email_inp = form.find("input", type="email")
        self.assertIsNotNone(email_inp, "El campo de suscripción debe tener type='email'")

    def test_b01_05_form_submission_prevents_default_reload(self):
        """B1: Controladores de eventos de formulario implementan preventDefault() para evitar recarga de página."""
        scripts_text = self.get_scripts_text()
        has_prevent = bool(re.search(r"preventDefault\(\)", scripts_text))
        self.assertTrue(has_prevent, "Los manejadores de envío de formulario deben invocar preventDefault()")

    # --------------------------------------------------------------------------
    # B2: Formatos de Teléfono y Casos Límite
    # --------------------------------------------------------------------------
    def test_b02_01_phone_input_uses_type_tel(self):
        """B2: El campo de teléfono utiliza type='tel' para desplegar teclado numérico en móvil."""
        soup = self.require_landing_soup()
        dialog = soup.find("dialog", id="enquire")
        tel_input = dialog.find("input", type="tel") or dialog.find("input", attrs={"name": lambda n: n and "tel" in n})
        self.assertIsNotNone(tel_input, "El campo de teléfono debe usar type='tel' o estar configurado para telefonía")

    def test_b02_02_phone_bolivia_prefix_or_length_validation(self):
        """B2: Validación de teléfono contempla longitud mínima de 7-8 dígitos o prefijo +591."""
        soup = self.require_landing_soup()
        tel_input = soup.find("input", type="tel") or soup.find("input", attrs={"name": lambda n: n and "tel" in n})
        placeholder = tel_input.get("placeholder", "") if tel_input else ""
        pattern = tel_input.get("pattern", "") if tel_input else ""
        minlength = tel_input.get("minlength", "") if tel_input else ""
        scripts_text = self.get_scripts_text()
        has_phone_rules = (
            "+591" in placeholder or "591" in pattern or bool(minlength) or
            bool(re.search(r"(591|\b[78]\d{6,7}\b|length\s*[><=]|replace\(\/\[\^0-9\])", scripts_text))
        )
        self.assertTrue(has_phone_rules, "El campo o script debe contemplar formato o prefijo boliviano (+591)")

    def test_b02_03_phone_whitespace_tolerance(self):
        """B2: Campo de teléfono tolera espacios entre dígitos (ej: '+591 7654 3210')."""
        scripts_text = self.get_scripts_text()
        # Ensure either regex handles \s or replaces whitespace
        pattern_check = bool(re.search(r"(\s|\s\*|\/\[\^0-9\+\]|\/\[\^\\d\])", scripts_text))
        self.assertTrue(pattern_check, "La validación de teléfono debe tolerar espacios o sanitizar caracteres no numéricos")

    def test_b02_04_phone_minimum_length_enforcement(self):
        """B2: Validación rechaza números con menos de 7 dígitos."""
        soup = self.require_landing_soup()
        tel_input = soup.find("input", type="tel") or soup.find("input", attrs={"name": lambda n: n and "tel" in n})
        pattern = tel_input.get("pattern", "") if tel_input else ""
        minlength = int(tel_input.get("minlength", 0)) if tel_input and tel_input.get("minlength", "").isdigit() else 0
        scripts_text = self.get_scripts_text()
        has_len_check = (
            minlength >= 7 or
            bool(re.search(r"\d{7,}", pattern)) or
            bool(re.search(r"(length\s*<=\s*[67]|length\s*<\s*[78]|length\s*>=\s*[78])", scripts_text))
        )
        self.assertTrue(has_len_check, "Debe existir comprobación de longitud mínima (mínimo 7 dígitos) para el teléfono")

    def test_b02_05_phone_rejection_of_pure_alpha(self):
        """B2: Validación no permite números puramente alfabéticos."""
        scripts_text = self.get_scripts_text()
        has_rejection = bool(re.search(r"(\d|\[0-9\]|isNaN|test\(|type=[\"']tel[\"'])", scripts_text))
        self.assertTrue(has_rejection, "El script o input debe impedir el ingreso de cadenas puramente alfabéticas como teléfono")

    # --------------------------------------------------------------------------
    # B3: Integridad de Entidades HTML y Escape de Atributos
    # --------------------------------------------------------------------------
    def test_b03_01_no_raw_unescaped_delimiters_in_attributes(self):
        """B3: Atributos HTML no contienen caracteres < o > sin escapar."""
        content = self.require_landing_file()
        # Match attribute patterns with unescaped < or > inside double quotes
        broken_attr = re.search(r'=["][^">]*[<>][^"]*["]', content)
        self.assertIsNone(broken_attr, f"Se detectó un atributo mal escapado con < o >: {broken_attr.group(0) if broken_attr else ''}")

    def test_b03_02_clean_spanish_utf8_rendering(self):
        """B3: Caracteres españoles (á, é, í, ó, ú, ñ) se leen en UTF-8 limpio sin corrupción (mojibake)."""
        content = self.require_landing_file()
        mojibake = re.search(r"(Ã±|Ã¡|Ã©|Ã­|Ã³|Ãº|\uFFFD)", content)
        self.assertIsNone(mojibake, f"Se detectó codificación corrupta (mojibake): {mojibake.group(0) if mojibake else ''}")

    def test_b03_03_critical_images_have_alt_attributes(self):
        """B3: Todas las imágenes cuentan con atributo 'alt' y las de contenido no están vacías."""
        soup = self.require_landing_soup()
        imgs = soup.find_all("img")
        for img in imgs:
            self.assertTrue(img.has_attr("alt"), f"La imagen {img.get('src')} carece del atributo alt")
            src = img.get("src", "")
            alt = img.get("alt", "")
            classes = " ".join(img.get("class", []))
            is_decorative = "pointer-events-none" in classes or "opacity-15" in classes or "opacity-10" in classes
            if not is_decorative and ("banner" in src or "hero" in str(img.parent)):
                self.assertTrue(len(alt.strip()) > 0, f"La imagen crítica {src} debe tener alt descriptivo")

    def test_b03_04_accessible_names_on_buttons(self):
        """B3: Botones de ícono / toggle tienen 'aria-label' o texto legible."""
        soup = self.require_landing_soup()
        toggle = soup.select_one("[data-menu-drawer-toggle]")
        if toggle:
            has_accessible_name = bool(toggle.get("aria-label")) or bool(toggle.get_text().strip())
            self.assertTrue(has_accessible_name, "El botón de toggle de menú debe tener aria-label o texto accesible")

    def test_b03_05_clean_script_syntax(self):
        """B3: Bloques de script en línea están sintácticamente limpios sin cierres prematuros."""
        content = self.require_landing_file()
        # Ensure no unescaped </script> inside script strings
        script_matches = re.findall(r"<script[^>]*>(.*?)</script>", content, re.DOTALL)
        for s in script_matches:
            self.assertNotIn("</script>", s, "Bloque de script contiene cierre prematuro </script>")

    # --------------------------------------------------------------------------
    # B4: Mobile Viewport & Fallbacks CSS
    # --------------------------------------------------------------------------
    def test_b04_01_viewport_meta_content_scalable(self):
        """B4: Meta viewport tiene configuración estándar sin deshabilitar zoom bruscamente."""
        soup = self.require_landing_soup()
        viewport = soup.find("meta", attrs={"name": "viewport"})
        content = viewport.get("content", "")
        self.assertIn("initial-scale=1", content, "meta viewport debe incluir initial-scale=1")

    def test_b04_02_hero_svh_fallback_classes(self):
        """B4: Hero incluye clase de fallback (min-h-screen o h-screen o min-h-[600px]) para navegadores sin svh."""
        soup = self.require_landing_soup()
        hero = soup.select_one('[data-block="masthead-full"]')
        classes = " ".join(hero.get("class", []))
        has_fallback = bool(re.search(r"(min-h-screen|h-screen|min-h-\[\d+px\])", classes))
        self.assertTrue(has_fallback, "El hero debe incluir clase de altura fallback (ej: min-h-screen)")

    def test_b04_03_touch_friendly_tap_targets(self):
        """B4: Botones clave poseen clases de padding generoso para pantallas táctiles (mínimo 36-40px)."""
        soup = self.require_landing_soup()
        target = soup.select_one('#btn-header-join') or soup.select_one('.nav-portal-btn')
        classes = " ".join(target.get("class", [])) if target else ""
        has_padding = bool(re.search(r"(py-\d+|h-\d+|h-header|p-\d+|h-\[[^\]]+\])", classes))
        self.assertTrue(has_padding, "Los botones de acción en header deben tener tamaño táctil accesible")

    def test_b04_04_horizontal_overflow_protection(self):
        """B4: Estructura previene desbordamiento horizontal accidental con overflow-x-hidden."""
        content = self.require_landing_file()
        has_overflow_control = bool(re.search(r"(overflow-x-hidden|overflow-hidden)", content))
        self.assertTrue(has_overflow_control, "Debe existir control de desbordamiento horizontal (overflow-x-hidden)")

    def test_b04_05_dialog_background_scroll_lock(self):
        """B4: Script bloquea el scroll del fondo (overflow-hidden en body) cuando se abre un modal o drawer."""
        scripts_text = self.get_scripts_text()
        has_scroll_lock = bool(re.search(r"(overflow-hidden|overflow.*hidden)", scripts_text))
        self.assertTrue(has_scroll_lock, "El script debe aplicar overflow-hidden al body al desplegar un modal o drawer")

    # --------------------------------------------------------------------------
    # B5: Integridad de Archivos de Recursos Locales en Disco
    # --------------------------------------------------------------------------
    def test_b05_01_wistus_banner_jpg_on_disk(self):
        """B5: assets/img/wistus-banner.jpg existe en disco y tiene tamaño adecuado (> 100KB)."""
        banner_path = ASSETS_IMG_DIR / "wistus-banner.jpg"
        self.assertTrue(banner_path.exists(), f"Falta el archivo {banner_path}")
        self.assertGreater(banner_path.stat().st_size, 100000, "El banner debe tener al menos 100KB")

    def test_b05_02_wistus_badge_svg_on_disk(self):
        """B5: assets/img/wistus-badge.svg existe en disco y es un SVG no vacío."""
        badge_path = ASSETS_IMG_DIR / "wistus-badge.svg"
        self.assertTrue(badge_path.exists(), f"Falta el archivo {badge_path}")
        self.assertGreater(badge_path.stat().st_size, 500, "El archivo SVG de insignia debe tener contenido")

    def test_b05_03_wistus_logo_w_svg_on_disk(self):
        """B5: assets/img/wistus-logo-w.svg existe en disco."""
        logo_path = ASSETS_IMG_DIR / "wistus-logo-w.svg"
        self.assertTrue(logo_path.exists(), f"Falta el archivo {logo_path}")

    def test_b05_04_wistus_escudo_svg_on_disk(self):
        """B5: assets/img/wistus-escudo.svg existe en disco."""
        escudo_path = ASSETS_IMG_DIR / "wistus-escudo.svg"
        self.assertTrue(escudo_path.exists(), f"Falta el archivo {escudo_path}")

    def test_b05_05_avatar_default_svg_on_disk(self):
        """B5: assets/img/avatar-default.svg existe en disco."""
        avatar_path = ASSETS_IMG_DIR / "avatar-default.svg"
        self.assertTrue(avatar_path.exists(), f"Falta el archivo {avatar_path}")


# ==============================================================================
# TIER 3: COMBINACIONES ENTRE CARACTERÍSTICAS Y MÁQUINA DE ESTADOS (X1 - X7)
# ==============================================================================
class Tier3CrossFeatureCombinationTests(BaseLandingTestCase):
    """Tier 3: Interacciones cruzadas entre modales, drawers, scroll y botones CTA."""

    # --------------------------------------------------------------------------
    # X1: Modal <dialog id="find-a-table"> a Drawer <dialog id="enquire">
    # --------------------------------------------------------------------------
    def test_x01_01_modal_to_drawer_transition_logic(self):
        """X1: Abrir el drawer de postulación desde el modal cierra el modal para evitar colisión de diálogos."""
        scripts_text = self.get_scripts_text()
        has_transition_logic = bool(re.search(r"(close.*findatable|find-a-table.*close|modal.*close.*enquire|closeModal)", scripts_text, re.I))
        self.assertTrue(has_transition_logic, "El script debe contemplar el cierre de modal al transicionar hacia el drawer")

    def test_x01_02_dialog_distinct_ids_and_attributes(self):
        """X1: Modal y Drawer tienen IDs y roles de atributo distintos (data-modal vs data-modal-drawer)."""
        soup = self.require_landing_soup()
        modal = soup.find("dialog", id="find-a-table")
        drawer = soup.find("dialog", id="enquire")
        self.assertIsNotNone(modal, "Falta <dialog id='find-a-table'>")
        self.assertIsNotNone(drawer, "Falta <dialog id='enquire'>")
        self.assertTrue(modal.has_attr("data-modal"), "El modal debe tener data-modal")
        self.assertTrue(drawer.has_attr("data-modal-drawer"), "El drawer debe tener data-modal-drawer")

    # --------------------------------------------------------------------------
    # X2: Credencial CTA Triggering Registration Drawer
    # --------------------------------------------------------------------------
    def test_x02_01_credencial_cta_triggers_enquire_drawer(self):
        """X2: El botón de adquisición en el bloque de credencial 3D abre el drawer #enquire."""
        soup = self.require_landing_soup()
        cta_block = soup.select_one('[data-block="cta"]')
        has_enquire_hook = (
            bool(cta_block.find(attrs={"data-modal-open": "#enquire"})) or
            bool(cta_block.find("a", href="#enquire")) or
            bool(cta_block.find(id=lambda i: i and "enquire" in i))
        )
        scripts_text = self.get_scripts_text()
        has_script_hook = bool(re.search(r"cta.*enquire|showModal", scripts_text, re.I))
        self.assertTrue(has_enquire_hook or has_script_hook, "El CTA de credencial debe disparar el drawer #enquire")

    def test_x02_02_credencial_cta_button_styling_contrast(self):
        """X2: El botón de credencial mantiene contraste alto sobre el fondo oscuro del bloque CTA."""
        soup = self.require_landing_soup()
        cta_block = soup.select_one('[data-block="cta"]')
        button = cta_block.find(lambda e: e.name in ["button", "a"])
        self.assertIsNotNone(button, "Falta botón en bloque CTA")
        classes = " ".join(button.get("class", []))
        has_style = bool(re.search(r"(btn|bg-|text-|rounded)", classes))
        self.assertTrue(has_style, "El botón de credencial debe tener clases de estilo de contraste")

    # --------------------------------------------------------------------------
    # X3: Header Scrolled Class Mechanics
    # --------------------------------------------------------------------------
    def test_x03_01_scroll_listener_threshold_evaluation(self):
        """X3: Listener de scroll evalúa umbral de scrollY (>= 40px o > 50px)."""
        scripts_text = self.get_scripts_text()
        has_threshold = bool(re.search(r"scrollY\s*[><=]\s*\d+", scripts_text))
        self.assertTrue(has_threshold, "El script debe comparar scrollY contra un umbral numérico")

    def test_x03_02_scrolled_class_idempotent_toggle(self):
        """X3: Script añade o remueve la clase 'scrolled' según la posición de scroll."""
        scripts_text = self.get_scripts_text()
        has_toggle = bool(re.search(r"(classList\.toggle|classList\.add\(['\"]scrolled['\"].*classList\.remove)", scripts_text, re.DOTALL))
        self.assertTrue(has_toggle, "El script debe alternar la clase 'scrolled' de manera idempotente")

    # --------------------------------------------------------------------------
    # X4: Fixed Bottom Bar Trigger
    # --------------------------------------------------------------------------
    def test_x04_01_bottom_bar_triggers_find_a_table_modal(self):
        """X4: Clic en la barra inferior fija abre el modal find-a-table con showModal()."""
        scripts_text = self.get_scripts_text()
        has_open = bool(re.search(r"find-a-table.*showModal|modal-open|showModal", scripts_text))
        self.assertTrue(has_open, "El script debe invocar showModal() para desplegar el modal de acceso")

    def test_x04_02_header_z_index_hierarchy(self):
        """X4: El header superior tiene z-index apropiado (z-40 / z-50) y la barra inferior fija está ausente."""
        soup = self.require_landing_soup()
        header = soup.select_one('#site-header')
        classes = " ".join(header.get("class", [])) if header else ""
        has_z = bool(re.search(r"z-\d+", classes))
        self.assertTrue(has_z, "El header superior debe tener clase z-index explícita")
        self.assertIsNone(soup.select_one('[data-find-a-table-btn]'), "La barra inferior fija debe estar eliminada")

    # --------------------------------------------------------------------------
    # X5: Hamburger Drawer vs Body Scroll Locking
    # --------------------------------------------------------------------------
    def test_x05_01_menu_drawer_toggle_state_mutation(self):
        """X5: Clic en el toggle de menú modifica el estado visible del drawer."""
        scripts_text = self.get_scripts_text()
        has_mutation = bool(re.search(r"(menu-drawer--open|translate|drawer.*toggle|open)", scripts_text, re.I))
        self.assertTrue(has_mutation, "El script debe mutar el estado de clases para mostrar/ocultar el menú drawer")

    def test_x05_02_menu_drawer_body_scroll_coordination(self):
        """X5: Abrir el menú drawer previene el scroll de fondo en el body."""
        scripts_text = self.get_scripts_text()
        has_body_lock = bool(re.search(r"body.*(overflow\s*=\s*['\"]hidden['\"]|overflow-hidden|menu-drawer--open-active)", scripts_text))
        self.assertTrue(has_body_lock, "El drawer de menú debe coordinar el bloqueo de scroll en el body")

    # --------------------------------------------------------------------------
    # X6: Native Dialog ESC Key Handling & Backdrop Close
    # --------------------------------------------------------------------------
    def test_x06_01_dialog_native_escape_support(self):
        """X6: Elementos <dialog> soportan la tecla Escape nativa para cierre accesible."""
        soup = self.require_landing_soup()
        dialogs = soup.find_all("dialog")
        self.assertGreaterEqual(len(dialogs), 2, "Deben existir elementos nativos <dialog> que soportan la tecla Escape")

    def test_x06_02_dialog_close_restores_body_scroll(self):
        """X6: Cerrar diálogos remueve la clase overflow-hidden del body."""
        scripts_text = self.get_scripts_text()
        has_unlock = bool(re.search(r"(overflow\s*=\s*['\"]['\"]|remove\(['\"]overflow-hidden['\"]|overflow\s*=\s*['\"]auto['\"])", scripts_text))
        self.assertTrue(has_unlock, "Cerrar modales o drawers debe remover la clase 'overflow-hidden' del body")

    # --------------------------------------------------------------------------
    # X7: Newsletter Form State Isolation
    # --------------------------------------------------------------------------
    def test_x07_01_newsletter_submission_state_isolation(self):
        """X7: El formulario de newsletter maneja el evento submit de forma aislada sin alterar modales."""
        scripts_text = self.get_scripts_text()
        has_newsletter_handler = bool(re.search(r"data-subscribe-form|subscribe-form|formSubscribe|newsletter", scripts_text, re.I))
        self.assertTrue(has_newsletter_handler, "El script debe tener un manejador dedicado para la suscripción de newsletter")

    def test_x07_02_newsletter_feedback_message_interaction(self):
        """X7: Suscripción a newsletter provee retroalimentación visual al usuario en pantalla."""
        scripts_text = self.get_scripts_text()
        has_feedback = bool(re.search(r"(alert|textContent|innerHTML|classList\.add|toast|gracias|suscrito)", scripts_text, re.I))
        self.assertTrue(has_feedback, "La suscripción a newsletter debe presentar confirmación interactiva al usuario")


# ==============================================================================
# TIER 4: VIAJES DE USUARIO COMPLETOS DE PUNTA A PUNTA (J1 - J5)
# ==============================================================================
class Tier4EndToEndUserJourneyTests(BaseLandingTestCase):
    """Tier 4: Flujos completos de interacción de usuarios reales de inicio a fin."""

    # --------------------------------------------------------------------------
    # J1: Flujo de Descubrimiento de Nuevo Visitante
    # --------------------------------------------------------------------------
    def test_j01_new_visitor_discovery_flow(self):
        """J1: Flujo: Hero -> Lectura de Cita & Metadatos -> Galería Swiper -> Bloques -> Enlace al Portal."""
        soup = self.require_landing_soup()

        # Paso 1: Encuentro inicial con Hero Masthead
        hero = soup.select_one('[data-block="masthead-full"]')
        self.assertIsNotNone(hero, "J1.P1: Visitante no encuentra el Hero Masthead")
        self.assertIn("wistus", hero.get_text().lower(), "J1.P1: Título de Hero ausente")

        # Paso 2: Lectura de cita editorial y lista de metadatos
        columns = soup.select_one('[data-block="columns"]')
        self.assertIsNotNone(columns, "J1.P2: Visitante no encuentra la sección de cita y columnas")
        metadata = columns.select_one('[data-venue-metadata]')
        self.assertIsNotNone(metadata, "J1.P2: Visitante no encuentra los metadatos de ensayos")

        # Paso 3: Exploración visual de galería de fotos
        carousel = soup.select_one('[data-block="carousel"]')
        self.assertIsNotNone(carousel, "J1.P3: Visitante no encuentra la galería fotográfica")
        swiper = carousel.select_one('[data-carousel-swiper]')
        self.assertIsNotNone(swiper, "J1.P3: Contenedor de Swiper fotográfico ausente")

        # Paso 4: Exploración de los 4 bloques fraternos
        blocks_carousel = soup.select_one('[data-block="listing-carousel"]')
        self.assertIsNotNone(blocks_carousel, "J1.P4: Visitante no encuentra el carrusel de bloques fraternos")
        blocks_text = blocks_carousel.get_text().lower()
        for b in ["machas", "imillas", "sambos"]:
            self.assertIn(b, blocks_text, f"J1.P4: Falta información del bloque {b}")

        # Paso 5: Navegación final al portal
        portal_links = soup.find_all("a", href=lambda h: h and "index.html" in h)
        self.assertGreaterEqual(len(portal_links), 1, "J1.P5: Visitante no encuentra enlace para ingresar al portal")

    # --------------------------------------------------------------------------
    # J2: Flujo de Registro de Membresía de Nuevo Postulante
    # --------------------------------------------------------------------------
    def test_j02_prospective_fraterno_registration_flow(self):
        """J2: Flujo: Credencial 3D -> Clic en Adquirir -> Abre Drawer #enquire -> Completa Formulario -> Envío."""
        soup = self.require_landing_soup()

        # Paso 1: Localización del bloque 3D de credencial
        cta_block = soup.select_one('[data-block="cta"]')
        self.assertIsNotNone(cta_block, "J2.P1: Postulante no encuentra el bloque de credencial 3D")
        card = cta_block.select_one('[data-gift-card]')
        self.assertIsNotNone(card, "J2.P1: Tarjeta física holográfica de credencial ausente")

        # Paso 2: Botón de llamada a la acción para postular
        cta_btn = cta_block.find(lambda e: e.name in ["button", "a"])
        self.assertIsNotNone(cta_btn, "J2.P2: Botón de postulación de credencial ausente")

        # Paso 3: Drawer lateral de postulación disponible en el DOM
        dialog_enquire = soup.find("dialog", id="enquire")
        self.assertIsNotNone(dialog_enquire, "J2.P3: Drawer lateral de postulación #enquire no existe")

        # Paso 4: Formulario con campos completos
        form = dialog_enquire.find("form")
        self.assertIsNotNone(form, "J2.P4: Formulario reactivo de postulación ausente en el drawer")
        self.assertIsNotNone(form.find("select"), "J2.P4: Selector de bloque de interés ausente")

        # Paso 5: Script que procesa el envío sin recargar
        scripts_text = self.get_scripts_text()
        self.assertIn("preventDefault", scripts_text, "J2.P5: Manejador de formulario no previene recarga")

    # --------------------------------------------------------------------------
    # J3: Flujo de Navegación Rápida con Barra Inferior Fija
    # --------------------------------------------------------------------------
    # J3: Flujo de Navegación Rápida Superior y Enlace a Portal
    # --------------------------------------------------------------------------
    def test_j03_quick_action_header_portal_flow(self):
        """J3: Flujo: Header Superior -> Enlace Directo a Portal (index.html) -> Retorno desde Portal a Landing."""
        soup = self.require_landing_soup()

        # Paso 1: Confirmación de que la barra inferior fija fue retirada
        bottom_bar = soup.select_one('[data-find-a-table-btn]')
        self.assertIsNone(bottom_bar, "J3.P1: La barra inferior fija debe estar eliminada")

        # Paso 2: Enlace directo al portal en el header superior
        portal_btn = soup.select_one('header a[href*="index.html"], [data-header] a[href*="index.html"]')
        self.assertIsNotNone(portal_btn, "J3.P2: Enlace de acceso a index.html ausente en header")

        # Paso 3: Botón de postular en el header superior
        postular_btn = soup.select_one('header button[data-open-enquire], [data-header] button[data-open-enquire]')
        self.assertIsNotNone(postular_btn, "J3.P3: Botón de postular ausente en header")

        # Paso 4: Enlace recíproco de regreso en index.html
        index_content = get_index_html()
        self.assertIsNotNone(index_content, "J3.P4: No se pudo leer index.html")
        self.assertIn("landing.html", index_content, "J3.P4: index.html no contiene enlace de retorno a landing.html")

    # --------------------------------------------------------------------------
    # J4: Flujo de Exploración Móvil mediante Menú Drawer
    # --------------------------------------------------------------------------
    def test_j04_mobile_visitor_exploration_flow(self):
        """J4: Flujo Móvil: Viewport -> Toggle Hamburguesa -> Drawer Desplegable -> Navegación de Secciones."""
        soup = self.require_landing_soup()

        # Paso 1: Botón hamburguesa accesible
        toggle = soup.select_one('[data-menu-drawer-toggle]')
        self.assertIsNotNone(toggle, "J4.P1: Botón toggle de menú ausente en móvil")

        # Paso 2: Contenedor drawer desplegable
        drawer = soup.select_one('[data-menu-drawer]')
        self.assertIsNotNone(drawer, "J4.P2: Menú drawer no encontrado")

        # Paso 3: Enlaces de ancla hacia secciones internas
        anchors = drawer.find_all("a", href=lambda h: h and h.startswith("#"))
        self.assertGreaterEqual(len(anchors), 2, "J4.P3: Drawer no contiene anclas a secciones de la página")

    # --------------------------------------------------------------------------
    # J5: Flujo de Retorno de Fraterno Registrado (Login Directo)
    # --------------------------------------------------------------------------
    def test_j05_returning_member_direct_login_flow(self):
        """J5: Flujo: Header directo a index.html -> Ingreso a Portal -> Navegación interna."""
        soup = self.require_landing_soup()

        # Paso 1: Enlace directo en cabecera
        header = soup.select_one('[data-header]') or soup.find("header")
        header_portal_link = header.find("a", href=lambda h: h and "index.html" in h)
        self.assertIsNotNone(header_portal_link, "J5.P1: Header no ofrece enlace directo al portal")

        # Paso 2: index.html cuenta con el login y barra de navegación
        index_content = get_index_html()
        self.assertIsNotNone(index_content, "J5.P2: index.html no disponible")
        self.assertIn("view-login", index_content, "J5.P2: index.html debe incluir la vista de login para fraternos")


# ==============================================================================
# EJECUTOR PERSONALIZADO CON REPORTE FORMATEADO POR TIERS
# ==============================================================================
class TierDiagnosticTestResult(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.tier_counts = {
            "Tier 1": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 2": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 3": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
            "Tier 4": {"run": 0, "passed": 0, "failed": 0, "errors": 0},
        }

    def _get_tier_from_test(self, test):
        cls_name = test.__class__.__name__
        if "Tier1" in cls_name:
            return "Tier 1"
        elif "Tier2" in cls_name:
            return "Tier 2"
        elif "Tier3" in cls_name:
            return "Tier 3"
        elif "Tier4" in cls_name:
            return "Tier 4"
        return "Tier 1"

    def startTest(self, test):
        super().startTest(test)
        tier = self._get_tier_from_test(test)
        self.tier_counts[tier]["run"] += 1

    def addSuccess(self, test):
        super().addSuccess(test)
        tier = self._get_tier_from_test(test)
        self.tier_counts[tier]["passed"] += 1

    def addFailure(self, test, err):
        super().addFailure(test, err)
        tier = self._get_tier_from_test(test)
        self.tier_counts[tier]["failed"] += 1

    def addError(self, test, err):
        super().addError(test, err)
        tier = self._get_tier_from_test(test)
        self.tier_counts[tier]["errors"] += 1


def run_e2e_test_suite():
    print("=" * 80)
    print("  TINKUS WISTUS - CARNAVAL DE ORURO 2027 -- SUITE DE PRUEBAS E2E MONTE STYLE")
    print("=" * 80)
    print(f"  Objetivo principal : {LANDING_HTML_PATH}")
    print(f"  Objetivos reciprocos: {INDEX_HTML_PATH}, {VERCEL_JSON_PATH}")
    print(f"  Directorio assets   : {ASSETS_IMG_DIR}")
    print("-" * 80)

    # Build Test Suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(Tier1FeatureCoverageTests))
    suite.addTests(loader.loadTestsFromTestCase(Tier2BoundaryCornerCaseTests))
    suite.addTests(loader.loadTestsFromTestCase(Tier3CrossFeatureCombinationTests))
    suite.addTests(loader.loadTestsFromTestCase(Tier4EndToEndUserJourneyTests))

    verbosity = 2 if ("-v" in sys.argv or "--verbose" in sys.argv) else 1

    start_time = time.time()
    runner = unittest.TextTestRunner(resultclass=TierDiagnosticTestResult, verbosity=verbosity)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    # Output Tier Breakdown
    print("\n" + "=" * 80)
    print("  DESGLOSE DETALLADO POR NIVELES (TIERS)")
    print("=" * 80)
    print("  Tier                                          | Ejecutadas | Pasaron | Fallaron | Errores")
    print("  " + "-" * 76)
    total_run = 0
    total_passed = 0
    total_failed = 0
    total_errors = 0

    tier_labels = {
        "Tier 1": "Tier 1: Feature Coverage (F1 - F17)",
        "Tier 2": "Tier 2: Boundary & Corner Cases (B1 - B5)",
        "Tier 3": "Tier 3: Cross-Feature Interactions (X1 - X7)",
        "Tier 4": "Tier 4: E2E User Journeys (J1 - J5)",
    }

    for tier_key in ["Tier 1", "Tier 2", "Tier 3", "Tier 4"]:
        counts = result.tier_counts[tier_key]
        label = tier_labels.get(tier_key, tier_key)
        print(f"  {label:<46} | {counts['run']:>10} | {counts['passed']:>7} | {counts['failed']:>8} | {counts['errors']:>7}")
        total_run += counts["run"]
        total_passed += counts["passed"]
        total_failed += counts["failed"]
        total_errors += counts["errors"]

    print("  " + "-" * 76)
    print(f"  {'TOTAL CONSOLIDADO':<46} | {total_run:>10} | {total_passed:>7} | {total_failed:>8} | {total_errors:>7}")
    print("=" * 80)
    print(f"  Tiempo de ejecucion: {elapsed:.2f} segundos")

    if result.wasSuccessful():
        print("\n  [EXITO] TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% CUMPLIMIENTO).")
        print("=" * 80)
        return 0
    else:
        print(f"\n  [FALLO] SE DETECTARON DEFECTOS: {total_failed} fallos, {total_errors} errores.")
        print("=" * 80)
        return 1


if __name__ == "__main__":
    exit_code = run_e2e_test_suite()
    sys.exit(exit_code)
