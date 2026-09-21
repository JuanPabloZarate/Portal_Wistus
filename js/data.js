/**
 * CONFIGURACIÓN INICIAL DEL PORTAL - TINKUS WISTUS 2026
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
            estado: 'activo',
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
            ci: '6998544',
            ci_exp: 'LP',
            nombres: 'Fraterno',
            apellidos: 'Wistus Oficial',
            email: 'fraterno6998544@tinkuswistus.bo',
            telefono: '+591 76543210',
            bloque_id: 'machas',
            bloque_nombre: 'Bloque Machas Wistus',
            rol_fraternal: 'Fraterno Titular',
            antiguedad_anios: 3,
            foto: 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {
                'ev_1': { estado: 'presente', hora: '15:10', marcado_por: 'Secretaría Control' },
                'ev_2': { estado: 'presente', hora: '15:40', marcado_por: 'Secretaría Control' },
                'ev_3': { estado: 'presente', hora: '15:15', marcado_por: 'Secretaría Control' },
                'ev_4': { estado: 'pendiente', hora: null, marcado_por: null }
            },
            pagos: [
                { id: 'PAG-101', cuota_id: 'cuota_1', concepto: 'Inscripción Entrada Universitaria La Paz 2026', monto: 250, fecha: '2026-02-15', metodo: 'QR Banco BNB', nro_recibo: 'REC-00101', estado: 'pagado' },
                { id: 'PAG-102', cuota_id: 'cuota_2', concepto: 'Banda Oficial y Acompañamiento', monto: 350, fecha: '2026-03-05', metodo: 'Efectivo', nro_recibo: 'REC-00185', estado: 'pagado' }
            ]
        }
    ],
    control_user: {
        username: 'admi',
        password: 'admi123',
        pin: '2026',
        nombre: 'Mesa Directiva y Control',
        fraternidad: "Fraternidad Tinkus Wistus",
        allowed_users: ['admi', 'directiva', 'control']
    }
};
