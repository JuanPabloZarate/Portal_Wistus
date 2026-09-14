/**
 * STATE MANAGER - LOCALSTORAGE REACTIVO
 * Gestiona la persistencia de datos, sesión activa, temas y operaciones de negocio.
 */

const STORAGE_KEY = 'portal_fraternal_storage_v3';
const SESSION_KEY = 'portal_fraternal_session_v3';

class PortalStateManager {
    constructor() {
        this.listeners = [];
        this.state = this.loadState();
    }

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Validación básica de integridad y migración a Tinkus Wistus
                if (parsed.miembros) {
                    parsed.current_theme = 'wistus';
                    parsed.themes = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.themes));
                    this.saveState(parsed);
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error cargando estado desde LocalStorage:', e);
        }
        // Inicializar con los datos base por defecto
        const initial = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG));
        this.saveState(initial);
        return initial;
    }

    saveState(newState) {
        this.state = newState || this.state;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Error guardando en LocalStorage:', e);
        }
        this.notify();
    }

    resetDefaults() {
        const initial = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG));
        this.saveState(initial);
        return initial;
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    notify() {
        this.listeners.forEach(fn => {
            try { fn(this.state); } catch (e) { console.error('Error en listener:', e); }
        });
    }

    // --- GESTIÓN DE SESIÓN ---
    getSession() {
        try {
            const s = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
            return s ? JSON.parse(s) : null;
        } catch (e) {
            return null;
        }
    }

    setSession(sessionData, remember = false) {
        const str = JSON.stringify(sessionData);
        sessionStorage.setItem(SESSION_KEY, str);
        if (remember) {
            localStorage.setItem(SESSION_KEY, str);
        }
        this.notify();
    }

    clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        this.notify();
    }

    // --- IDENTIDAD TINKUS WISTUS ---
    getCurrentTheme() {
        return DEFAULT_PORTAL_CONFIG.themes.wistus;
    }

    // --- MIEMBROS & PADRÓN ---
    getMembers() {
        return this.state.miembros || [];
    }

    getMemberByCI(ci) {
        const cleanCI = String(ci).trim();
        return this.getMembers().find(m => String(m.ci).trim() === cleanCI);
    }

    addMember(memberData) {
        const existing = this.getMemberByCI(memberData.ci);
        if (existing) {
            throw new Error(`El CI ${memberData.ci} ya se encuentra registrado.`);
        }
        const newMember = {
            ci: String(memberData.ci).trim(),
            ci_exp: memberData.ci_exp || 'LP',
            nombres: memberData.nombres || '',
            apellidos: memberData.apellidos || '',
            email: memberData.email || '',
            telefono: memberData.telefono || '',
            bloque_id: memberData.bloque_id || 'galanes',
            bloque_nombre: memberData.bloque_nombre || 'Bloque Galanes',
            rol_fraternal: memberData.rol_fraternal || 'Fraterno Titular',
            antiguedad_anios: parseInt(memberData.antiguedad_anios, 10) || 1,
            foto: memberData.foto || 'assets/img/avatar-default.svg',
            estado_fraterno: 'activo',
            asistencias: {},
            pagos: []
        };
        this.state.miembros.push(newMember);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(newMember).catch(err => console.warn(err));
        }

        return newMember;
    }

    updateMember(ci, updates) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');
        Object.assign(member, updates);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(member).catch(err => console.warn(err));
        }

        return member;
    }

    // --- ASISTENCIAS ---
    markAttendance(ci, eventId, estado = 'presente', marcadoPor = 'Control') {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado para marcar asistencia');

        if (!member.asistencias) member.asistencias = {};

        const now = new Date();
        const horaStr = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

        member.asistencias[eventId] = {
            estado: estado, // 'presente', 'atraso', 'falta', 'licencia'
            hora: horaStr,
            marcado_por: marcadoPor,
            timestamp: now.toISOString()
        };

        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveAsistencia({
                ci: String(ci),
                eventoId: String(eventId),
                estado: estado,
                hora: horaStr,
                marcado_por: marcadoPor,
                timestamp: now.toISOString()
            }).catch(err => console.warn(err));
        }

        return member.asistencias[eventId];
    }

    getEventAttendanceStats(eventId) {
        const members = this.getMembers();
        let presentes = 0, atrasos = 0, faltas = 0, licencias = 0, pendientes = 0;

        members.forEach(m => {
            const reg = m.asistencias ? m.asistencias[eventId] : null;
            if (!reg || reg.estado === 'pendiente') pendientes++;
            else if (reg.estado === 'presente') presentes++;
            else if (reg.estado === 'atraso') atrasos++;
            else if (reg.estado === 'licencia') licencias++;
            else if (reg.estado === 'falta') faltas++;
        });

        const total = members.length;
        const totalMarcados = presentes + atrasos + licencias + faltas;
        const porcentajeEfectivo = total > 0 ? Math.round(((presentes + atrasos * 0.7 + licencias) / total) * 100) : 0;

        return {
            total,
            presentes,
            atrasos,
            faltas,
            licencias,
            pendientes,
            totalMarcados,
            porcentajeEfectivo
        };
    }

    // --- PAGOS & CUOTAS ---
    registerPayment(ci, paymentData) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.pagos) member.pagos = [];

        const nroRecibo = paymentData.nro_recibo !== undefined ? paymentData.nro_recibo : ('REC-' + Math.floor(10000 + Math.random() * 90000));
        const newPayment = {
            id: 'PAG-' + Date.now().toString().slice(-6),
            cuota_id: paymentData.cuota_id,
            concepto: paymentData.concepto,
            monto: parseFloat(paymentData.monto),
            fecha: paymentData.fecha || new Date().toISOString().substring(0, 10),
            metodo: paymentData.metodo || 'Efectivo',
            nro_recibo: nroRecibo,
            cajero: paymentData.cajero || 'Tesorería Wist\'us',
            estado: paymentData.estado || 'pagado',
            saldo_pendiente: paymentData.saldo_pendiente || 0
        };

        member.pagos.unshift(newPayment);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.savePago({
                ...newPayment,
                ci: String(ci)
            }).catch(err => console.warn(err));
        }

        return newPayment;
    }

    submitVoucher(ci, voucherData) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.vouchers_pendientes) member.vouchers_pendientes = [];

        const existingIndex = member.vouchers_pendientes.findIndex(v => v.cuota_id === voucherData.cuota_id);
        const voucherObj = {
            id: existingIndex >= 0 ? member.vouchers_pendientes[existingIndex].id : 'VOUCH-' + Date.now().toString().slice(-6),
            cuota_id: voucherData.cuota_id,
            concepto: voucherData.concepto,
            monto: parseFloat(voucherData.monto),
            foto_base64: voucherData.foto_base64,
            fecha: voucherData.fecha || new Date().toISOString().substring(0, 10),
            estado: 'pendiente_verificacion'
        };

        if (existingIndex >= 0) {
            member.vouchers_pendientes[existingIndex] = voucherObj;
        } else {
            member.vouchers_pendientes.unshift(voucherObj);
        }

        this.saveState();
        return voucherObj;
    }

    getPendingVouchers() {
        const members = this.getMembers();
        let pending = [];
        members.forEach(m => {
            (m.vouchers_pendientes || []).forEach(v => {
                pending.push({
                    ...v,
                    member_ci: m.ci,
                    member_nombre: `${m.nombres} ${m.apellidos}`,
                    bloque_nombre: m.bloque_nombre
                });
            });
        });
        pending.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        return pending;
    }

    confirmVoucher(ci, voucherId) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.vouchers_pendientes) member.vouchers_pendientes = [];

        const idx = member.vouchers_pendientes.findIndex(v => v.id === voucherId);
        if (idx === -1) throw new Error('Voucher no encontrado');

        const voucher = member.vouchers_pendientes[idx];
        member.vouchers_pendientes.splice(idx, 1);

        const payment = this.registerPayment(ci, {
            cuota_id: voucher.cuota_id,
            concepto: voucher.concepto,
            monto: voucher.monto,
            metodo: 'Transferencia / QR (Voucher)',
            cajero: 'Verificación Directiva',
            nro_recibo: 'TRANSF-VERIFICADA'
        });

        this.saveState();
        return payment;
    }

    rejectVoucher(ci, voucherId) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (member.vouchers_pendientes) {
            member.vouchers_pendientes = member.vouchers_pendientes.filter(v => v.id !== voucherId);
            this.saveState();
        }
        return true;
    }

    // --- EVENTOS ---
    getEvents() {
        return this.state.eventos || [];
    }

    getEventById(id) {
        return this.getEvents().find(e => e.id === id);
    }

    addEvent(eventData) {
        const events = this.getEvents();
        const maxId = events.reduce((max, ev) => {
            const num = parseInt((ev.id || '').replace('ev_', ''), 10);
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        const newEvent = {
            id: eventData.id || ('ev_' + (maxId + 1)),
            title: eventData.title,
            tipo: eventData.tipo || 'Ensayo',
            fecha: eventData.fecha,
            hora: eventData.hora || '15:00 - 19:00',
            lugar: eventData.lugar || 'Sede Wist\'us',
            estado: eventData.estado || 'proximo',
            obligatorio: eventData.obligatorio !== undefined ? !!eventData.obligatorio : true,
            puntos_asistencia: parseInt(eventData.puntos_asistencia, 10) || 10
        };
        this.state.eventos.push(newEvent);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveEvento(newEvent).catch(err => console.warn(err));
        }

        return newEvent;
    }

    updateEvent(id, eventData) {
        const index = (this.state.eventos || []).findIndex(e => e.id === id);
        if (index !== -1) {
            this.state.eventos[index] = {
                ...this.state.eventos[index],
                title: eventData.title !== undefined ? eventData.title : this.state.eventos[index].title,
                tipo: eventData.tipo !== undefined ? eventData.tipo : this.state.eventos[index].tipo,
                fecha: eventData.fecha !== undefined ? eventData.fecha : this.state.eventos[index].fecha,
                hora: eventData.hora !== undefined ? eventData.hora : this.state.eventos[index].hora,
                lugar: eventData.lugar !== undefined ? eventData.lugar : this.state.eventos[index].lugar,
                estado: eventData.estado !== undefined ? eventData.estado : this.state.eventos[index].estado,
                obligatorio: eventData.obligatorio !== undefined ? !!eventData.obligatorio : this.state.eventos[index].obligatorio,
                puntos_asistencia: eventData.puntos_asistencia !== undefined ? parseInt(eventData.puntos_asistencia, 10) : this.state.eventos[index].puntos_asistencia
            };
            this.saveState();

            if (window.DBService && window.DBService.isCloudActive) {
                window.DBService.saveEvento(this.state.eventos[index]).catch(err => console.warn(err));
            }

            return this.state.eventos[index];
        }
        return null;
    }

    deleteEvent(id) {
        if (!this.state.eventos) return false;
        const initialLength = this.state.eventos.length;
        this.state.eventos = this.state.eventos.filter(e => e.id !== id);
        if (this.state.eventos.length !== initialLength) {
            this.saveState();
            return true;
        }
        return false;
    }

    // --- MÉTODOS DE SINCRONIZACIÓN REALTIME / DBSERVICE ---
    setPadron(miembros, notifyState = true) {
        if (Array.isArray(miembros)) {
            this.state.miembros = miembros;
            if (notifyState) this.saveState();
            else this.notify();
        }
    }

    setEventos(eventos, notifyState = true) {
        if (Array.isArray(eventos)) {
            this.state.eventos = eventos;
            if (notifyState) this.saveState();
            else this.notify();
        }
    }

    setAvisos(avisos, notifyState = true) {
        if (Array.isArray(avisos)) {
            this.state.avisos = avisos;
            if (notifyState) this.saveState();
            else this.notify();
        }
    }

    setPagos(pagos, notifyState = true) {
        if (Array.isArray(pagos)) {
            // Mapear pagos a miembros según CI
            pagos.forEach(p => {
                if (p.ci) {
                    const m = this.getMemberByCI(p.ci);
                    if (m) {
                        if (!m.pagos) m.pagos = [];
                        const exists = m.pagos.some(mp => mp.id === p.id || (mp.cuota_id === p.cuota_id && mp.monto === p.monto));
                        if (!exists) m.pagos.unshift(p);
                    }
                }
            });
            if (notifyState) this.saveState();
            else this.notify();
        }
    }

    setAsistencias(asistencias, notifyState = true) {
        if (Array.isArray(asistencias)) {
            asistencias.forEach(a => {
                if (a.ci && a.eventoId) {
                    const m = this.getMemberByCI(a.ci);
                    if (m) {
                        if (!m.asistencias) m.asistencias = {};
                        m.asistencias[a.eventoId] = a;
                    }
                }
            });
            if (notifyState) this.saveState();
            else this.notify();
        }
    }

    addOrUpdateFraterno(fraterno) {
        const existing = this.getMemberByCI(fraterno.ci);
        if (existing) {
            return this.updateMember(fraterno.ci, fraterno);
        } else {
            return this.addMember(fraterno);
        }
    }

    addAsistencia(registro) {
        return this.markAttendance(registro.ci, registro.eventoId, registro.estado, registro.marcado_por);
    }

    addPago(pago) {
        return this.registerPayment(pago.ci, pago);
    }

    addAviso(aviso) {
        if (!this.state.avisos) this.state.avisos = [];
        this.state.avisos.unshift(aviso);
        this.saveState();
        return aviso;
    }
}

// Instancia global accesible como PortalState y StateManager
window.PortalState = new PortalStateManager();
window.StateManager = window.PortalState;

