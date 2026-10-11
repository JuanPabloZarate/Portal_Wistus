"""
TEST SUITE DE VERIFICACIÓN ARQUITECTÓNICA - ROL DIRECTIVA GENERAL Y GESTIÓN INSTITUCIONAL
Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus

Valida exhaustivamente:
1. Credenciales y chips de acceso rápido (directiva / directiva123 y admi / admi123).
2. Autenticación y asignación de rol 'directiva' desacoplado de 'control'.
3. Protección perimetral del enrutador (showView, navigateHome, navigateToDashboard).
4. Integridad del DOM de las vistas independientes directiva-dashboard y directiva-directorio.
5. Ausencia total y absoluta de campos y términos financieros en las vistas y exportaciones de directiva.
6. Aislamiento del Kardex fraternal ante directiva (ocultamiento de cuotas y pagos).
7. Estructura de módulos segregados en Sidebar (Módulo Gestión Fraternidad vs Módulo Financiero).
"""

import unittest
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

class TestDirectivaRoleArchitecture(unittest.TestCase):

    def setUp(self):
        with open(os.path.join(PROJECT_ROOT, 'index.html'), encoding='utf-8') as f:
            self.index_html = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'auth.js'), encoding='utf-8') as f:
            self.auth_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'app.js'), encoding='utf-8') as f:
            self.app_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'data.js'), encoding='utf-8') as f:
            self.data_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'state.js'), encoding='utf-8') as f:
            self.state_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'miembros.js'), encoding='utf-8') as f:
            self.miembros_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'pagos.js'), encoding='utf-8') as f:
            self.pagos_js = f.read()

    # -------------------------------------------------------------------------
    # 1. CONFIGURACIÓN Y CREDENCIALES POR DEFECTO
    # -------------------------------------------------------------------------
    def test_01_default_credentials_directiva_configured(self):
        """Verifica que DEFAULT_PORTAL_CONFIG contenga la cuenta directiva (directiva / directiva123)."""
        self.assertIn("directiva_user", self.data_js)
        self.assertIn("username: 'directiva'", self.data_js)
        self.assertIn("password: 'directiva123'", self.data_js)

    def test_02_quick_login_chips_in_html(self):
        """Verifica la existencia de los chips de acceso rápido para admi y directiva en el login."""
        self.assertIn('data-user="admi"', self.index_html)
        self.assertIn('data-pass="admi123"', self.index_html)
        self.assertIn('data-user="directiva"', self.index_html)
        self.assertIn('data-pass="directiva123"', self.index_html)
        self.assertIn('btn-quick-admin', self.index_html)

    # -------------------------------------------------------------------------
    # 2. AUTENTICACIÓN Y DISCRIMINACIÓN DE ROLES (AUTH.JS)
    # -------------------------------------------------------------------------
    def test_03_auth_assigns_directiva_role(self):
        """Verifica que el login distinga el rol 'directiva' de 'control' y genere sesión adecuada."""
        self.assertIn("assignedRole = 'directiva'", self.auth_js)
        self.assertIn("is_directiva: assignedRole === 'directiva'", self.auth_js)
        self.assertIn("navigateToDashboard(assignedRole)", self.auth_js)

    # -------------------------------------------------------------------------
    # 3. ENRUTADOR Y PROTECCIÓN DE VISTAS (APP.JS)
    # -------------------------------------------------------------------------
    def test_04_router_protects_financial_views_from_directiva(self):
        """Verifica que el router bloquee el acceso de 'directiva' a vistas financieras."""
        self.assertIn("financialViews = ['control-pagos', 'control-dashboard', 'control-directorio']", self.app_js)
        self.assertIn("currentRole === 'directiva'", self.app_js)
        self.assertIn("viewName = 'directiva-dashboard'", self.app_js)

    def test_05_router_navigation_methods_support_directiva(self):
        """Verifica que navigateHome y navigateToDashboard soporten el rol directiva."""
        self.assertIn("session.role === 'directiva'", self.app_js)
        self.assertIn("this.showView('directiva-dashboard')", self.app_js)
        self.assertIn("role === 'directiva'", self.app_js)

    def test_06_breadcrumbs_maps_directiva_views(self):
        """Verifica que las migas de pan mapeen directiva-dashboard y directiva-directorio."""
        self.assertIn("'directiva-dashboard': 'Dashboard Institucional'", self.app_js)
        self.assertIn("'directiva-directorio': 'Padrón Institucional'", self.app_js)

    # -------------------------------------------------------------------------
    # 4. SIDEBAR Y ARQUITECTURA DE MÓDULOS (INDEX.HTML & APP.JS)
    # -------------------------------------------------------------------------
    def test_07_sidebar_sections_segregation(self):
        """Verifica que existan las secciones de sidebar para directiva y control con sus módulos."""
        self.assertIn('id="sidebarSectionDirectiva"', self.index_html)
        self.assertIn('id="sidebarSectionControl"', self.index_html)
        self.assertIn('data-subpage="directiva-dashboard"', self.index_html)
        self.assertIn('data-subpage="directiva-directorio"', self.index_html)

        # En la sección de directiva no debe existir acceso a control-pagos ni control-directorio
        sec_dir_match = re.search(r'<div id="sidebarSectionDirectiva".*?</div>\s*<!--', self.index_html, re.DOTALL)
        self.assertIsNotNone(sec_dir_match, "sidebarSectionDirectiva debe estar cerrado adecuadamente")
        sec_dir_html = sec_dir_match.group(0)
        self.assertNotIn('data-subpage="control-pagos"', sec_dir_html)
        self.assertNotIn('data-subpage="control-directorio"', sec_dir_html)
        self.assertNotIn('Libro de Cuotas', sec_dir_html)
        self.assertNotIn('Cobros', sec_dir_html)

    def test_08_layout_session_displays_directiva(self):
        """Verifica que updateLayoutSession active el menú institucional y muestre el rol Directiva General."""
        self.assertIn("session.role === 'directiva'", self.app_js)
        self.assertIn("Directiva General", self.app_js)
        self.assertIn("sectionDirectiva.classList.remove('d-none')", self.app_js)
        self.assertIn("this.renderMobileBottomNav('directiva')", self.app_js)

    # -------------------------------------------------------------------------
    # 5. DASHBOARD INSTITUCIONAL DIRECTIVA (DOM & RENDER)
    # -------------------------------------------------------------------------
    def test_09_directiva_dashboard_dom_structure(self):
        """Verifica la existencia del DOM de #view-directiva-dashboard y sus métricas institucionales."""
        self.assertIn('id="view-directiva-dashboard"', self.index_html)
        self.assertIn('id="directivaMetricActivos"', self.index_html)
        self.assertIn('id="directivaMetricFiliales"', self.index_html)
        self.assertIn('id="directivaMetricAsistenciaPct"', self.index_html)
        self.assertIn('id="directivaMetricEventosCount"', self.index_html)
        self.assertIn('id="directivaFilialesBadgesContainer"', self.index_html)

    def test_10_directiva_dashboard_zero_financial_leaks(self):
        """Verifica que #view-directiva-dashboard no contenga ninguna métrica o texto financiero."""
        dash_match = re.search(r'<div id="view-directiva-dashboard".*?</div>\s*<!-- SUBPÁGINA DIRECTIVA 2', self.index_html, re.DOTALL)
        self.assertIsNotNone(dash_match)
        dash_html = dash_match.group(0).lower()
        self.assertNotIn('recaudación', dash_html)
        self.assertNotIn('recaudado', dash_html)
        self.assertNotIn('libro de cuotas', dash_html)
        self.assertNotIn('bs.', dash_html)
        self.assertNotIn('cobro de cuota', dash_html)
        self.assertNotIn('registrar pago', dash_html)

    def test_11_render_directiva_dashboard_implementation(self):
        """Verifica que renderDirectivaDashboard en app.js no invoque métodos financieros."""
        self.assertIn("renderDirectivaDashboard()", self.app_js)
        method_match = re.search(r'renderDirectivaDashboard\(\)\s*\{(.*?)\n\s*// --- DASHBOARD CONTROL', self.app_js, re.DOTALL)
        self.assertIsNotNone(method_match)
        code = method_match.group(1)
        self.assertNotIn("window.Pagos", code)
        self.assertNotIn("renderControlPayments", code)

    # -------------------------------------------------------------------------
    # 6. PADRÓN INSTITUCIONAL INDEPENDIENTE (DOM & MIEMBROS.JS)
    # -------------------------------------------------------------------------
    def test_12_directiva_directorio_dom_structure(self):
        """Verifica la existencia del DOM independiente de #view-directiva-directorio."""
        self.assertIn('id="view-directiva-directorio"', self.index_html)
        self.assertIn('id="searchDirectivaMember"', self.index_html)
        self.assertIn('id="filterDirectivaFilial"', self.index_html)
        self.assertIn('id="filterDirectivaRol"', self.index_html)
        self.assertIn('id="filterDirectivaEstado"', self.index_html)
        self.assertIn('id="dirDirectivaCountTotal"', self.index_html)
        self.assertIn('id="directivaDirectoryTable"', self.index_html)
        self.assertIn('id="directivaDirectoryTableBody"', self.index_html)

    def test_13_directiva_directory_table_has_no_financial_columns(self):
        """Verifica que la tabla de padrón institucional no tenga columnas ni botones de cobro/cuotas."""
        dir_match = re.search(r'<div id="view-directiva-directorio".*?</div>\s*<!-- ========================================================================= -->\s*<!-- VISTAS DE ROL CONTROL', self.index_html, re.DOTALL)
        self.assertIsNotNone(dir_match)
        dir_html = dir_match.group(0).lower()
        self.assertNotIn('cobrar', dir_html)
        self.assertNotIn('deuda', dir_html)
        self.assertNotIn('saldo', dir_html)
        self.assertNotIn('cuota', dir_html)
        self.assertNotIn('bs.', dir_html)

    def test_14_miembros_methods_for_directiva(self):
        """Verifica que renderDirectivaDirectory y exportDirectivaDirectoryCSV existan en miembros.js."""
        self.assertIn("renderDirectivaDirectory()", self.miembros_js)
        self.assertIn("exportDirectivaDirectoryCSV()", self.miembros_js)
        self.assertIn("directivaDirectoryTableBody", self.miembros_js)

    # -------------------------------------------------------------------------
    # 7. PROTECCIÓN DEL KARDEX OFICIAL ANTE DIRECTIVA
    # -------------------------------------------------------------------------
    def test_15_kardex_elements_guarded(self):
        """Verifica que en el kardex las cuotas y pagos estén blindados si el rol es directiva."""
        self.assertIn('id="btnKardexCuotas"', self.index_html)
        self.assertIn('id="kardexPagosCol"', self.index_html)
        self.assertIn('id="kardexAsistenciasCol"', self.index_html)

        # En viewMemberDetails de miembros.js se debe verificar isDirectiva
        self.assertIn("const isDirectiva = session && session.role === 'directiva';", self.miembros_js)
        self.assertIn("btnCuotas.classList.add('d-none')", self.miembros_js)
        self.assertIn("pagosCol.classList.add('d-none')", self.miembros_js)

    # -------------------------------------------------------------------------
    # 8. DEFENSAS EN PROFUNDIDAD EN PAGOS.JS
    # -------------------------------------------------------------------------
    def test_16_pagos_service_guards_directiva(self):
        """Verifica que en pagos.js las operaciones críticas de cobro rechacen al rol directiva."""
        self.assertIn("openRegisterPaymentModal", self.pagos_js)
        self.assertIn("openEditFraternoCuotasModal", self.pagos_js)
        # Ambas funciones deben validar y bloquear a directiva
        self.assertIn("session.role === 'directiva'", self.pagos_js)

    # -------------------------------------------------------------------------
    # 9. PRUEBAS ADVERSARIALES Y DE SEGREGACIÓN ESTRICTA
    # -------------------------------------------------------------------------
    def test_17_credential_segregation_no_cross_authentication(self):
        """Verifica que las credenciales de control y directiva no compartan contraseñas ni permitan cross-auth."""
        self.assertIn("directivaUsers = ['directiva']", self.auth_js)
        self.assertIn("controlUsers = ['admi', 'control', 'admin', 'supervisor']", self.auth_js)
        # 'directiva' no debe estar en allowed_users de control_user en data.js
        ctrl_match = re.search(r'control_user:\s*\{.*?allowed_users:\s*\[(.*?)\]', self.data_js, re.DOTALL)
        self.assertIsNotNone(ctrl_match)
        self.assertNotIn("'directiva'", ctrl_match.group(1))

    def test_18_kardex_dom_no_financial_content_and_hidden_delete(self):
        """Verifica que el Kardex no inyecte pagos en el DOM para directiva y oculte el botón de baja."""
        self.assertIn('id="btnKardexDelete"', self.index_html)
        self.assertIn("btnDelete.classList.add('d-none')", self.miembros_js)
        self.assertIn("pagosContainer.innerHTML = '';", self.miembros_js)

    def test_19_member_editing_accessible_to_directiva_with_refresh(self):
        """Verifica que directiva pueda editar datos institucionales y refresque ambas vistas."""
        self.assertIn("session.role !== 'control' && session.role !== 'directiva'", self.miembros_js)
        self.assertIn("this.renderDirectivaDirectory()", self.miembros_js)
        self.assertIn("renderDirectivaDashboard()", self.miembros_js)

    def test_20_reactive_subscriptions_include_directiva(self):
        """Verifica que PortalState.subscribe notifique y refresque las vistas de directiva."""
        self.assertIn("if (session.role === 'directiva') this.renderDirectivaDirectory();", self.miembros_js)
        self.assertIn("this.currentView === 'directiva-dashboard'", self.app_js)
        self.assertIn("this.currentView === 'directiva-directorio'", self.app_js)

    def test_21_mobile_more_modal_segregation(self):
        """Verifica que en el menú Más móvil, directiva no vea Personalizar Marca y tenga accesos institucionales."""
        self.assertIn("openBottomNavMoreModal()", self.app_js)
        fn_start = self.app_js.find("openBottomNavMoreModal()")
        self.assertNotEqual(fn_start, -1)
        fn_code = self.app_js[fn_start:fn_start + 6000]
        self.assertIn("else if (role === 'directiva')", fn_code)
        more_match = re.search(r"else if \(role === 'directiva'\)\s*\{(.*?)\}\s*else\s*\{", fn_code, re.DOTALL)
        self.assertIsNotNone(more_match)
        directiva_more_code = more_match.group(1)
        self.assertNotIn("btnMorePersonalizarMarca", directiva_more_code)
        self.assertNotIn("Personalizar Marca", directiva_more_code)
        self.assertIn("Dashboard Institucional", directiva_more_code)
        self.assertIn("Padrón Institucional", directiva_more_code)

    def test_22_pagos_comprehensive_defense_in_depth(self):
        """Verifica que todas las operaciones de comprobantes y catálogo de cuotas bloqueen al rol directiva."""
        funcs = ["openViewVoucherModal", "confirmVoucherDirectly", "rejectVoucherDirectly",
                 "confirmAllVouchersInBatch", "openCuotaEditorModal", "saveCuotaEditor", "deleteCuotaPrompt"]
        for fn in funcs:
            fn_idx = self.pagos_js.find(f"\n    {fn}(")
            self.assertNotEqual(fn_idx, -1, f"Declaración de {fn} debe existir en pagos.js")
            fn_chunk = self.pagos_js[fn_idx:fn_idx + 600]
            self.assertIn("session.role === 'directiva'", fn_chunk, f"{fn} debe verificar y bloquear role directiva")


if __name__ == '__main__':
    unittest.main()
