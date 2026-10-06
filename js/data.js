/**
 * CONFIGURACIÓN INICIAL DEL PORTAL - TINKUS WISTUS 2027
 * Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus
 * Estructura de Datos Centralizada y Generador de Padrón Fraternal
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
            year: '2027',
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
        { id: 'hombres', name: 'Bloque Hombres', guia: 'Juan Pablo Quispe', cupos: 150, color: '#3b82f6' },
        { id: 'mujeres', name: 'Bloque Mujeres', guia: 'Maria Elena Flores', cupos: 150, color: '#ec4899' }
    ],
    filiales: [
        { id: 'matriz_lp', name: 'Matriz (La Paz)', pais: 'Bolivia', sede: 'San Pedro, Calle Almirante Grau' },
        { id: 'cochabamba', name: 'Cochabamba', pais: 'Bolivia', sede: 'Filial Cochabamba' },
        { id: 'santa_cruz', name: 'Santa Cruz', pais: 'Bolivia', sede: 'Filial Santa Cruz' },
        { id: 'peru', name: 'Perú', pais: 'Perú', sede: 'Filial Internacional Perú' },
        { id: 'chile', name: 'Chile', pais: 'Chile', sede: 'Filial Internacional Chile' },
        { id: 'europa', name: 'Europa', pais: 'España / Europa', sede: 'Filial Internacional Europa' },
        { id: 'estados_unidos', name: 'Estados Unidos', pais: 'Estados Unidos', sede: 'Filial Internacional Estados Unidos' }
    ],
    cuotas_definidas: [
        { id: 'cuota_1', title: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 300, vencimiento: '2026-11-30', obligatorio: true },
        { id: 'cuota_2', title: 'Banda Oficial y Acompañamiento Carnaval', monto: 400, vencimiento: '2026-12-31', obligatorio: true },
        { id: 'cuota_3', title: 'Confección Traje Oficial Tinku Wistus (Montera y Chaleco)', monto: 900, vencimiento: '2027-01-25', obligatorio: true },
        { id: 'cuota_4', title: 'Convite y Recepción Social', monto: 250, vencimiento: '2027-02-15', obligatorio: true }
    ],
    bancos_disponibles: [
        { id: 'bnb', name: 'Banco Nacional de Bolivia (BNB)', cuenta: '150-1928374-2', titular: 'Fraternidad Tinkus Wistus', tipo: 'Cuenta Corriente', qr_habilitado: true },
        { id: 'union', name: 'Banco Unión S.A.', cuenta: '10000034829102', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'bmsc', name: 'Banco Mercantil Santa Cruz (BMSC)', cuenta: '4010892341', titular: 'Fraternidad Tinkus Wistus', tipo: 'Cuenta Corriente', qr_habilitado: true },
        { id: 'bisa', name: 'Banco BISA', cuenta: '601294821', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'fie', name: 'Banco FIE', cuenta: '809124712', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'sol', name: 'BancoSol', cuenta: '901284711', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'ganadero', name: 'Banco Ganadero', cuenta: '701294812', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'economico', name: 'Banco Económico', cuenta: '501294819', titular: 'Fraternidad Tinkus Wistus', tipo: 'Caja de Ahorro', qr_habilitado: true },
        { id: 'otro', name: 'Otro Banco / Billetera Móvil (Tigo Money, etc.)', cuenta: '150-1928374-2', titular: 'Fraternidad Tinkus Wistus', tipo: 'Referencia', qr_habilitado: false }
    ],
    eventos: [
        {
            id: 'ev_1',
            title: '1er Ensayo General y Confraternización Tinku',
            tipo: 'Ensayo',
            fecha: '2026-11-15',
            hora: '15:00 - 19:00',
            lugar: 'Sede Social Tinkus Wistus (Zona San Pedro, Calle Almirante Grau)',
            responsable: 'Directiva Central y Mesa de Control',
            tolerancia_minutos: 20,
            estado: 'finalizado',
            obligatorio: true
        },
        {
            id: 'ev_2',
            title: 'Primer Convite Oruro - Ruta Socavón',
            tipo: 'Convite',
            fecha: '2026-12-06',
            hora: '07:00 - 18:00',
            lugar: 'Av. 6 de Agosto hasta Santuario del Socavón (Oruro)',
            responsable: 'Directiva Central y Pasantes Oruro 2027',
            tolerancia_minutos: 15,
            estado: 'finalizado',
            obligatorio: true
        },
        {
            id: 'ev_3',
            title: 'Ensayo General de Pasos y Medición de Monteras',
            tipo: 'Ensayo',
            fecha: '2027-01-17',
            hora: '15:00 - 19:30',
            lugar: 'Cancha Polideportiva Munaypata / Sede Social',
            responsable: 'Secretaría de Control y Guías',
            tolerancia_minutos: 15,
            estado: 'finalizado',
            obligatorio: true
        },
        {
            id: 'ev_4',
            title: 'Último Convite Santuario del Socavón',
            tipo: 'Convite',
            fecha: '2027-01-31',
            hora: '07:00 - 19:00',
            lugar: 'Ruta Oficial del Carnaval de Oruro (Av. 6 de Agosto al Socavón)',
            responsable: 'Directiva Central y Control General',
            tolerancia_minutos: 15,
            estado: 'activo',
            obligatorio: true
        },
        {
            id: 'ev_5',
            title: 'Gran Entrada - Sábado de Peregrinación Carnaval Oruro 2027',
            tipo: 'Entrada Oficial',
            fecha: '2027-02-06',
            hora: '06:00 - 22:00',
            lugar: 'Ruta Oficial Carnaval de Oruro (Avenida 6 de Agosto hasta el Socavón)',
            responsable: 'Directiva Central y Pasantes Oruro 2027',
            tolerancia_minutos: 10,
            estado: 'proximo',
            obligatorio: true
        },
        {
            id: 'ev_6',
            title: 'Domingo de Carnaval, Alba y Recepción Fraternal',
            tipo: 'Recepción',
            fecha: '2027-02-07',
            hora: '05:00 - 20:00',
            lugar: 'Santuario del Socavón y Salón de Fiestas Oruro',
            responsable: 'Comisión de Festejos Oruro 2027',
            tolerancia_minutos: 30,
            estado: 'proximo',
            obligatorio: false
        }
    ],
    comunicados: [
        {
            id: 'com_1',
            fecha: '2027-01-20',
            titulo: 'Control Estricto con Credencial QR en el Último Convite y Entrada Oruro 2027',
            autor: 'Secretaría de Control y Asistencia',
            contenido: 'Recordamos a todos los fraternos y fraternas de la Fraternidad Tinkus Wistus que para el Último Convite y el Sábado de Peregrinación en Oruro, el control de asistencia se realizará exclusivamente mediante escaneo de Credencial Digital QR o presentación de CI.',
            prioridad: 'alta'
        },
        {
            id: 'com_2',
            fecha: '2026-12-15',
            titulo: 'Última Fecha para Pago de Cuota 2 (Banda Oficial Carnaval)',
            autor: 'Tesorería General Tinkus Wistus 2027',
            contenido: 'Fraternos que aún tengan saldo pendiente en la Cuota 2 deben regularizar hasta el 31 de diciembre para confirmar su puesto en fila y bloque oficial de Tinkus Wistus para el Carnaval de Oruro 2027.',
            prioridad: 'media'
        },
        {
            id: 'com_3',
            fecha: '2027-01-10',
            titulo: 'Entrega de Traje Oficial y Monteras Oruro 2027',
            autor: 'Comisión de Bordados y Trajes',
            contenido: 'La sastrería oficial iniciará la prueba final y entrega de chalecos y monteras en la sede social para todos los fraternos con la Cuota 3 cancelada.',
            prioridad: 'baja'
        }
    ],
    miembros: [
        {
            ci: '4839201',
            ci_exp: 'LP',
            nombres: 'Juan Pablo',
            apellidos: 'Quispe Mamani',
            email: 'juanpablo.quispe@tinkuswistus.bo',
            telefono: '+591 76543210',
            fecha_nacimiento: '1995-04-18',
            contacto_emergencia: 'Dra. Rosario Mamani (Madre)',
            telefono_emergencia: '+591 71234567',
            talla_traje: 'L',
            bloque_id: 'hombres',
            bloque_nombre: 'Bloque Hombres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Guía de Bloque',
            antiguedad_anios: 5,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '14:55', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T14:55:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:20', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:20:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:05', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:05:00.000Z' },
                'ev_4': { estado: 'presente', hora: '18:10', marcado_por: 'Terminal QR', timestamp: '2026-04-12T18:10:00.000Z' }
            },
            pagos: [
                { id: 'PAG-48301', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-10', metodo: 'QR Banco BNB', nro_recibo: 'REC-00201', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-48302', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-02', metodo: 'QR Banco BNB', nro_recibo: 'REC-00288', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-48303', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku (Montera y Chaleco)', monto: 800, fecha: '2026-03-25', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00412', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-48304', cuota_id: 'cuota_4', concepto: 'Recepción Social y Diana', monto: 200, fecha: '2026-04-01', metodo: 'Efectivo', nro_recibo: 'REC-00505', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '6892341',
            ci_exp: 'LP',
            nombres: 'Maria Elena',
            apellidos: 'Flores Condori',
            email: 'maria.flores@tinkuswistus.bo',
            telefono: '+591 79812345',
            fecha_nacimiento: '1998-09-12',
            contacto_emergencia: 'Carlos Flores (Hermano)',
            telefono_emergencia: '+591 72345678',
            talla_traje: 'M',
            bloque_id: 'mujeres',
            bloque_nombre: 'Bloque Mujeres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Guía de Bloque',
            antiguedad_anios: 4,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:10:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:35', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:35:00.000Z' },
                'ev_3': { estado: 'atraso', hora: '16:20', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T16:20:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-68901', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-14', metodo: 'QR Banco BNB', nro_recibo: 'REC-00215', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-68902', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-10', metodo: 'QR Banco Unión', nro_recibo: 'REC-00302', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: [
                {
                    id: 'VOUCH-68903',
                    cuota_id: 'cuota_3',
                    concepto: 'Confección Traje Oficial Tinku (Montera y Chaleco)',
                    monto: 800,
                    foto_base64: 'assets/img/wistus-badge.svg',
                    fecha: '2026-04-05',
                    estado: 'pendiente_verificacion'
                }
            ]
        },
        {
            ci: '6998544',
            ci_exp: 'LP',
            nombres: 'Fraterno',
            apellidos: 'Wistus Oficial',
            email: 'fraterno6998544@tinkuswistus.bo',
            telefono: '+591 76543210',
            fecha_nacimiento: '1997-06-20',
            contacto_emergencia: 'Secretaría Tinkus Wistus',
            telefono_emergencia: '+591 22490123',
            talla_traje: 'M',
            bloque_id: 'hombres',
            bloque_nombre: 'Bloque Hombres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Fraterno Titular',
            antiguedad_anios: 3,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:10:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:40', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:40:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:15:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-101', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-15', metodo: 'QR Banco BNB', nro_recibo: 'REC-00101', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-102', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-05', metodo: 'Efectivo', nro_recibo: 'REC-00185', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '3459128',
            ci_exp: 'LP',
            nombres: 'Carlos',
            apellidos: 'Mendoza Alarcón',
            email: 'carlos.mendoza@tinkuswistus.bo',
            telefono: '+591 71589412',
            fecha_nacimiento: '1988-11-03',
            contacto_emergencia: 'Patricia Alarcón',
            telefono_emergencia: '+591 70654321',
            talla_traje: 'XL',
            bloque_id: 'hombres',
            bloque_nombre: 'Bloque Hombres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Guía de Bloque',
            antiguedad_anios: 8,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:00', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:00:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:15:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:00', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:00:00.000Z' },
                'ev_4': { estado: 'presente', hora: '18:00', marcado_por: 'Terminal QR', timestamp: '2026-04-12T18:00:00.000Z' }
            },
            pagos: [
                { id: 'PAG-34501', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-05', metodo: 'QR Banco BNB', nro_recibo: 'REC-00110', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-34502', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-02-28', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00195', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-34503', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku (Montera y Chaleco)', monto: 800, fecha: '2026-03-20', metodo: 'QR Banco BNB', nro_recibo: 'REC-00380', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '5128394',
            ci_exp: 'LP',
            nombres: 'Gabriela',
            apellidos: 'Vargas Ticona',
            email: 'gabriela.vargas@tinkuswistus.bo',
            telefono: '+591 73091823',
            fecha_nacimiento: '2000-02-14',
            contacto_emergencia: 'Gonzalo Vargas',
            telefono_emergencia: '+591 78901234',
            talla_traje: 'S',
            bloque_id: 'mujeres',
            bloque_nombre: 'Bloque Mujeres',
            filial_id: 'cochabamba',
            filial_nombre: 'Cochabamba',
            rol_fraternal: 'Guía de Bloque',
            antiguedad_anios: 3,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:05', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:05:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:25', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:25:00.000Z' },
                'ev_3': { estado: 'licencia', hora: null, marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:00:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-51201', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-18', metodo: 'Efectivo', nro_recibo: 'REC-00220', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-51202', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-15', metodo: 'QR Banco BNB', nro_recibo: 'REC-00315', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '7823419',
            ci_exp: 'LP',
            nombres: 'Sonia',
            apellidos: 'Choque Callisaya',
            email: 'sonia.choque@tinkuswistus.bo',
            telefono: '+591 76210984',
            fecha_nacimiento: '2002-07-28',
            contacto_emergencia: 'Martha Callisaya',
            telefono_emergencia: '+591 71987654',
            talla_traje: 'M',
            bloque_id: 'mujeres',
            bloque_nombre: 'Bloque Mujeres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Guía de Bloque',
            antiguedad_anios: 2,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:15:00.000Z' },
                'ev_2': { estado: 'falta', hora: null, marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:30:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:10:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-78201', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-25', metodo: 'QR Banco BNB', nro_recibo: 'REC-00245', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '2984120',
            ci_exp: 'LP',
            nombres: 'Roberto',
            apellidos: 'Alarcón Zeballos',
            email: 'roberto.alarcon@tinkuswistus.bo',
            telefono: '+591 70123456',
            fecha_nacimiento: '1982-12-10',
            contacto_emergencia: 'Directiva Central Wistus',
            telefono_emergencia: '+591 22490123',
            talla_traje: 'L',
            bloque_id: 'hombres',
            bloque_nombre: 'Bloque Hombres',
            filial_id: 'matriz_lp',
            filial_nombre: 'Matriz (La Paz)',
            rol_fraternal: 'Pasante Mayor 2027',
            antiguedad_anios: 12,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '14:40', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T14:40:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:00', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:00:00.000Z' },
                'ev_3': { estado: 'presente', hora: '14:50', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T14:50:00.000Z' },
                'ev_4': { estado: 'presente', hora: '17:45', marcado_por: 'Terminal QR', timestamp: '2026-04-12T17:45:00.000Z' }
            },
            pagos: [
                { id: 'PAG-29801', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-01-20', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00050', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-29802', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-02-15', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00120', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-29803', cuota_id: 'cuota_3', concepto: 'Confección Traje Oficial Tinku (Montera y Chaleco)', monto: 800, fecha: '2026-03-10', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00305', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-29804', cuota_id: 'cuota_4', concepto: 'Recepción Social y Diana', monto: 200, fecha: '2026-03-28', metodo: 'Transferencia Bancaria', nro_recibo: 'REC-00450', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '8341902',
            ci_exp: 'CB',
            nombres: 'Rodrigo',
            apellidos: 'Mamani Yujra',
            email: 'rodrigo.mamani@tinkuswistus.bo',
            telefono: '+591 75891234',
            fecha_nacimiento: '1999-03-25',
            contacto_emergencia: 'Elena Yujra',
            telefono_emergencia: '+591 76549871',
            talla_traje: 'M',
            bloque_id: 'hombres',
            bloque_nombre: 'Bloque Hombres',
            filial_id: 'cochabamba',
            filial_nombre: 'Cochabamba',
            rol_fraternal: 'Fraterno Titular',
            antiguedad_anios: 2,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:25', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:25:00.000Z' },
                'ev_2': { estado: 'atraso', hora: '16:15', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T16:15:00.000Z' },
                'ev_3': { estado: 'falta', hora: null, marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:00:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-83401', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-28', metodo: 'QR Banco BNB', nro_recibo: 'REC-00260', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '7201845',
            ci_exp: 'SC',
            nombres: 'Daniela',
            apellidos: 'Condori Gutierrez',
            email: 'daniela.condori@tinkuswistus.bo',
            telefono: '+591 78451290',
            fecha_nacimiento: '2001-10-15',
            contacto_emergencia: 'Saul Condori',
            telefono_emergencia: '+591 79123847',
            talla_traje: 'S',
            bloque_id: 'mujeres',
            bloque_nombre: 'Bloque Mujeres',
            filial_id: 'santa_cruz',
            filial_nombre: 'Santa Cruz',
            rol_fraternal: 'Fraterna Titular',
            antiguedad_anios: 1,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:10:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:30', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:30:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:10:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-72001', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-12', metodo: 'QR Banco BNB', nro_recibo: 'REC-00170', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 },
                { id: 'PAG-72002', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-18', metodo: 'QR Banco BNB', nro_recibo: 'REC-00330', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: []
        },
        {
            ci: '9048172',
            ci_exp: 'OR',
            nombres: 'Paola',
            apellidos: 'Gutierrez Huanca',
            email: 'paola.gutierrez@tinkuswistus.bo',
            telefono: '+591 77341908',
            fecha_nacimiento: '2003-05-19',
            contacto_emergencia: 'Carmen Huanca',
            telefono_emergencia: '+591 76401928',
            talla_traje: 'M',
            bloque_id: 'mujeres',
            bloque_nombre: 'Bloque Mujeres',
            filial_id: 'peru',
            filial_nombre: 'Perú',
            rol_fraternal: 'Fraterna Aspirante',
            antiguedad_anios: 1,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:20', marcado_por: 'Secretaría Control', timestamp: '2026-02-15T15:20:00.000Z' },
                'ev_2': { estado: 'presente', hora: '15:40', marcado_por: 'Secretaría Control', timestamp: '2026-03-08T15:40:00.000Z' },
                'ev_3': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control', timestamp: '2026-03-22T15:15:00.000Z' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-90401', cuota_id: 'cuota_1', concepto: 'Inscripción Oficial Carnaval de Oruro 2027', monto: 250, fecha: '2026-02-27', metodo: 'QR Banco BNB', nro_recibo: 'REC-00255', cajero: 'Tesorería Wistus', estado: 'pagado', saldo_pendiente: 0 }
            ],
            vouchers_pendientes: [
                {
                    id: 'VOUCH-90402',
                    cuota_id: 'cuota_2',
                    concepto: 'Banda Oficial y Acompañamiento',
                    monto: 350,
                    foto_base64: 'assets/img/wistus-badge.svg',
                    fecha: '2026-03-30',
                    estado: 'pendiente_verificacion'
                }
            ]
        }
    ],
    control_user: {
        username: 'admi',
        password: 'admi123',
        pin: '2027',
        nombre: 'Mesa Directiva y Control',
        fraternidad: "Fraternidad Tinkus Wistus",
        allowed_users: ['admi', 'directiva', 'control', 'admin', 'supervisor']
    }
};

/**
 * GENERADOR DE DATOS Y NORMALIZADOR DEL PADRÓN FRATERNAL
 * Provee herramientas dinámicas para crear fraternos realistas, generar registros y sembrar datos.
 */
class WistusDataGenerator {
    static FIRST_NAMES_MALE = [
        'Juan Pablo', 'Carlos', 'Rodrigo', 'Jorge Luis', 'Marco Antonio', 'Diego', 'Alejandro',
        'Mauricio', 'Fernando', 'Sergio', 'Gonzalo', 'Ramiro', 'Javier', 'Gustavo', 'Alvaro'
    ];

    static FIRST_NAMES_FEMALE = [
        'Maria Elena', 'Gabriela', 'Sonia', 'Daniela', 'Paola', 'Valeria', 'Camila',
        'Andrea', 'Lucia', 'Patricia', 'Adriana', 'Fernanda', 'Natalia', 'Claudia', 'Silvia'
    ];

    static LAST_NAMES = [
        'Quispe', 'Mamani', 'Flores', 'Condori', 'Mendoza', 'Vargas', 'Alarcón', 'Choque',
        'Gutierrez', 'Quisbert', 'Yujra', 'Ticona', 'Huanca', 'Callisaya', 'Arequipa',
        'Zeballos', 'Rojas', 'Torrez', 'Miranda', 'Apaza', 'Aguilar', 'Perez', 'Salinas'
    ];

    static EXPEDIDOS = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PA'];

    static PAYMENT_METHODS = ['QR Banco BNB', 'Banco Unión', 'Efectivo', 'BCP Soli Pagos', 'Tigo Money', 'Transferencia Bancaria'];

    /**
     * Genera un fraterno aleatorio válido con estructura estandarizada
     */
    static generateFraterno(options = {}) {
        const isFemale = options.gender ? options.gender === 'female' : (Math.random() > 0.5);
        const nameList = isFemale ? this.FIRST_NAMES_FEMALE : this.FIRST_NAMES_MALE;
        const nombre = options.nombres || nameList[Math.floor(Math.random() * nameList.length)];
        const apellido1 = this.LAST_NAMES[Math.floor(Math.random() * this.LAST_NAMES.length)];
        const apellido2 = this.LAST_NAMES[Math.floor(Math.random() * this.LAST_NAMES.length)];
        const apellidos = options.apellidos || `${apellido1} ${apellido2}`;

        const ciNum = options.ci || String(Math.floor(3000000 + Math.random() * 6999999));
        const ciExp = options.ci_exp || this.EXPEDIDOS[Math.floor(Math.random() * this.EXPEDIDOS.length)];

        const bloques = DEFAULT_PORTAL_CONFIG.bloques || [];
        let bloque = null;
        if (options.bloque_id) {
            bloque = bloques.find(b => b.id === options.bloque_id);
        }
        if (!bloque) {
            const targetId = isFemale ? 'mujeres' : 'hombres';
            bloque = bloques.find(b => b.id === targetId) || (isFemale ? { id: 'mujeres', name: 'Bloque Mujeres' } : { id: 'hombres', name: 'Bloque Hombres' });
        }

        const filiales = DEFAULT_PORTAL_CONFIG.filiales || [];
        let filial = null;
        if (options.filial_id) {
            filial = filiales.find(f => f.id === options.filial_id);
        }
        if (!filial) {
            // Asignación ponderada hacia Matriz (La Paz) o aleatoria
            if (Math.random() < 0.6) {
                filial = filiales.find(f => f.id === 'matriz_lp') || { id: 'matriz_lp', name: 'Matriz (La Paz)' };
            } else {
                filial = filiales[Math.floor(Math.random() * filiales.length)] || { id: 'matriz_lp', name: 'Matriz (La Paz)' };
            }
        }

        const antiguedad = options.antiguedad_anios !== undefined ? options.antiguedad_anios : Math.floor(1 + Math.random() * 6);
        const rol = options.rol_fraternal || (antiguedad >= 4 ? 'Fraterno Guía' : (antiguedad >= 2 ? 'Fraterno Titular' : 'Fraterno Aspirante'));

        const cleanName = nombre.toLowerCase().replace(/\s+/g, '.');
        const cleanLast = apellido1.toLowerCase();
        const email = options.email || `${cleanName}.${cleanLast}@tinkuswistus.bo`;
        const telefono = options.telefono || `+591 7${Math.floor(1000000 + Math.random() * 8999999)}`;

        // Generar historial de asistencias basado en eventos
        const asistencias = {};
        const events = DEFAULT_PORTAL_CONFIG.eventos || [];
        events.forEach(ev => {
            if (ev.estado === 'finalizado' || ev.estado === 'activo') {
                const rand = Math.random();
                if (rand < 0.75) {
                    const min = String(Math.floor(Math.random() * 45)).padStart(2, '0');
                    asistencias[ev.id] = { estado: 'presente', hora: `15:${min}`, marcado_por: 'Secretaría Control', timestamp: `${ev.fecha}T15:${min}:00.000Z` };
                } else if (rand < 0.88) {
                    asistencias[ev.id] = { estado: 'atraso', hora: '16:15', marcado_por: 'Secretaría Control', timestamp: `${ev.fecha}T16:15:00.000Z` };
                } else if (rand < 0.95) {
                    asistencias[ev.id] = { estado: 'licencia', hora: null, marcado_por: 'Secretaría Control', timestamp: `${ev.fecha}T15:00:00.000Z` };
                } else {
                    asistencias[ev.id] = { estado: 'falta', hora: null, marcado_por: 'Secretaría Control', timestamp: `${ev.fecha}T15:00:00.000Z` };
                }
            } else {
                asistencias[ev.id] = { estado: 'pendiente', hora: null, marcado_por: null };
            }
        });

        // Generar pagos
        const pagos = [];
        const cuotas = DEFAULT_PORTAL_CONFIG.cuotas_definidas || [];
        let pagosCount = options.pagosCount !== undefined ? options.pagosCount : Math.floor(1 + Math.random() * 4);
        if (options.hasPendingVoucher && cuotas.length > 0 && pagosCount >= cuotas.length) {
            pagosCount = cuotas.length - 1;
        }

        for (let i = 0; i < Math.min(pagosCount, cuotas.length); i++) {
            const cuota = cuotas[i];
            const reciboNum = String(Math.floor(10000 + Math.random() * 89999));
            pagos.push({
                id: `PAG-${String(ciNum).slice(-4)}-0${i + 1}`,
                cuota_id: cuota.id,
                concepto: cuota.title,
                monto: cuota.monto,
                fecha: cuota.vencimiento,
                metodo: this.PAYMENT_METHODS[Math.floor(Math.random() * this.PAYMENT_METHODS.length)],
                nro_recibo: `REC-${reciboNum}`,
                cajero: 'Tesorería Wistus',
                estado: 'pagado',
                saldo_pendiente: 0
            });
        }

        const vouchers_pendientes = [];
        if (options.hasPendingVoucher && cuotas.length > 0 && pagosCount < cuotas.length) {
            const nextCuota = cuotas[pagosCount];
            vouchers_pendientes.push({
                id: `VOUCH-${String(ciNum).slice(-4)}`,
                cuota_id: nextCuota.id,
                concepto: nextCuota.title,
                monto: nextCuota.monto,
                foto_base64: 'assets/img/wistus-badge.svg',
                fecha: new Date().toISOString().substring(0, 10),
                estado: 'pendiente_verificacion'
            });
        }

        return {
            ci: String(ciNum).trim(),
            ci_exp: ciExp,
            nombres: nombre,
            apellidos: apellidos,
            email: email,
            telefono: telefono,
            fecha_nacimiento: `199${Math.floor(Math.random() * 9)}-0${Math.floor(1 + Math.random() * 8)}-15`,
            contacto_emergencia: `Familiar (${apellido1})`,
            telefono_emergencia: `+591 7${Math.floor(1000000 + Math.random() * 8999999)}`,
            talla_traje: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
            bloque_id: bloque.id,
            bloque_nombre: bloque.name,
            filial_id: filial.id,
            filial_nombre: filial.name,
            rol_fraternal: rol,
            antiguedad_anios: antiguedad,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: asistencias,
            pagos: pagos,
            vouchers_pendientes: vouchers_pendientes
        };
    }

    /**
     * Genera una lista completa de fraternos adicionales
     */
    static generateSamplePadrón(count = 15) {
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push(this.generateFraterno({
                hasPendingVoucher: i % 4 === 0
            }));
        }
        return list;
    }

    static generateSamplePadron(count = 15) {
        return this.generateSamplePadrón(count);
    }
}

// Exportar globalmente
window.DEFAULT_PORTAL_CONFIG = DEFAULT_PORTAL_CONFIG;
window.WistusDataGenerator = WistusDataGenerator;
window.BOLIVIAN_BANKS = DEFAULT_PORTAL_CONFIG.bancos_disponibles;
window.BLOQUES_OFICIALES = DEFAULT_PORTAL_CONFIG.bloques;
window.FILIALES_OFICIALES = DEFAULT_PORTAL_CONFIG.filiales;


