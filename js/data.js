/**
 * DATA BASE INICIAL - PORTAL FRATERNAL TINKUS WISTUS
 * Entrada Universitaria La Paz 2026 - Fraternidad Tinkus Wistus
 */

const DEFAULT_PORTAL_CONFIG = {
    current_theme: 'wistus',
    themes: {
        wistus: {
            id: 'wistus',
            name: "Fraternidad Tinkus Wistus",
            short_name: "Tinkus Wistus",
            danza: 'Tinkus',
            motto: 'Los mejores Tinkus del país',
            year: '2026',
            escudo_url: 'assets/img/wistus-badge.svg',
            banner_url: 'assets/img/wistus-banner.svg',
            logo_url: 'assets/img/wistus-logo-w.svg',
            colors: {
                primary: '#7c3aed',         // Violeta Wistus brillante
                primary_dark: '#3b0764',    // Lila/Violeta profundo
                secondary: '#a855f7',       // Lila vibrante
                secondary_light: '#e9d5ff', // Lila claro pastel
                accent: '#c084fc',          // Lavanda/Lila brillante
                dark: '#2e1065',            // Fondo lila nocturno
                card_bg: '#ffffff',         // Tarjeta blanca
                text: '#0f172a',            // Texto principal
                gold_text: '#a855f7',       // Acento Lila Wistus
                lilac_deep: '#3b0764',
                lilac_vibrant: '#7c3aed',
                lilac_bright: '#a855f7',
                lilac_soft: '#c084fc',
                lilac_pastel: '#e9d5ff',
                lilac_light: '#f5f3ff'
            }
        }
    },
    bloques: [
        { id: 'machas', name: 'Bloque Machas Wistus', guia: 'Juan Pablo Quispe', cupos: 60, color: '#e53e3e' },
        { id: 'imillas', name: 'Bloque Imillas Wistus', guia: 'Maria Elena Flores', cupos: 75, color: '#ec4899' },
        { id: 'mayores', name: "Bloque Tinkus Wistus Mayores", guia: 'Carlos Mendoza', cupos: 40, color: '#3182ce' },
        { id: 'choclos', name: "Bloque Choclos", guia: 'Gabriela Vargas', cupos: 50, color: '#38a169' },
        { id: 'wanllis', name: "Bloque Semillero Wanllis", guia: 'Sonia Choque', cupos: 30, color: '#805ad5' },
        { id: 'directiva', name: "Directiva y Pasantes 2026", guia: 'Lic. Roberto Alarcón', cupos: 20, color: '#7c3aed' }
    ],
    cuotas_definidas: [
        { id: 'cuota_1', title: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, vencimiento: '2026-02-28', obligatorio: true },
        { id: 'cuota_2', title: 'Banda Oficial y Acompañamiento', monto: 350, vencimiento: '2026-03-31', obligatorio: true },
        { id: 'cuota_3', title: 'Confección Traje Oficial Tinku (Montera y Chaleco)', monto: 800, vencimiento: '2026-04-30', obligatorio: true },
        { id: 'cuota_4', title: 'Recepción Social y Diana', monto: 200, vencimiento: '2026-05-15', obligatorio: true }
    ],
    eventos: [
        {
            id: 'ev_1',
            title: '1er Ensayo General y Confraternización Tinku',
            tipo: 'Ensayo',
            fecha: '2026-02-15',
            hora: '15:00 - 19:00',
            lugar: 'Sede Social Tinkus Wistus (Zona San Pedro, Calle Almirante Grau)',
            estado: 'finalizado',
            obligatorio: true,
            puntos_asistencia: 10
        },
        {
            id: 'ev_2',
            title: '2do Ensayo Oficial y Medida de Monteras',
            tipo: 'Ensayo',
            fecha: '2026-03-08',
            hora: '15:30 - 20:00',
            lugar: 'Cancha Polideportiva Munaypata',
            estado: 'finalizado',
            obligatorio: true,
            puntos_asistencia: 10
        },
        {
            id: 'ev_3',
            title: '3er Ensayo General de Pasos y Saltos Tinku',
            tipo: 'Ensayo',
            fecha: '2026-03-22',
            hora: '15:00 - 19:30',
            lugar: 'Av. Simón Bolívar (Monumento Busch)',
            estado: 'finalizado',
            obligatorio: true,
            puntos_asistencia: 10
        },
        {
            id: 'ev_4',
            title: 'Recorrido Nocturno de Fraternidades - Entrada Universitaria La Paz',
            tipo: 'Recorrido',
            fecha: '2026-04-12',
            hora: '18:00 - 22:30',
            lugar: 'Plaza Mayor de San Francisco a Plaza Eguino',
            estado: 'activo', // Actualmente en control de asistencias
            obligatorio: true,
            puntos_asistencia: 20
        },
        {
            id: 'ev_5',
            title: 'Misa de Promesa de la Entrada Universitaria La Paz',
            tipo: 'Solemne',
            fecha: '2026-05-03',
            hora: '09:00 - 13:00',
            lugar: 'Santuario de la Entrada Universitaria La Paz (Calle Antonio Gallardo)',
            estado: 'proximo',
            obligatorio: true,
            puntos_asistencia: 25
        },
        {
            id: 'ev_6',
            title: 'Magna Entrada Universitaria La Paz 2026',
            tipo: 'Entrada Oficial',
            fecha: '2026-05-24',
            hora: '07:00 - 20:00',
            lugar: 'Ruta Oficial Entrada Universitaria La Paz (Av. Baptista hasta Estadio Hernando Siles)',
            estado: 'proximo',
            obligatorio: true,
            puntos_asistencia: 50
        },
        {
            id: 'ev_7',
            title: 'Diana Folklórica y Recepción de Gala Tinkus Wistus',
            tipo: 'Recepción',
            fecha: '2026-05-25',
            hora: '13:00 - 23:00',
            lugar: 'Salón de Eventos "El Conquistador", La Paz',
            estado: 'proximo',
            obligatorio: false,
            puntos_asistencia: 15
        }
    ],
    comunicados: [
        {
            id: 'com_1',
            fecha: '2026-03-25',
            titulo: 'Control Estricto con Credencial QR en Recorrido Nocturno',
            autor: 'Secretaría de Control y Asistencia',
            contenido: 'Recordamos a todos los fraternos y fraternas de la Fraternidad Tinkus Wistus que para el Recorrido Nocturno del 12 de Abril el control de asistencia se realizará exclusivamente mediante escaneo de Credencial Digital QR o presentación de CI en el punto de concentración.',
            prioridad: 'alta'
        },
        {
            id: 'com_2',
            fecha: '2026-03-20',
            titulo: 'Última Fecha para Pago de Cuota 2 (Banda Oficial)',
            autor: 'Tesorería General Tinkus Wistus 2026',
            contenido: 'Fraternos que aún tengan saldo pendiente en la Cuota 2 deben regularizar hasta el 31 de marzo para confirmar su puesto en fila y bloque oficial de Tinkus Wistus.',
            prioridad: 'media'
        }
    ],
    miembros: [
        {
            ci: '4839201',
            ci_exp: 'LP',
            nombres: 'Juan Pablo',
            apellidos: 'Quispe Mamani',
            email: '',
            telefono: '+591 76543210',
            bloque_id: 'machas',
            bloque_nombre: 'Bloque Machas Wistus',
            rol_fraternal: 'Fraterno Macha Titular',
            antiguedad_anios: 4,
            foto: 'assets/img/avatar-default.svg',
            has_user_account: false, // Miembro base que NO es usuario todavía
            user_account: null,
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control' },
                'ev_2': { estado: 'presente', hora: '15:45', marcado_por: 'Secretaría Control' },
                'ev_3': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-101', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-02-10', metodo: 'QR Banco BNB', nro_recibo: 'REC-00104', estado: 'pagado' },
                { id: 'PAG-102', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-05', metodo: 'Efectivo', nro_recibo: 'REC-00189', estado: 'pagado' },
                { id: 'PAG-103', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku', monto: 500, fecha: '2026-03-21', metodo: 'Transferencia QR', nro_recibo: 'REC-00275', estado: 'parcial', saldo_pendiente: 300 }
            ]
        },
        {
            ci: '6892341',
            ci_exp: 'LP',
            nombres: 'Maria Elena',
            apellidos: 'Flores Condori',
            email: 'maria.flores@tinkuswistus.bo',
            telefono: '+591 71239874',
            bloque_id: 'imillas',
            bloque_nombre: 'Bloque Imillas Wistus',
            rol_fraternal: 'Guía de Fila Imilla',
            antiguedad_anios: 7,
            foto: 'assets/img/avatar-default.svg',
            user_account: {
                username: 'maria.flores',
                password_hash: 'demo123'
            },
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:02', marcado_por: 'Secretaría Control' },
                'ev_2': { estado: 'presente', hora: '15:20', marcado_por: 'Secretaría Control' },
                'ev_3': { estado: 'presente', hora: '15:05', marcado_por: 'Secretaría Control' },
                'ev_4': { estado: 'presente', hora: '18:10', marcado_por: 'Terminal QR' }
            },
            pagos: [
                { id: 'PAG-201', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-01-28', metodo: 'QR Banco FIE', nro_recibo: 'REC-00045', estado: 'pagado' },
                { id: 'PAG-202', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-02-25', metodo: 'QR Banco BNB', nro_recibo: 'REC-00120', estado: 'pagado' },
                { id: 'PAG-203', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku', monto: 800, fecha: '2026-03-15', metodo: 'QR Banco BNB', nro_recibo: 'REC-00210', estado: 'pagado' },
                { id: 'PAG-204', cuota_id: 'cuota_4', concepto: 'Recepción Social y Diana', monto: 200, fecha: '2026-03-20', metodo: 'Efectivo', nro_recibo: 'REC-00290', estado: 'pagado' }
            ]
        },
        {
            ci: '3456782',
            ci_exp: 'LP',
            nombres: 'Carlos Hugo',
            apellidos: 'Mendoza Torrez',
            email: '',
            telefono: '+591 79812345',
            bloque_id: 'mayores',
            bloque_nombre: "Bloque Tinkus Wistus Mayores",
            rol_fraternal: 'Fundador Honorario',
            antiguedad_anios: 15,
            foto: 'assets/img/avatar-default.svg',
            has_user_account: false,
            user_account: null,
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:25', marcado_por: 'Secretaría Control' },
                'ev_2': { estado: 'licencia', hora: null, motivo: 'Viaje de trabajo autorizado', marcado_por: 'Directiva' },
                'ev_3': { estado: 'presente', hora: '15:30', marcado_por: 'Secretaría Control' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-301', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-02-05', metodo: 'Efectivo', nro_recibo: 'REC-00088', estado: 'pagado' },
                { id: 'PAG-302', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-10', metodo: 'QR Banco BNB', nro_recibo: 'REC-00192', estado: 'pagado' }
            ]
        },
        {
            ci: '5901243',
            ci_exp: 'LP',
            nombres: 'Gabriela Andrea',
            apellidos: 'Vargas Silva',
            email: 'gaby.vargas@gmail.com',
            telefono: '+591 67890123',
            bloque_id: 'choclos',
            bloque_nombre: "Bloque Choclos",
            rol_fraternal: 'Fraterna Titular',
            antiguedad_anios: 2,
            foto: 'assets/img/avatar-default.svg',
            user_account: {
                username: 'gaby.vargas',
                password_hash: 'demo123'
            },
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:12', marcado_por: 'Secretaría Control' },
                'ev_2': { estado: 'atraso', hora: '16:15', marcado_por: 'Secretaría Control' },
                'ev_3': { estado: 'falta', hora: null, marcado_por: 'Sistema' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-401', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-02-18', metodo: 'QR Banco FIE', nro_recibo: 'REC-00130', estado: 'pagado' }
            ]
        },
        {
            ci: '7124589',
            ci_exp: 'LP',
            nombres: 'Rodrigo',
            apellidos: 'Apaza Huanca',
            email: '',
            telefono: '+591 75432198',
            bloque_id: 'machas',
            bloque_nombre: 'Bloque Machas Wistus',
            rol_fraternal: 'Fraterno Aspirante',
            antiguedad_anios: 1,
            foto: 'assets/img/avatar-default.svg',
            user_account: null,
            estado_fraterno: 'observado',
            asistencias: {
                'ev_1': { estado: 'falta', hora: null, marcado_por: 'Sistema' },
                'ev_2': { estado: 'falta', hora: null, marcado_por: 'Sistema' },
                'ev_3': { estado: 'presente', hora: '15:40', marcado_por: 'Secretaría Control' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: []
        },
        {
            ci: '2345678',
            ci_exp: 'LP',
            nombres: 'Lic. Roberto',
            apellidos: 'Alarcón Peña',
            email: 'control@tinkuswistus.bo',
            telefono: '+591 70123456',
            bloque_id: 'directiva',
            bloque_nombre: 'Directiva y Pasantes 2026',
            rol_fraternal: 'Secretario de Actas y Control',
            antiguedad_anios: 12,
            foto: 'assets/img/avatar-default.svg',
            user_account: {
                username: 'control',
                password_hash: 'wistus2026',
                is_admin: true
            },
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '14:30', marcado_por: 'Mesa Directiva' },
                'ev_2': { estado: 'presente', hora: '14:40', marcado_por: 'Mesa Directiva' },
                'ev_3': { estado: 'presente', hora: '14:20', marcado_por: 'Mesa Directiva' },
                'ev_4': { estado: 'presente', hora: '17:30', marcado_por: 'Mesa Directiva' }
            },
            pagos: [
                { id: 'PAG-501', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-01-15', metodo: 'Depósito', nro_recibo: 'REC-00012', estado: 'pagado' },
                { id: 'PAG-502', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-01-15', metodo: 'Depósito', nro_recibo: 'REC-00013', estado: 'pagado' },
                { id: 'PAG-503', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku', monto: 800, fecha: '2026-01-15', metodo: 'Depósito', nro_recibo: 'REC-00014', estado: 'pagado' },
                { id: 'PAG-504', cuota_id: 'cuota_4', concepto: 'Recepción Social y Diana', monto: 200, fecha: '2026-01-15', metodo: 'Depósito', nro_recibo: 'REC-00015', estado: 'pagado' }
            ]
        }
    ],
    control_user: {
        username: 'control',
        password: 'wistus2026',
        pin: '2026',
        nombre: 'Secretaría de Control y Asistencia',
        fraternidad: "Fraternidad Tinkus Wistus"
    }
};
