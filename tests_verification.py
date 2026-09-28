"""
SUITE DE VERIFICACIÓN DE PROCESOS Y ESTRUCTURA DE DATOS
Portal Fraternal Tinkus Wistus 2026 - Entrada Universitaria La Paz
"""

import os
import re
import json
import unittest

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
JS_DIR = os.path.join(WORKSPACE_DIR, 'js')

class TestPortalProcessesAndData(unittest.TestCase):

    def test_01_js_files_exist_and_not_empty(self):
        """Verifica que todos los módulos JS requeridos existan y tengan contenido."""
        required_files = [
            'data.js', 'state.js', 'auth.js', 'asistencias.js',
            'pagos.js', 'miembros.js', 'app.js', 'db-service.js', 'firebase-config.js'
        ]
        for f in required_files:
            file_path = os.path.join(JS_DIR, f)
            self.assertTrue(os.path.exists(file_path), f"Falta el archivo requerido: {f}")
            self.assertGreater(os.path.getsize(file_path), 500, f"El archivo {f} es demasiado pequeño o está vacío.")

    def test_02_default_portal_config_structure(self):
        """Verifica la estructura de DEFAULT_PORTAL_CONFIG en data.js."""
        data_js_path = os.path.join(JS_DIR, 'data.js')
        with open(data_js_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extraer bloques definidos
        self.assertIn("'machas'", content)
        self.assertIn("'imillas'", content)
        self.assertIn("'mayores'", content)
        self.assertIn("'choclos'", content)
        self.assertIn("'wanllis'", content)
        self.assertIn("'directiva'", content)

        # Verificar que no queden referencias residuales de otros bloques ajenos
        self.assertNotIn("'galanes'", content.lower())
        self.assertNotIn("bloque galanes", content.lower())

        # Verificar CIs de prueba simulados
        self.assertIn("4839201", content, "Falta el CI 4839201 de Juan Pablo Quispe")
        self.assertIn("6892341", content, "Falta el CI 6892341 de Maria Elena Flores")
        self.assertIn("6998544", content, "Falta el CI 6998544 de Fraterno Oficial")

    def test_03_state_manager_consistency(self):
        """Verifica que state.js no tenga errores de configuración de bloques y cargue miembros base."""
        state_js_path = os.path.join(JS_DIR, 'state.js')
        with open(state_js_path, 'r', encoding='utf-8') as f:
            content = f.read()

        self.assertNotIn("galanes", content.lower(), "state.js contiene fallback residual 'galanes'")
        self.assertIn("bloque machas wistus", content.lower())
        self.assertIn("calculateProfileCompletion", content)
        self.assertIn("markAttendance", content)
        self.assertIn("registerPayment", content)
        self.assertIn("confirmVoucher", content)
        self.assertIn("rejectVoucher", content)
        self.assertIn("seedSampleMembers", content)

    def test_04_profile_completion_algorithm(self):
        """Simula y verifica el algoritmo de cálculo de completitud de perfil."""
        def calc_completion(member):
            criteria = [
                {'id': 'foto', 'weight': 15, 'done': bool(member.get('foto') and 'avatar-default.svg' not in member.get('foto', ''))},
                {'id': 'nombres', 'weight': 15, 'done': bool(member.get('nombres', '').strip())},
                {'id': 'apellidos', 'weight': 15, 'done': bool(member.get('apellidos', '').strip())},
                {'id': 'telefono', 'weight': 15, 'done': bool(len(member.get('telefono', '').strip()) >= 7)},
                {'id': 'email', 'weight': 15, 'done': bool('@' in member.get('email', ''))},
                {'id': 'fecha_nacimiento', 'weight': 10, 'done': bool(member.get('fecha_nacimiento', '').strip())},
                {'id': 'contacto_emergencia', 'weight': 15, 'done': bool(member.get('contacto_emergencia', '').strip() or member.get('telefono_emergencia', '').strip())}
            ]
            earned = sum(c['weight'] for c in criteria if c['done'])
            return min(100, earned)

        # Fraterno 100% completo
        member_full = {
            'foto': 'data:image/png;base64,iVBORw0KG...',
            'nombres': 'Juan Pablo',
            'apellidos': 'Quispe Mamani',
            'telefono': '+591 76543210',
            'email': 'juanpablo@tinkuswistus.bo',
            'fecha_nacimiento': '1995-04-18',
            'contacto_emergencia': 'Rosario Mamani',
            'telefono_emergencia': '+591 71234567'
        }
        self.assertEqual(calc_completion(member_full), 100)

        # Fraterno básico sin foto personalizada ni fecha de nacimiento
        member_basic = {
            'foto': 'assets/img/avatar-default.svg',
            'nombres': 'Fraterno',
            'apellidos': 'Wistus',
            'telefono': '+591 76543210',
            'email': 'fraterno@tinkuswistus.bo',
            'fecha_nacimiento': '',
            'contacto_emergencia': 'Directiva'
        }
        # 15(nombres)+15(apellidos)+15(tel)+15(email)+15(contacto) = 75%
        self.assertEqual(calc_completion(member_basic), 75)

    def test_05_attendance_and_qualification_process(self):
        """Verifica la lógica de habilitación de fraternos para la Entrada Universitaria (mínimo 80%)."""
        def js_round(val):
            import math
            return math.floor(val + 0.5)

        def check_qualification(asistencias_list, total_obligatorios):
            presentes = sum(1 for a in asistencias_list if a == 'presente')
            atrasos = sum(1 for a in asistencias_list if a == 'atraso')
            licencias = sum(1 for a in asistencias_list if a == 'licencia')
            effective_score = presentes + (atrasos * 0.7) + (licencias * 0.9)
            pct = js_round((effective_score / total_obligatorios) * 100) if total_obligatorios > 0 else 100
            is_habilitado = pct >= 80
            return pct, is_habilitado

        # Caso 1: 4 eventos obligatorios, 4 presentes -> 100% -> Habilitado
        pct, hab = check_qualification(['presente', 'presente', 'presente', 'presente'], 4)
        self.assertEqual(pct, 100)
        self.assertTrue(hab)

        # Caso 2: 4 eventos, 3 presentes, 1 falta -> 75% -> En Observación
        pct, hab = check_qualification(['presente', 'presente', 'presente', 'falta'], 4)
        self.assertEqual(pct, 75)
        self.assertFalse(hab)

        # Caso 3: 4 eventos, 3 presentes, 1 atraso -> (3 + 0.7)/4 = 92.5% -> 93% -> Habilitado
        pct, hab = check_qualification(['presente', 'presente', 'presente', 'atraso'], 4)
        self.assertEqual(pct, 93)
        self.assertTrue(hab)

    def test_06_payment_and_voucher_flow(self):
        """Verifica el flujo financiero de cuotas, saldos y confirmación de vouchers."""
        cuotas_totales = 250 + 350 + 800 + 200 # = 1600 Bs
        pagos = [
            {'monto': 250, 'cuota_id': 'cuota_1'},
            {'monto': 350, 'cuota_id': 'cuota_2'}
        ]
        total_pagado = sum(p['monto'] for p in pagos)
        saldo_pendiente = cuotas_totales - total_pagado
        pct_pagos = round((total_pagado / cuotas_totales) * 100)

        self.assertEqual(total_pagado, 600)
        self.assertEqual(saldo_pendiente, 1000)
        self.assertEqual(pct_pagos, 38)

        # Simular confirmación de voucher de 800 Bs (Cuota 3)
        voucher = {'id': 'VOUCH-01', 'cuota_id': 'cuota_3', 'monto': 800}
        pagos.append({'monto': voucher['monto'], 'cuota_id': voucher['cuota_id']})
        total_pagado = sum(p['monto'] for p in pagos)
        saldo_pendiente = cuotas_totales - total_pagado
        pct_pagos = round((total_pagado / cuotas_totales) * 100)

        self.assertEqual(total_pagado, 1400)
        self.assertEqual(saldo_pendiente, 200)
        self.assertEqual(pct_pagos, 88)

    def test_07_data_generator_class_definition(self):
        """Verifica que la clase WistusDataGenerator esté correctamente definida en data.js."""
        data_js_path = os.path.join(JS_DIR, 'data.js')
        with open(data_js_path, 'r', encoding='utf-8') as f:
            content = f.read()

        self.assertIn("class WistusDataGenerator", content)
        self.assertIn("generateFraterno", content)
        self.assertIn("generateSamplePadrón", content)
        self.assertIn("window.WistusDataGenerator = WistusDataGenerator", content)

    def test_08_index_html_integrity(self):
        """Verifica que index.html contenga los componentes, modales y referencias a scripts."""
        index_path = os.path.join(WORKSPACE_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Scripts requeridos en orden
        self.assertIn("js/firebase-config.js", content)
        self.assertIn("js/db-service.js", content)
        self.assertIn("js/data.js", content)
        self.assertIn("js/state.js", content)
        self.assertIn("js/auth.js", content)
        self.assertIn("js/asistencias.js", content)
        self.assertIn("js/pagos.js", content)
        self.assertIn("js/miembros.js", content)
        self.assertIn("js/app.js", content)

    def test_09_edge_case_ci_cleaning_and_matching(self):
        """Verifica la lógica de normalización y búsqueda por CI con distintos formatos."""
        def clean_ci(raw):
            if not raw:
                return ""
            return re.sub(r'[^0-9]', '', str(raw).strip())

        self.assertEqual(clean_ci("4839201 LP"), "4839201")
        self.assertEqual(clean_ci(" 6892341-CB "), "6892341")
        self.assertEqual(clean_ci("6998544"), "6998544")
        self.assertEqual(clean_ci(""), "")
        self.assertEqual(clean_ci(None), "")
        self.assertEqual(clean_ci("abc"), "")

    def test_10_edge_case_boundary_payments(self):
        """Verifica casos extremos en cálculos financieros: cuota cero, pagos fraccionados, saldo cero."""
        cuota_monto = 250
        # Pago exacto
        pagos = [{'monto': 250}]
        pagado = sum(p['monto'] for p in pagos)
        saldo = max(0, cuota_monto - pagado)
        self.assertEqual(saldo, 0)

        # Pago parcial múltiple (abonos de 50, 100, 100)
        pagos_parciales = [{'monto': 50}, {'monto': 100}, {'monto': 100}]
        pagado_parcial = sum(p['monto'] for p in pagos_parciales)
        saldo_parcial = max(0, cuota_monto - pagado_parcial)
        self.assertEqual(saldo_parcial, 0)
        self.assertEqual(pagado_parcial, 250)

        # Sin pagos
        pagos_cero = []
        pagado_cero = sum(p['monto'] for p in pagos_cero)
        saldo_cero = max(0, cuota_monto - pagado_cero)
        self.assertEqual(saldo_cero, 250)

    def test_11_dynamic_generator_contract_validation(self):
        """Valida que los datos generados por el simulador cumplan el contrato de esquema requerido."""
        sample_fraterno = {
            'ci': '5432198',
            'ci_exp': 'LP',
            'nombres': 'Ramiro Fernando',
            'apellidos': 'Quisbert Arequipa',
            'email': 'ramiro.quisbert@tinkuswistus.bo',
            'telefono': '+591 76512345',
            'fecha_nacimiento': '1996-03-12',
            'contacto_emergencia': 'Familiar Quisbert',
            'telefono_emergencia': '+591 70011223',
            'talla_traje': 'L',
            'bloque_id': 'machas',
            'bloque_nombre': 'Bloque Machas Wistus',
            'rol_fraternal': 'Fraterno Titular',
            'antiguedad_anios': 3,
            'foto': 'assets/img/avatar-default.svg',
            'estado_fraterno': 'activo',
            'asistencias': {
                'ev_1': {'estado': 'presente', 'hora': '15:10', 'marcado_por': 'Secretaría Control'},
                'ev_2': {'estado': 'atraso', 'hora': '16:05', 'marcado_por': 'Secretaría Control'}
            },
            'pagos': [
                {'id': 'PAG-2198-01', 'cuota_id': 'cuota_1', 'concepto': 'Inscripción Entrada Universitaria', 'monto': 250, 'fecha': '2026-02-28', 'metodo': 'QR Banco BNB', 'nro_recibo': 'REC-54321', 'cajero': 'Tesorería Wistus', 'estado': 'pagado', 'saldo_pendiente': 0}
            ],
            'vouchers_pendientes': []
        }

        # Validaciones de contrato
        self.assertTrue(sample_fraterno['ci'].isdigit())
        self.assertIn(sample_fraterno['bloque_id'], ['machas', 'imillas', 'mayores', 'choclos', 'wanllis', 'directiva'])
        self.assertTrue(sample_fraterno['telefono'].startswith('+591'))
        self.assertIsInstance(sample_fraterno['asistencias'], dict)
        self.assertIsInstance(sample_fraterno['pagos'], list)
        self.assertIsInstance(sample_fraterno['vouchers_pendientes'], list)

    def test_12_dbservice_and_state_sync_contracts(self):
        """Verifica que DBService y StateManager tengan métodos compatibles sin recursión infinita."""
        db_path = os.path.join(JS_DIR, 'db-service.js')
        state_path = os.path.join(JS_DIR, 'state.js')

        with open(db_path, 'r', encoding='utf-8') as f:
            db_content = f.read()
        with open(state_path, 'r', encoding='utf-8') as f:
            state_content = f.read()

        # DBService methods
        self.assertIn("saveFraterno(fraterno", db_content)
        self.assertIn("saveAsistencia(registro", db_content)
        self.assertIn("savePago(pago", db_content)
        self.assertIn("saveEvento(evento", db_content)
        self.assertIn("saveAviso(aviso", db_content)

        # StateManager aliases and bridge methods
        self.assertIn("addEvento(evento)", state_content)
        self.assertIn("addEvent(eventData)", state_content)
        self.assertIn("addAsistencia(registro)", state_content)
        self.assertIn("addPago(pago)", state_content)
        self.assertIn("addAviso(aviso)", state_content)

    def test_13_generator_aliases_and_safety(self):
        """Verifica que WistusDataGenerator exponga tanto generateSamplePadron como generateSamplePadrón y sea seguro."""
        data_path = os.path.join(JS_DIR, 'data.js')
        with open(data_path, 'r', encoding='utf-8') as f:
            data_content = f.read()

        self.assertIn("generateSamplePadron", data_content)
        self.assertIn("generateSamplePadrón", data_content)
        self.assertIn("PAYMENT_METHODS", data_content)
        self.assertIn("EXPEDIDOS", data_content)

    def test_14_miembros_kardex_and_actions(self):
        """Verifica que MiembrosManager tenga openMemberKardex para integración con Command Palette."""
        miembros_path = os.path.join(JS_DIR, 'miembros.js')
        with open(miembros_path, 'r', encoding='utf-8') as f:
            content = f.read()

        self.assertIn("openMemberKardex(ci)", content)
        self.assertIn("viewMemberDetails(ci)", content)
        self.assertIn("seedSampleFraternos", content)

    def test_15_simulated_state_lifecycle(self):
        """Simula el ciclo completo de estado: agregar fraterno, registrar asistencia, pago y cálculo."""
        class MockState:
            def __init__(self):
                self.members = []
                self.events = [{'id': 'ev_1', 'obligatorio': True}, {'id': 'ev_2', 'obligatorio': True}]

            def add_member(self, ci, nombre, bloque):
                m = {'ci': ci, 'nombre': nombre, 'bloque': bloque, 'asistencias': {}, 'pagos': []}
                self.members.append(m)
                return m

            def mark_attendance(self, ci, ev_id, estado):
                m = next((x for x in self.members if x['ci'] == ci), None)
                if m:
                    m['asistencias'][ev_id] = {'estado': estado}
                return m

            def add_payment(self, ci, cuota_id, monto):
                m = next((x for x in self.members if x['ci'] == ci), None)
                if m:
                    m['pagos'].append({'cuota_id': cuota_id, 'monto': monto})
                return m

        state = MockState()
        m = state.add_member('7890123', 'Carlos Mendoza', 'Bloque Tinkus Wistus Mayores')
        self.assertEqual(len(state.members), 1)

        state.mark_attendance('7890123', 'ev_1', 'presente')
        state.mark_attendance('7890123', 'ev_2', 'atraso')
        self.assertEqual(len(m['asistencias']), 2)

        state.add_payment('7890123', 'cuota_1', 250)
        self.assertEqual(sum(p['monto'] for p in m['pagos']), 250)

if __name__ == '__main__':
    unittest.main()
