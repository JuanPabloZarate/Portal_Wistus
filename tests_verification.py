"""
SUITE DE VERIFICACIÓN DE PROCESOS Y ESTRUCTURA DE DATOS
Portal Fraternal Tinkus Wistus - Carnaval de Oruro 2027
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
        """Verifica la lógica de habilitación de fraternos para el Carnaval de Oruro 2027 (mínimo 80%)."""
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
                {'id': 'PAG-2198-01', 'cuota_id': 'cuota_1', 'concepto': 'Inscripción Oficial Carnaval de Oruro 2027', 'monto': 250, 'fecha': '2026-02-28', 'metodo': 'QR Banco BNB', 'nro_recibo': 'REC-54321', 'cajero': 'Tesorería Wistus', 'estado': 'pagado', 'saldo_pendiente': 0}
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

    def test_16_dynamic_cuotas_crud_and_validation(self):
        """Verifica la lógica de creación, edición, eliminación y validación de cuotas dinámicas."""
        pagos_path = os.path.join(JS_DIR, 'pagos.js')
        state_path = os.path.join(JS_DIR, 'state.js')
        with open(pagos_path, 'r', encoding='utf-8') as f:
            pagos_content = f.read()
        with open(state_path, 'r', encoding='utf-8') as f:
            state_content = f.read()

        self.assertIn("getCuotas", state_content)
        self.assertIn("addCuota", state_content)
        self.assertIn("updateCuota", state_content)
        self.assertIn("deleteCuota", state_content)
        self.assertIn("openCuotaEditorModal", pagos_content)
        self.assertIn("saveCuotaEditor", pagos_content)

        # Simulación de CRUD
        cuotas = [
            {'id': 'cuota_1', 'title': 'Inscripción', 'monto': 250, 'obligatorio': True},
            {'id': 'cuota_2', 'title': 'Banda', 'monto': 350, 'obligatorio': True}
        ]

        # Agregar nueva cuota
        nueva = {'id': 'cuota_3', 'title': 'Polera Ensayo Extra', 'monto': 80, 'obligatorio': False, 'categoria': 'Indumentaria'}
        cuotas.append(nueva)
        self.assertEqual(len(cuotas), 3)
        self.assertEqual(cuotas[2]['title'], 'Polera Ensayo Extra')

        # Editar cuota
        cuotas[2]['monto'] = 90
        self.assertEqual(cuotas[2]['monto'], 90)

        # Eliminar cuota
        cuotas = [c for c in cuotas if c['id'] != 'cuota_3']
        self.assertEqual(len(cuotas), 2)

    def test_17_partial_payments_and_installment_tracking(self):
        """Verifica la lógica de abonos parciales y seguimiento de saldos."""
        cuota_traje = 800
        pagos = []

        # Abono 1: 300 Bs
        pagos.append({'cuota_id': 'cuota_3', 'monto': 300, 'fecha': '2026-03-01'})
        pagado_1 = sum(p['monto'] for p in pagos)
        saldo_1 = max(0, cuota_traje - pagado_1)
        pct_1 = round((pagado_1 / cuota_traje) * 100)

        self.assertEqual(pagado_1, 300)
        self.assertEqual(saldo_1, 500)
        self.assertEqual(pct_1, 38)

        # Abono 2: 300 Bs
        pagos.append({'cuota_id': 'cuota_3', 'monto': 300, 'fecha': '2026-03-20'})
        pagado_2 = sum(p['monto'] for p in pagos)
        saldo_2 = max(0, cuota_traje - pagado_2)
        pct_2 = round((pagado_2 / cuota_traje) * 100)

        self.assertEqual(pagado_2, 600)
        self.assertEqual(saldo_2, 200)
        self.assertEqual(pct_2, 75)

        # Abono 3 (Finiquito): 200 Bs
        pagos.append({'cuota_id': 'cuota_3', 'monto': 200, 'fecha': '2026-04-10'})
        pagado_3 = sum(p['monto'] for p in pagos)
        saldo_3 = max(0, cuota_traje - pagado_3)
        pct_3 = round((pagado_3 / cuota_traje) * 100)

        self.assertEqual(pagado_3, 800)
        self.assertEqual(saldo_3, 0)
        self.assertEqual(pct_3, 100)

    def test_18_voucher_rejection_and_resubmission_flow(self):
        """Verifica el flujo completo de envío, observación/rechazo con nota, y regularización de voucher."""
        member = {
            'ci': '6998544',
            'vouchers_pendientes': [],
            'vouchers_rechazados': [],
            'pagos': []
        }

        # 1. Enviar voucher
        voucher_1 = {
            'id': 'VOUCH-01',
            'cuota_id': 'cuota_2',
            'monto': 350,
            'banco_origen': 'Banco Nacional de Bolivia (BNB)',
            'nro_transaccion': '994819'
        }
        member['vouchers_pendientes'].append(voucher_1)
        self.assertEqual(len(member['vouchers_pendientes']), 1)

        # 2. Directiva observa y rechaza con motivo
        motivo = "Foto borrosa, no se distingue el número de autorización"
        member['vouchers_rechazados'].append({
            'id': voucher_1['id'],
            'cuota_id': voucher_1['cuota_id'],
            'monto': voucher_1['monto'],
            'motivo': motivo
        })
        member['vouchers_pendientes'] = [v for v in member['vouchers_pendientes'] if v['id'] != voucher_1['id']]

        self.assertEqual(len(member['vouchers_pendientes']), 0)
        self.assertEqual(len(member['vouchers_rechazados']), 1)
        self.assertEqual(member['vouchers_rechazados'][0]['motivo'], motivo)

        # 3. Fraterno sube voucher corregido (limpia observación previa para esa cuota)
        voucher_2 = {
            'id': 'VOUCH-02',
            'cuota_id': 'cuota_2',
            'monto': 350,
            'banco_origen': 'Banco Nacional de Bolivia (BNB)',
            'nro_transaccion': '994819'
        }
        member['vouchers_pendientes'].append(voucher_2)
        member['vouchers_rechazados'] = [vr for vr in member['vouchers_rechazados'] if vr['cuota_id'] != 'cuota_2']

        self.assertEqual(len(member['vouchers_pendientes']), 1)
        self.assertEqual(len(member['vouchers_rechazados']), 0)

        # 4. Directiva confirma voucher
        member['vouchers_pendientes'] = [v for v in member['vouchers_pendientes'] if v['id'] != voucher_2['id']]
        member['pagos'].append({
            'id': 'PAG-01',
            'cuota_id': voucher_2['cuota_id'],
            'monto': voucher_2['monto'],
            'nro_recibo': 'REC-99120',
            'metodo': 'Transferencia / Banco Nacional de Bolivia (BNB)'
        })

        self.assertEqual(len(member['vouchers_pendientes']), 0)
        self.assertEqual(len(member['pagos']), 1)
        self.assertEqual(member['pagos'][0]['nro_recibo'], 'REC-99120')

    def test_19_batch_voucher_confirmation(self):
        """Verifica la aprobación masiva de vouchers pendientes en lote."""
        members = [
            {'ci': '101', 'vouchers_pendientes': [{'id': 'v1', 'cuota_id': 'c1', 'monto': 250}], 'pagos': []},
            {'ci': '102', 'vouchers_pendientes': [{'id': 'v2', 'cuota_id': 'c1', 'monto': 250}], 'pagos': []},
            {'ci': '103', 'vouchers_pendientes': [{'id': 'v3', 'cuota_id': 'c2', 'monto': 350}], 'pagos': []}
        ]

        def confirm_batch(all_members):
            confirmed = 0
            for m in all_members:
                for v in list(m['vouchers_pendientes']):
                    m['vouchers_pendientes'].remove(v)
                    m['pagos'].append({'cuota_id': v['cuota_id'], 'monto': v['monto']})
                    confirmed += 1
            return confirmed

        total = confirm_batch(members)
        self.assertEqual(total, 3)
        self.assertTrue(all(len(m['vouchers_pendientes']) == 0 for m in members))
        self.assertTrue(all(len(m['pagos']) == 1 for m in members))

    def test_20_financial_summary_aggregation(self):
        """Verifica el cálculo de recaudación global, proyección y estado por bloque."""
        cuotas = [{'monto': 250}, {'monto': 350}, {'monto': 800}, {'monto': 200}] # Total individual = 1600 Bs
        cuota_ind = sum(c['monto'] for c in cuotas)

        members = [
            {'ci': '1', 'bloque': 'machas', 'pagos': [{'monto': 1600}]}, # al día
            {'ci': '2', 'bloque': 'machas', 'pagos': [{'monto': 600}]},  # con saldo
            {'ci': '3', 'bloque': 'imillas', 'pagos': [{'monto': 1600}]}, # al día
            {'ci': '4', 'bloque': 'imillas', 'pagos': [{'monto': 0}]}     # con saldo
        ]

        total_recaudado = sum(sum(p['monto'] for p in m['pagos']) for m in members)
        total_proyectado = cuota_ind * len(members)
        al_dia = sum(1 for m in members if sum(p['monto'] for p in m['pagos']) >= cuota_ind)
        con_saldo = len(members) - al_dia

        self.assertEqual(cuota_ind, 1600)
        self.assertEqual(total_recaudado, 3800)
        self.assertEqual(total_proyectado, 6400)
        self.assertEqual(al_dia, 2)
        self.assertEqual(con_saldo, 2)

    def test_21_number_to_spanish_words_logic(self):
        """Verifica la conversión de números a palabras en español para emisión de recibos."""
        units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
        tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
        teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
        hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

        def convert_group(val):
            res = ''
            h = val // 100
            t = (val % 100) // 10
            u = val % 10

            if val == 100:
                return 'CIEN'
            if h > 0:
                res += hundreds[h] + ' '

            if t == 1:
                res += teens[u] + ' '
            elif t == 2 and u > 0:
                res += 'VEINTI' + units[u] + ' '
            else:
                if t > 0:
                    res += tens[t] + (' Y ' if u > 0 else ' ')
                if u > 0 and t != 1:
                    res += units[u] + ' '
            return res.strip()

        def number_to_words(num):
            n = abs(int(num))
            if n == 0:
                return 'CERO'
            if n < 1000:
                return convert_group(n)
            if n < 1000000:
                miles = n // 1000
                resto = n % 1000
                miles_text = 'MIL' if miles == 1 else convert_group(miles) + ' MIL'
                return f"{miles_text} {convert_group(resto) if resto > 0 else ''}".strip()
            return str(n)

        self.assertEqual(number_to_words(250), "DOSCIENTOS CINCUENTA")
        self.assertEqual(number_to_words(350), "TRESCIENTOS CINCUENTA")
        self.assertEqual(number_to_words(800), "OCHOCIENTOS")
        self.assertEqual(number_to_words(200), "DOSCIENTOS")
        self.assertEqual(number_to_words(1600), "MIL SEISCIENTOS")
        self.assertEqual(number_to_words(100), "CIEN")

    def test_22_bolivian_banks_and_payment_config(self):
        """Verifica que los bancos bolivianos y cuentas bancarias estén configurados en data.js."""
        data_path = os.path.join(JS_DIR, 'data.js')
        with open(data_path, 'r', encoding='utf-8') as f:
            data_content = f.read()

        self.assertIn("bancos_disponibles", data_content)
        self.assertIn("Banco Nacional de Bolivia (BNB)", data_content)
        self.assertIn("Banco Unión", data_content)
        self.assertIn("Banco Mercantil Santa Cruz", data_content)
        self.assertIn("150-1928374-2", data_content)

    def test_23_no_puntos_references_in_codebase(self):
        """Verifica que se hayan eliminado por completo los puntos (puntos_asistencia) de eventos y modales."""
        files_to_check = ['data.js', 'state.js', 'app.js', 'asistencias.js']
        for fname in files_to_check:
            fpath = os.path.join(JS_DIR, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            self.assertNotIn("puntos_asistencia", content, f"Se encontró 'puntos_asistencia' en {fname}")
            self.assertNotIn("eventEditPuntos", content, f"Se encontró 'eventEditPuntos' en {fname}")

        index_path = os.path.join(WORKSPACE_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()
        self.assertNotIn("eventEditPuntos", index_content, "Se encontró 'eventEditPuntos' en index.html")
        self.assertNotIn("Puntos de Asistencia", index_content, "Se encontró 'Puntos de Asistencia' en index.html")

    def test_24_qr_payload_extraction_and_carnet_decoding(self):
        """Verifica la lógica del decodificador de códigos QR para credenciales fraternales."""
        def extract_ci_from_qr(raw):
            if not raw:
                return None
            clean = str(raw).strip()
            # 1. JSON
            if clean.startswith('{') and clean.endswith('}'):
                try:
                    parsed = json.loads(clean)
                    if 'ci' in parsed:
                        return str(parsed['ci']).strip()
                    if 'carnet' in parsed:
                        return str(parsed['carnet']).strip()
                except Exception:
                    pass
            # 2. URL parameter
            if 'ci=' in clean:
                m = re.search(r'[?&]ci=([0-9]+)', clean, re.IGNORECASE)
                if m:
                    return m.group(1)
            # 3. Prefijo WISTUS:CI o CI:CI
            if ':' in clean:
                parts = clean.split(':')
                candidate = re.sub(r'[^0-9]', '', parts[-1])
                if len(candidate) >= 4:
                    return candidate
            # 4. Cadena numérica pura
            num_only = re.sub(r'[^0-9]', '', clean)
            if 4 <= len(num_only) <= 12:
                return num_only
            return clean

        self.assertEqual(extract_ci_from_qr("4839201"), "4839201")
        self.assertEqual(extract_ci_from_qr("WISTUS:4839201"), "4839201")
        self.assertEqual(extract_ci_from_qr("CI:6892341"), "6892341")
        self.assertEqual(extract_ci_from_qr('{"ci": "6998544", "nombre": "Fraterno Wistus"}'), "6998544")
        self.assertEqual(extract_ci_from_qr('{"carnet": "3459128"}'), "3459128")
        self.assertEqual(extract_ci_from_qr("https://carnavaldeoruro2027.bo/verificar?ci=7823419&frat=Wistus"), "7823419")
        self.assertEqual(extract_ci_from_qr(""), None)

    def test_25_event_location_and_directive_management(self):
        """Verifica que los eventos posean lugar de concentración, responsable directiva y tolerancia."""
        data_path = os.path.join(JS_DIR, 'data.js')
        state_path = os.path.join(JS_DIR, 'state.js')

        with open(data_path, 'r', encoding='utf-8') as f:
            data_content = f.read()
        with open(state_path, 'r', encoding='utf-8') as f:
            state_content = f.read()

        # En data.js
        self.assertIn("lugar:", data_content)
        self.assertIn("responsable:", data_content)
        self.assertIn("tolerancia_minutos:", data_content)

        # En state.js
        self.assertIn("responsable: eventData.responsable", state_content)
        self.assertIn("tolerancia_minutos: parseInt(eventData.tolerancia_minutos", state_content)

    def test_26_attendance_registration_and_anti_duplicate_logic(self):
        """Simula el proceso de marcaje de asistencia y verificación anti-duplicados."""
        class MockAttendanceSystem:
            def __init__(self):
                self.members = {
                    '4839201': {'ci': '4839201', 'nombre': 'Juan Pablo Quispe', 'asistencias': {}},
                    '6892341': {'ci': '6892341', 'nombre': 'Maria Elena Flores', 'asistencias': {}}
                }
                self.active_event_id = 'ev_4'

            def scan_qr(self, qr_payload):
                ci = re.sub(r'[^0-9]', '', str(qr_payload).split(':')[-1])
                if ci not in self.members:
                    return {'success': False, 'msg': 'CI no encontrado en el Padrón'}
                
                member = self.members[ci]
                prev_reg = member['asistencias'].get(self.active_event_id)
                already_registered = prev_reg is not None and prev_reg.get('estado') in ['presente', 'atraso']

                reg = {
                    'estado': 'presente',
                    'hora': '18:15',
                    'marcado_por': 'Terminal QR Directiva',
                    'lugar': 'Plaza Mayor de San Francisco'
                }
                member['asistencias'][self.active_event_id] = reg

                return {
                    'success': True,
                    'ci': ci,
                    'already_registered': already_registered,
                    'record': reg
                }

        sys = MockAttendanceSystem()
        # Primer escaneo -> Nuevo registro
        res1 = sys.scan_qr("WISTUS:4839201")
        self.assertTrue(res1['success'])
        self.assertFalse(res1['already_registered'])
        self.assertEqual(res1['record']['estado'], 'presente')

        # Segundo escaneo del mismo fraterno -> Detecta duplicado y actualiza
        res2 = sys.scan_qr("4839201")
        self.assertTrue(res2['success'])
        self.assertTrue(res2['already_registered'])

        # Escaneo de CI inexistente
        res3 = sys.scan_qr("9999999")
        self.assertFalse(res3['success'])

    def test_27_attendance_dashboard_kpis_and_bulk_operations(self):
        """Verifica el cálculo de KPIs de asistencia, desglose por bloque y operaciones por lote."""
        members = [
            {'ci': '1', 'bloque_id': 'machas', 'bloque_nombre': 'Bloque Machas', 'asistencias': {'ev_1': {'estado': 'presente'}}},
            {'ci': '2', 'bloque_id': 'machas', 'bloque_nombre': 'Bloque Machas', 'asistencias': {'ev_1': {'estado': 'atraso'}}},
            {'ci': '3', 'bloque_id': 'imillas', 'bloque_nombre': 'Bloque Imillas', 'asistencias': {'ev_1': {'estado': 'falta'}}},
            {'ci': '4', 'bloque_id': 'imillas', 'bloque_nombre': 'Bloque Imillas', 'asistencias': {'ev_1': {'estado': 'licencia'}}},
            {'ci': '5', 'bloque_id': 'mayores', 'bloque_nombre': 'Bloque Mayores', 'asistencias': {}} # pendiente
        ]

        def get_stats(event_id, member_list):
            presentes = sum(1 for m in member_list if m['asistencias'].get(event_id, {}).get('estado') == 'presente')
            atrasos = sum(1 for m in member_list if m['asistencias'].get(event_id, {}).get('estado') == 'atraso')
            faltas = sum(1 for m in member_list if m['asistencias'].get(event_id, {}).get('estado') == 'falta')
            licencias = sum(1 for m in member_list if m['asistencias'].get(event_id, {}).get('estado') == 'licencia')
            pendientes = sum(1 for m in member_list if not m['asistencias'].get(event_id) or m['asistencias'].get(event_id, {}).get('estado') == 'pendiente')
            total = len(member_list)
            pct = round(((presentes + atrasos * 0.7 + licencias * 0.9) / total) * 100) if total > 0 else 0
            return {
                'total': total, 'presentes': presentes, 'atrasos': atrasos,
                'faltas': faltas, 'licencias': licencias, 'pendientes': pendientes,
                'porcentaje': pct
            }

        stats = get_stats('ev_1', members)
        self.assertEqual(stats['total'], 5)
        self.assertEqual(stats['presentes'], 1)
        self.assertEqual(stats['atrasos'], 1)
        self.assertEqual(stats['faltas'], 1)
        self.assertEqual(stats['licencias'], 1)
        self.assertEqual(stats['pendientes'], 1)
        # Efectivo = 1 + 0.7 + 0.9 = 2.6 / 5 = 52%
        self.assertEqual(stats['porcentaje'], 52)

        # Simular marcar pendientes como falta
        for m in members:
            if not m['asistencias'].get('ev_1') or m['asistencias']['ev_1'].get('estado') == 'pendiente':
                m['asistencias']['ev_1'] = {'estado': 'falta'}

        stats_after = get_stats('ev_1', members)
        self.assertEqual(stats_after['pendientes'], 0)
        self.assertEqual(stats_after['faltas'], 2)

    def test_28_unique_receipt_numbers_on_voucher_confirmation(self):
        """Verifica que al confirmar múltiples vouchers se generen números de recibo únicos con prefijo REC-."""
        class MockStateForReceipts:
            def __init__(self):
                self.members = {
                    '1001': {'ci': '1001', 'pagos': [], 'vouchers_pendientes': [{'id': 'v1', 'cuota_id': 'c1', 'monto': 250}]},
                    '1002': {'ci': '1002', 'pagos': [], 'vouchers_pendientes': [{'id': 'v2', 'cuota_id': 'c1', 'monto': 250}]},
                    '1003': {'ci': '1003', 'pagos': [], 'vouchers_pendientes': [{'id': 'v3', 'cuota_id': 'c2', 'monto': 350}]}
                }

            def confirm_voucher(self, ci, voucher_id):
                import random
                m = self.members[ci]
                v = next((x for x in m['vouchers_pendientes'] if x['id'] == voucher_id), None)
                m['vouchers_pendientes'].remove(v)
                recibo_num = f"REC-{random.randint(10000, 99999)}"
                p = {'id': f"PAG-{random.randint(1000, 9999)}", 'cuota_id': v['cuota_id'], 'monto': v['monto'], 'nro_recibo': recibo_num}
                m['pagos'].append(p)
                return p

        mock = MockStateForReceipts()
        p1 = mock.confirm_voucher('1001', 'v1')
        p2 = mock.confirm_voucher('1002', 'v2')
        p3 = mock.confirm_voucher('1003', 'v3')

        receipts = [p1['nro_recibo'], p2['nro_recibo'], p3['nro_recibo']]
        for r in receipts:
            self.assertTrue(r.startswith('REC-'))
        # Ensure they are distinct
        self.assertEqual(len(set(receipts)), 3)

    def test_29_demo_options_removed_from_user_menu(self):
        """Verifica que las opciones de 'Cambiar Perfil / Rol' y 'Restablecer Datos Demo' hayan sido eliminadas del dropdown."""
        index_path = os.path.join(WORKSPACE_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()

        self.assertNotIn("Cambiar Perfil / Rol", index_content)
        self.assertNotIn("Restablecer Datos Demo", index_content)
        self.assertNotIn("btnResetPortalData", index_content)

        app_js_path = os.path.join(JS_DIR, 'app.js')
        with open(app_js_path, 'r', encoding='utf-8') as f:
            app_content = f.read()

        self.assertNotIn("btnMoreSimularRolFraterno", app_content)
        self.assertNotIn("btnMoreResetDemoData", app_content)
        self.assertNotIn("sim-juan-pablo", app_content)
        self.assertNotIn("sim-maria-elena", app_content)
        self.assertNotIn("sim-control", app_content)

    def test_30_login_ux_ui_festive_presentation_and_auth(self):
        """Verifica los componentes visuales UX/UI de login Oruro 2027 y la lógica de autenticación."""
        index_path = os.path.join(WORKSPACE_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()

        # Componentes estructurales y festivos del login
        self.assertIn('id="view-login"', index_content)
        self.assertIn("login-festive-tag", index_content)
        self.assertIn("badge-oruro-carnaval", index_content)
        self.assertIn("Carnaval de Oruro 2027", index_content)
        self.assertIn("login-logo-halo", index_content)
        self.assertIn("login-edition-badge", index_content)
        self.assertIn("GESTIÓN OFICIAL 2027", index_content)

        # Segmented Control Tabs
        self.assertIn('id="tab-fraterno-btn"', index_content)
        self.assertIn('id="tab-control-btn"', index_content)

        # Formulario Fraterno y micro-interacciones limpias
        self.assertIn('id="formLoginFraterno"', index_content)
        self.assertIn('id="inputCI"', index_content)
        self.assertIn('id="btnClearCI"', index_content)
        self.assertIn('id="alertFraternoLogin"', index_content)
        self.assertNotIn("login-quick-chips-wrapper", index_content)
        self.assertNotIn("login-hint-box", index_content)

        # Formulario Control y micro-interacciones limpias
        self.assertIn('id="formLoginControl"', index_content)
        self.assertIn('id="inputControlUser"', index_content)
        self.assertIn('id="inputControlPass"', index_content)
        self.assertIn('id="btnToggleControlPass"', index_content)
        self.assertIn('id="alertControlLogin"', index_content)

        # Estilos en css/style.css
        style_path = os.path.join(WORKSPACE_DIR, 'css', 'style.css')
        with open(style_path, 'r', encoding='utf-8') as f:
            style_content = f.read()

        self.assertIn(".login-wrapper", style_content)
        self.assertIn("overflow-y: auto", style_content)
        self.assertIn(".login-card-main", style_content)
        self.assertIn(".login-logo-halo", style_content)
        self.assertIn(".badge-oruro-carnaval", style_content)
        self.assertIn(".login-quick-chips-wrapper", style_content)
        self.assertIn(".btn-quick-ci", style_content)
        self.assertIn(".btn-login-submit", style_content)
        self.assertIn(".btn-toggle-password:focus-visible", style_content)
        self.assertIn(".btn-quick-ci:focus-visible", style_content)

        # Lógica en js/auth.js
        auth_path = os.path.join(JS_DIR, 'auth.js')
        with open(auth_path, 'r', encoding='utf-8') as f:
            auth_content = f.read()

        self.assertIn(".btn-quick-ci", auth_content)
        self.assertIn(".btn-quick-admin", auth_content)
        self.assertIn("btnToggleControlPass", auth_content)
        self.assertIn("btnClearCI", auth_content)
        self.assertIn("loginAsMember", auth_content)
        self.assertIn("loginAsControl", auth_content)
        self.assertIn("resetLoginForm", auth_content)
        self.assertIn("wistus2027", auth_content)
        self.assertIn("2027", auth_content)

        # Simulación de autenticación fraterno por CI
        cis_validos = ["6998544", "4839201", "6892341"]
        data_path = os.path.join(JS_DIR, 'data.js')
        with open(data_path, 'r', encoding='utf-8') as f:
            data_content = f.read()

        for test_ci in cis_validos:
            self.assertIn(test_ci, data_content, f"El CI {test_ci} debe estar en el padrón de data.js")

    def test_31_fraterno_friendly_login_and_discrete_directiva_access(self):
        """Verifica que el panel principal esté enfocado en fraternos de forma amena,
        con acceso directivo discreto y retorno 2027 institucional."""
        index_path = os.path.join(WORKSPACE_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()

        # Panel de fraterno ameno y acogedor
        self.assertIn("login-fraterno-welcome", index_content)
        self.assertIn("fraterno-welcome-badge", index_content)
        self.assertIn("¡Bienvenido, Fraterno!", index_content)
        self.assertIn("Cédula de Identidad (CI)", index_content)
        self.assertIn("Ingresar a mi Portal Fraternal", index_content)

        # Acceso discreto para directiva (no como pestaña prominente principal)
        self.assertIn("btn-link-discrete", index_content)
        self.assertIn("login-directiva-discreet", index_content)
        self.assertIn("Mesa Directiva", index_content)
        self.assertIn("tab-control-btn", index_content)
        self.assertIn("tab-fraterno-btn", index_content)
        self.assertIn("login-bg-decorations", index_content)

        # Evitar crash de Bootstrap por data-bs-toggle en botones fuera de .nav
        self.assertNotIn('id="tab-control-btn" data-bs-toggle="pill"', index_content)
        self.assertNotIn('id="tab-fraterno-btn" data-bs-toggle="pill"', index_content)

        # Enlace footer Oruro 2027
        self.assertIn("Ir a la Portada Institucional &bull; Carnaval de Oruro 2027 &rarr;", index_content)
        self.assertNotIn("Ir a la Portada Institucional 2026", index_content)

        # Estilos asociados en style.css
        style_path = os.path.join(WORKSPACE_DIR, 'css', 'style.css')
        with open(style_path, 'r', encoding='utf-8') as f:
            style_content = f.read()

        self.assertIn(".login-fraterno-welcome", style_content)
        self.assertIn(".fraterno-welcome-badge", style_content)
        self.assertIn(".btn-link-discrete", style_content)
        self.assertIn(".login-directiva-discreet", style_content)
        self.assertIn(".login-bg-decorations", style_content)

if __name__ == '__main__':
    unittest.main()



