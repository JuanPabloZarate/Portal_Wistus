"""
Suite de Pruebas Automatizadas de Contraste, Badges y Compatibilidad de Temas
Verifica rigurosamente que no existan combinaciones ilegibles de texto oscuro sobre fondo oscuro
o texto claro sobre fondo claro en css/style.css, js/pagos.js e index.html.
"""

import unittest
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    # WCAG relative luminance formula
    r, g, b = [x / 255.0 for x in rgb]
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(hex1, hex2):
    lum1 = relative_luminance(hex_to_rgb(hex1))
    lum2 = relative_luminance(hex_to_rgb(hex2))
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)


class TestBadgeContrastAndThemes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(PROJECT_ROOT, 'css', 'style.css'), encoding='utf-8') as f:
            cls.css = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'pagos.js'), encoding='utf-8') as f:
            cls.pagos_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'index.html'), encoding='utf-8') as f:
            cls.index_html = f.read()

    def test_01_soft_badges_wcag_contrast_light_theme(self):
        """Verifica que todas las combinaciones de soft badges en modo claro superen WCAG AA (>= 4.5:1)."""
        color_pairs = {
            'danger': ('#fee2e2', '#991b1b'),
            'success': ('#dcfce7', '#166534'),
            'warning': ('#fef3c7', '#92400e'),
            'primary': ('#dbeafe', '#1e40af'),
            'secondary': ('#f1f5f9', '#334155'),
            'info': ('#e0f2fe', '#075985'),
            'brand': ('#ede9fe', '#6d28d9'),
        }
        for name, (bg, fg) in color_pairs.items():
            ratio = contrast_ratio(bg, fg)
            self.assertGreaterEqual(
                ratio, 4.5,
                f"Soft badge '{name}' con fondo {bg} y texto {fg} tiene ratio {ratio:.2f}:1, menor que 4.5:1"
            )

    def test_02_css_defines_soft_badges_and_overrides(self):
        """Verifica que css/style.css declare explícitamente estilos para soft badges."""
        self.assertIn('.badge-subtle-danger', self.css)
        self.assertIn('.badge-subtle-success', self.css)
        self.assertIn('.badge-subtle-warning', self.css)
        self.assertIn('.badge-subtle-primary', self.css)
        self.assertIn('.badge-subtle-secondary', self.css)
        self.assertIn('.badge-subtle-info', self.css)
        self.assertIn('#fee2e2', self.css, "Fondo de peligro suave #fee2e2 debe estar presente")
        self.assertIn('#991b1b', self.css, "Texto de peligro suave #991b1b debe estar presente")
        self.assertIn('#166534', self.css, "Texto de éxito suave #166534 debe estar presente")

    def test_03_css_handles_bootstrap_opacity_classes(self):
        """Verifica que las clases de opacidad auxiliares (--bs-bg-opacity) estén definidas."""
        self.assertIn('.bg-opacity-15', self.css)
        self.assertIn('.bg-opacity-20', self.css)
        self.assertIn('.border-opacity-30', self.css)
        self.assertIn('.border-opacity-40', self.css)

    def test_04_css_protects_solid_badge_white_text(self):
        """Verifica que badges sólidos como .sidebar-badge y .badge.text-white mantengan texto blanco."""
        self.assertIn('.sidebar-badge', self.css)
        self.assertIn('color: #ffffff !important', self.css)
        # Asegurar que .text-white no fuerce #0f172a en badges o barras de progreso
        self.assertIn('.text-white:not(.badge)', self.css)

    def test_05_pagos_js_uses_subtle_and_high_contrast_badges(self):
        """Verifica que pagos.js aplique clases de alta legibilidad en cuotas y estados."""
        self.assertIn('badge-subtle-danger', self.pagos_js)
        self.assertIn('badge-subtle-success', self.pagos_js)
        self.assertIn('badge-subtle-primary', self.pagos_js)
        self.assertIn('badge-subtle-secondary', self.pagos_js)
        self.assertIn('badge-subtle-info', self.pagos_js)
        self.assertIn('badge-estado-general', self.pagos_js)
        self.assertIn('cuota-detail-pill', self.pagos_js)

    def test_06_dark_mode_rules_exist_in_css(self):
        """Verifica que existan adaptaciones explícitas de contraste para [data-bs-theme="dark"] o [data-theme="dark"]."""
        self.assertIn('[data-bs-theme="dark"]', self.css)
        self.assertIn('[data-theme="dark"]', self.css)
        self.assertIn('.cuota-detail-pill', self.css)
        self.assertIn('.fin-summary-card', self.css)
        self.assertIn('#fca5a5', self.css, "Texto rosa claro #fca5a5 para peligro en dark mode")
        self.assertIn('#86efac', self.css, "Texto verde claro #86efac para éxito en dark mode")

    def test_07_festive_dark_cards_protect_white_text(self):
        """Verifica que las tarjetas con fondos degradados oscuros (.gold-shimmer-card) protejan su texto blanco."""
        self.assertIn('.gold-shimmer-card', self.css)
        self.assertIn('.festive-banner-card', self.css)

    def test_08_dark_mode_contrast_wcag_aa(self):
        """Verifica que los colores de texto para modo oscuro alcancen WCAG AA (>= 4.5:1) sobre superficie #1e293b."""
        dark_surface = '#1e293b'
        dark_text_colors = {
            'danger': '#fca5a5',
            'success': '#86efac',
            'warning': '#fde68a',
            'primary': '#93c5fd',
            'secondary': '#cbd5e1',
            'info': '#7dd3fc',
            'brand': '#c4b5fd',
            'light-text': '#f8fafc'
        }
        for name, text_color in dark_text_colors.items():
            ratio = contrast_ratio(dark_surface, text_color)
            self.assertGreaterEqual(
                ratio, 4.5,
                f"Dark mode '{name}' con superficie {dark_surface} y texto {text_color} tiene ratio {ratio:.2f}:1, menor que 4.5:1"
            )

    def test_09_financial_card_dark_mode_contrast(self):
        """Verifica que fin-summary-card tenga reglas explícitas de contraste para text-danger y text-success en dark mode."""
        self.assertIn('.fin-summary-card .fin-value.text-danger', self.css)
        self.assertIn('.fin-summary-card .fin-value.text-success', self.css)
        self.assertIn('.fin-summary-card .progress', self.css)

    def test_10_cuota_pills_modifier_classes(self):
        """Verifica que cuota-detail-pill tenga clases modificadoras para warning y primary sin depender de inline styles."""
        self.assertIn('.cuota-detail-pill.cuota-pill-warning', self.css)
        self.assertIn('.cuota-detail-pill.cuota-pill-primary', self.css)
        self.assertIn('cuota-pill-warning', self.pagos_js)
        self.assertIn('cuota-pill-primary', self.pagos_js)

    def test_11_no_raw_bg_danger_with_text_danger_in_table_badges(self):
        """Verifica que pagos.js no combine bg-danger con text-danger en cuota-detail-pill ni badge-estado-general."""
        self.assertNotIn('cuota-detail-pill .badge.text-danger bg-danger', self.pagos_js)
        self.assertNotIn('badge-subtle-danger bg-danger text-danger', self.pagos_js)
        # Asegurar que se usen las clases semánticas puras
        self.assertIn('class="badge badge-subtle-danger rounded-pill', self.pagos_js)
        self.assertIn('class="badge badge-subtle-success rounded-pill', self.pagos_js)


if __name__ == '__main__':
    unittest.main()
