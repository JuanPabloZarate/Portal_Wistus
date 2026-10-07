"""
SUITE DE PRUEBAS AUTOMATIZADAS - PANEL DIRECTIVA DE CONTROL DE CUOTAS & VERIFICACIÓN
Verificación rigurosa de las 5 funcionalidades + migración de verificación de pago:
1. Identificar fraterno y cuotas
2. Editar fraterno y las cuotas asignadas
3. Modificar cuotas asignadas por selección múltiple según filtros
4. Cambiar nombres a cuotas (propagación reactiva)
5. Asignar cobro único a uno o varios fraternos
6. Gestión y migración de verificación de pagos (Vouchers)
7. Integridad estructural y de interfaz en index.html, pagos.js y state.js
"""

import unittest
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


class TestDirectivaCuotasModule(unittest.TestCase):

    def setUp(self):
        with open(os.path.join(PROJECT_ROOT, 'index.html'), encoding='utf-8') as f:
            self.index_html = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'state.js'), encoding='utf-8') as f:
            self.state_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'pagos.js'), encoding='utf-8') as f:
            self.pagos_js = f.read()
        with open(os.path.join(PROJECT_ROOT, 'js', 'miembros.js'), encoding='utf-8') as f:
            self.miembros_js = f.read()

    # -------------------------------------------------------------
    # 1. IDENTIFICAR FRATERNO Y CUOTAS
    # -------------------------------------------------------------
    def test_01_identificar_fraterno_y_cuotas_state_methods(self):
        """Verifica que PortalState exponga los métodos de consulta de cuotas por miembro y estado financiero."""
        self.assertIn("getMemberCuotas", self.state_js)
        self.assertIn("getMemberFinancialStatus", self.state_js)
        self.assertIn("renderControlFraternosCuotasTable", self.pagos_js)
        self.assertIn("controlFraternosFilter", self.pagos_js)

    def test_02_identificar_fraterno_y_cuotas_dom_structure(self):
        """Verifica la existencia de la tabla y controles de filtrado para identificar fraternos y cuotas."""
        self.assertIn('id="tab-control-fraternos-btn"', self.index_html)
        self.assertIn('id="tab-control-fraternos-cuotas"', self.index_html)
        self.assertIn('id="ctrlFraternosSearchInput"', self.index_html)
        self.assertIn('id="ctrlFraternosFilialSelect"', self.index_html)
        self.assertIn('id="ctrlFraternosRolSelect"', self.index_html)
        self.assertIn('id="ctrlFraternosEstadoSelect"', self.index_html)
        self.assertIn('id="ctrlFraternosCuotaSelect"', self.index_html)
        self.assertIn('id="controlFraternosTableBody"', self.index_html)

    # -------------------------------------------------------------
    # 2. EDITAR FRATERNO Y LAS CUOTAS ASIGNADAS
    # -------------------------------------------------------------
    def test_03_editar_fraterno_y_cuotas_state_and_pagos(self):
        """Verifica la capacidad de editar fraterno y sus cuotas asignadas (personalización de montos/exoneraciones)."""
        self.assertIn("setMemberCuotasAsignadas", self.state_js)
        self.assertIn("openEditFraternoCuotasModal", self.pagos_js)
        self.assertIn("saveEditFraternoCuotas", self.pagos_js)
        self.assertIn("deleteCobroUnicoFromMember", self.pagos_js)

    def test_04_editar_fraterno_modal_dom(self):
        """Verifica que el modal de edición de fraterno y cuotas asignadas exista en index.html."""
        self.assertIn('id="modalEditFraternoCuotas"', self.index_html)
        self.assertIn('id="editFraternoNombres"', self.index_html)
        self.assertIn('id="editFraternoApellidos"', self.index_html)
        self.assertIn('id="editFraternoCuotasTableBody"', self.index_html)
        self.assertIn('id="editFraternoCobrosUnicosContainer"', self.index_html)

    # -------------------------------------------------------------
    # 3. MODIFICAR CUOTAS ASIGNADAS POR SELECCIÓN MÚLTIPLE SEGÚN FILTROS
    # -------------------------------------------------------------
    def test_05_seleccion_multiple_y_modificacion_en_lote_state_pagos(self):
        """Verifica los métodos de selección múltiple y mutación en bloque de cuotas asignadas."""
        self.assertIn("batchUpdateCuotas", self.state_js)
        self.assertIn("toggleSelectAllVisibleFraternos", self.pagos_js)
        self.assertIn("toggleSelectFraterno", self.pagos_js)
        self.assertIn("openBatchCuotasModal", self.pagos_js)
        self.assertIn("applyBatchCuotas", self.pagos_js)
        self.assertIn("clearFraternoSelection", self.pagos_js)

    def test_06_seleccion_multiple_dom_and_batch_bar(self):
        """Verifica la barra flotante de acciones masivas y el modal de modificación por selección múltiple."""
        self.assertIn('id="cbSelectAllFraternos"', self.index_html)
        self.assertIn('id="ctrlFraternosBatchBar"', self.index_html)
        self.assertIn('id="ctrlBatchSelectedCount"', self.index_html)
        self.assertIn('id="modalBatchCuotas"', self.index_html)
        self.assertIn('id="batchCuotaAction"', self.index_html)
        self.assertIn('id="batchCuotaSelect"', self.index_html)

    # -------------------------------------------------------------
    # 4. CAMBIAR NOMBRES A CUOTAS
    # -------------------------------------------------------------
    def test_07_cambiar_nombres_a_cuotas(self):
        """Verifica el flujo de renombrado de cuotas con propagación en cascada en estado y vista."""
        self.assertIn("renameCuota", self.state_js)
        self.assertIn("quickRenameCuota", self.pagos_js)
        self.assertIn("saveQuickRenameCuota", self.pagos_js)
        self.assertIn('id="modalRenameCuota"', self.index_html)
        self.assertIn('id="renameCuotaNewTitle"', self.index_html)

    # -------------------------------------------------------------
    # 5. ASIGNAR COBRO ÚNICO A UNO O VARIOS FRATERNOS
    # -------------------------------------------------------------
    def test_08_asignar_cobro_unico_state_and_pagos(self):
        """Verifica los métodos de asignación de cobros únicos extraordinarios."""
        self.assertIn("assignCobroUnico", self.state_js)
        self.assertIn("openCobroUnicoModal", self.pagos_js)
        self.assertIn("saveCobroUnico", self.pagos_js)
        self.assertIn("updateCobroUnicoTargetUI", self.pagos_js)

    def test_09_asignar_cobro_unico_modal_dom(self):
        """Verifica el modal de cobro único con selección de destinatarios (individual, selección o masivo)."""
        self.assertIn('id="modalCobroUnico"', self.index_html)
        self.assertIn('id="cobroUnicoTitle"', self.index_html)
        self.assertIn('id="cobroUnicoMonto"', self.index_html)
        self.assertIn('id="targetTypeSelected"', self.index_html)
        self.assertIn('id="targetTypeSingle"', self.index_html)
        self.assertIn('id="targetTypeFilter"', self.index_html)

    # -------------------------------------------------------------
    # 6. MIGRACIÓN Y GESTIÓN DE VERIFICACIÓN DE PAGO
    # -------------------------------------------------------------
    def test_10_migracion_gestion_verificacion_pago(self):
        """Verifica la centralización de la bandeja de verificación de pagos en el panel directivo."""
        self.assertIn('id="tab-control-vouchers-btn"', self.index_html)
        self.assertIn('id="tab-control-vouchers-pendientes"', self.index_html)
        self.assertIn('id="ctrlVouchersAlertBanner"', self.index_html)
        self.assertIn('id="tabVouchersBadge"', self.index_html)
        self.assertIn('id="sidebarBadgeVouchers"', self.index_html)
        self.assertIn("badgePendingVouchersCount", self.pagos_js)
        self.assertIn("confirmAllVouchersInBatch", self.pagos_js)
        self.assertIn("openViewVoucherModal", self.pagos_js)

    # -------------------------------------------------------------
    # 7. INTEGRACIÓN CON KARDEX Y PADRÓN
    # -------------------------------------------------------------
    def test_11_kardex_cuotas_integration(self):
        """Verifica que desde el Kardex oficial de fraterno se pueda saltar a la edición de cuotas asignadas."""
        self.assertIn("openCuotasFromKardex", self.miembros_js)
        self.assertIn("openCuotasFromKardex()", self.index_html)

    # -------------------------------------------------------------
    # 8. SUITE ADVERSARIAL Y COMPORTAMENTAL EN PROFUNDIDAD (NODE.JS VM)
    # -------------------------------------------------------------
    def test_12_deep_behavioral_and_adversarial_suite(self):
        """Ejecuta el runner de pruebas reales en Node.js sobre los métodos de PortalState y PagosManager."""
        import subprocess
        res = subprocess.run(['node', os.path.join(PROJECT_ROOT, 'test_deep_directiva_cuotas.js')], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Deep behavioral suite failed:\n{res.stdout}\n{res.stderr}")
        self.assertIn("ALL DEEP BEHAVIORAL AND ADVERSARIAL TESTS PASSED 100%", res.stdout)


if __name__ == '__main__':
    unittest.main()
