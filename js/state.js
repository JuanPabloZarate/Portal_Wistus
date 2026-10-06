/**
 * STATE MANAGER - LOCALSTORAGE REACTIVO
 * Gestiona la persistencia de datos, sesión activa, temas y operaciones de negocio.
 * Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus
 */

const STORAGE_KEY = 'portal_fraternal_storage_v4';
const SESSION_KEY = 'portal_fraternal_session_v4';

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
                if (parsed && Array.isArray(parsed.miembros)) {
                    parsed.current_theme = 'wistus';
                    parsed.themes = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.themes));
                    parsed.control_user = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.control_user));
                    
                    // Asegurar que los miembros oficiales base estén sincronizados
                    if (DEFAULT_PORTAL_CONFIG && Array.isArray(DEFAULT_PORTAL_CONFIG.miembros)) {
                        DEFAULT_PORTAL_CONFIG.miembros.forEach(defaultM => {
                            const idx = parsed.miembros.findIndex(m => String(m.ci).trim() === String(defaultM.ci).trim());
                            if (idx === -1) {
                                parsed.miembros.unshift(JSON.parse(JSON.stringify(defaultM)));
                            } else {
                                // Enriquecer con campos base si faltaran
                                parsed.miembros[idx] = {
                                    fecha_nacimiento: defaultM.fecha_nacimiento || '',
                                    contacto_emergencia: defaultM.contacto_emergencia || '',
                                    telefono_emergencia: defaultM.telefono_emergencia || '',
                                    talla_traje: defaultM.talla_traje || 'M',
                                    vouchers_pendientes: defaultM.vouchers_pendientes || [],
                                    ...parsed.miembros[idx]
                                };
                            }
                        });
                    }

                    if (!parsed.cuotas_definidas || parsed.cuotas_definidas.length === 0) {
                        parsed.cuotas_definidas = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.cuotas_definidas));
                    }
                    if (!parsed.eventos || parsed.eventos.length === 0) {
                        parsed.eventos = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.eventos));
                    }
                    // Sincronizar bloques y filiales oficiales vigentes
                    parsed.bloques = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.bloques));
                    parsed.filiales = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.filiales));

                    // Normalizar miembros al nuevo esquema de 2 bloques y 7 filiales oficiales
                    if (Array.isArray(parsed.miembros)) {
                        parsed.miembros.forEach(m => {
                            if (!m.bloque_id || (m.bloque_id !== 'hombres' && m.bloque_id !== 'mujeres')) {
                                const bRaw = String(m.bloque_id || '').toLowerCase() + ' ' + String(m.bloque_nombre || '').toLowerCase();
                                const isFemale = bRaw.includes('imilla') || bRaw.includes('choclo') || bRaw.includes('wanlli') || bRaw.includes('mujer');
                                m.bloque_id = isFemale ? 'mujeres' : 'hombres';
                                m.bloque_nombre = isFemale ? 'Bloque Mujeres' : 'Bloque Hombres';
                            }
                            if (!m.filial_id) {
                                m.filial_id = 'matriz_lp';
                                m.filial_nombre = 'Matriz (La Paz)';
                            }
                        });
                    }

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
        return (this.state && Array.isArray(this.state.miembros)) ? this.state.miembros : (DEFAULT_PORTAL_CONFIG.miembros || []);
    }

    getMemberByCI(ci) {
        if (!ci || !String(ci).trim()) return null;
        const rawCI = String(ci).trim();
        const cleanCI = rawCI.replace(/[^0-9]/g, '');

        let member = this.getMembers().find(m => {
            const mRaw = String(m.ci || '').trim();
            const mClean = mRaw.replace(/[^0-9]/g, '');
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
        });

        if (!member && DEFAULT_PORTAL_CONFIG && Array.isArray(DEFAULT_PORTAL_CONFIG.miembros)) {
            member = DEFAULT_PORTAL_CONFIG.miembros.find(m => {
                const mRaw = String(m.ci || '').trim();
                const mClean = mRaw.replace(/[^0-9]/g, '');
                return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
            });
            if (member) {
                if (!this.state.miembros) this.state.miembros = [];
                this.state.miembros.push(JSON.parse(JSON.stringify(member)));
                this.saveState();
            }
        }
        return member;
    }

    addMember(memberData) {
        if (!this.state.miembros) this.state.miembros = [];
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
            fecha_nacimiento: memberData.fecha_nacimiento || '',
            contacto_emergencia: memberData.contacto_emergencia || '',
            telefono_emergencia: memberData.telefono_emergencia || '',
            talla_traje: memberData.talla_traje || 'M',
            bloque_id: memberData.bloque_id || 'hombres',
            bloque_nombre: memberData.bloque_nombre || 'Bloque Hombres',
            filial_id: memberData.filial_id || 'matriz_lp',
            filial_nombre: memberData.filial_nombre || 'Matriz (La Paz)',
            rol_fraternal: memberData.rol_fraternal || 'Fraterno Titular',
            antiguedad_anios: parseInt(memberData.antiguedad_anios, 10) || 1,
            foto: memberData.foto || 'assets/img/avatar-default.svg',
            estado_fraterno: memberData.estado_fraterno || 'activo',
            asistencias: memberData.asistencias || {},
            pagos: memberData.pagos || [],
            vouchers_pendientes: memberData.vouchers_pendientes || []
        };
        this.state.miembros.push(newMember);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(newMember, false).catch(err => console.warn(err));
        }

        return newMember;
    }

    seedSampleMembers(count = 10) {
        if (typeof WistusDataGenerator !== 'undefined') {
            const genFn = WistusDataGenerator.generateSamplePadron || WistusDataGenerator.generateSamplePadrón;
            const newMembers = typeof genFn === 'function' ? genFn.call(WistusDataGenerator, count) : [];
            let added = 0;
            if (!this.state.miembros) this.state.miembros = [];
            newMembers.forEach(m => {
                const exists = this.getMemberByCI(m.ci);
                if (!exists) {
                    this.state.miembros.push(m);
                    added++;
                }
            });
            if (added > 0) this.saveState();
            return added;
        }
        return 0;
    }

    updateMember(ci, updates) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');
        Object.assign(member, updates);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(member, false).catch(err => console.warn(err));
        }

        return member;
    }

    calculateProfileCompletion(member) {
        if (!member) return { percentage: 0, criteria: [], statusText: 'Incompleto', statusClass: 'text-danger' };

        const criteria = [
            {
                id: 'foto',
                label: 'Fotografía de Perfil',
                completed: !!(member.foto && member.foto !== 'assets/img/avatar-default.svg' && !member.foto.includes('avatar-default.svg')),
                weight: 15
            },
            {
                id: 'nombres',
                label: 'Nombres Registrados',
                completed: !!(member.nombres && member.nombres.trim().length > 0),
                weight: 15
            },
            {
                id: 'apellidos',
                label: 'Apellidos Registrados',
                completed: !!(member.apellidos && member.apellidos.trim().length > 0),
                weight: 15
            },
            {
                id: 'telefono',
                label: 'Teléfono / WhatsApp',
                completed: !!(member.telefono && member.telefono.trim().length >= 7),
                weight: 15
            },
            {
                id: 'email',
                label: 'Correo Electrónico',
                completed: !!(member.email && member.email.trim().length > 4 && member.email.includes('@')),
                weight: 15
            },
            {
                id: 'fecha_nacimiento',
                label: 'Fecha de Nacimiento',
                completed: !!(member.fecha_nacimiento && member.fecha_nacimiento.trim().length > 0),
                weight: 10
            },
            {
                id: 'contacto_emergencia',
                label: 'Contacto de Emergencia',
                completed: !!((member.contacto_emergencia && member.contacto_emergencia.trim().length > 0) || (member.telefono_emergencia && member.telefono_emergencia.trim().length > 0)),
                weight: 15
            }
        ];

        let earned = 0;
        criteria.forEach(c => {
            if (c.completed) earned += c.weight;
        });

        const percentage = Math.min(100, earned);

        let statusText = 'Incompleto';
        let statusClass = 'text-danger';
        if (percentage >= 100) {
            statusText = '¡100% Completo!';
            statusClass = 'text-success';
        } else if (percentage >= 70) {
            statusText = 'Casi Completo';
            statusClass = 'text-primary';
        } else if (percentage >= 40) {
            statusText = 'En Progreso';
            statusClass = 'text-warning';
        }

        return {
            percentage,
            earned,
            statusText,
            statusClass,
            criteria
        };
    }

    // --- ASISTENCIAS ---
    markAttendance(ci, eventId, estado = 'presente', marcadoPor = 'Control', extras = {}) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado para marcar asistencia');

        if (!member.asistencias) member.asistencias = {};

        const event = this.getEventById(eventId);
        const eventLugar = event ? event.lugar : 'Punto de Concentración Tinkus Wistus';

        const now = new Date();
        const horaStr = extras.hora || now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
        const fechaStr = extras.fecha || now.toISOString().substring(0, 10);

        member.asistencias[eventId] = {
            estado: estado, // 'presente', 'atraso', 'falta', 'licencia'
            hora: horaStr,
            fecha: fechaStr,
            marcado_por: marcadoPor,
            lugar: extras.lugar || eventLugar,
            justificacion: extras.justificacion || '',
            timestamp: now.toISOString()
        };

        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveAsistencia({
                ci: String(ci),
                eventoId: String(eventId),
                estado: estado,
                hora: horaStr,
                fecha: fechaStr,
                marcado_por: marcadoPor,
                lugar: extras.lugar || eventLugar,
                timestamp: now.toISOString()
            }, false).catch(err => console.warn(err));
        }

        return member.asistencias[eventId];
    }

    clearAttendance(ci, eventId) {
        const member = this.getMemberByCI(ci);
        if (!member) return false;
        if (member.asistencias && member.asistencias[eventId]) {
            delete member.asistencias[eventId];
            this.saveState();
            return true;
        }
        return false;
    }

    markAllPendingAsFalta(eventId) {
        const members = this.getMembers();
        let updatedCount = 0;
        members.forEach(m => {
            const reg = m.asistencias ? m.asistencias[eventId] : null;
            if (!reg || reg.estado === 'pendiente' || !reg.estado) {
                this.markAttendance(m.ci, eventId, 'falta', 'Cierre de Lista Directiva');
                updatedCount++;
            }
        });
        return updatedCount;
    }

    markBlockAttendance(eventId, bloqueId, estado = 'presente', marcadoPor = 'Directiva de Bloque') {
        const members = this.getMembers();
        let updatedCount = 0;
        members.forEach(m => {
            if (bloqueId === 'all' || m.bloque_id === bloqueId) {
                this.markAttendance(m.ci, eventId, estado, marcadoPor);
                updatedCount++;
            }
        });
        return updatedCount;
    }

    getEventAttendanceStats(eventId) {
        const members = this.getMembers();
        let presentes = 0, atrasos = 0, faltas = 0, licencias = 0, pendientes = 0;
        const blockBreakdown = {};

        members.forEach(m => {
            const bId = m.bloque_id || 'general';
            if (!blockBreakdown[bId]) {
                blockBreakdown[bId] = {
                    id: bId,
                    name: m.bloque_nombre || bId,
                    total: 0,
                    presentes: 0,
                    atrasos: 0,
                    faltas: 0,
                    licencias: 0,
                    pendientes: 0
                };
            }
            blockBreakdown[bId].total++;

            const reg = m.asistencias ? m.asistencias[eventId] : null;
            if (!reg || reg.estado === 'pendiente' || !reg.estado) {
                pendientes++;
                blockBreakdown[bId].pendientes++;
            } else if (reg.estado === 'presente') {
                presentes++;
                blockBreakdown[bId].presentes++;
            } else if (reg.estado === 'atraso') {
                atrasos++;
                blockBreakdown[bId].atrasos++;
            } else if (reg.estado === 'licencia') {
                licencias++;
                blockBreakdown[bId].licencias++;
            } else if (reg.estado === 'falta') {
                faltas++;
                blockBreakdown[bId].faltas++;
            }
        });

        const total = members.length;
        const totalMarcados = presentes + atrasos + licencias + faltas;
        const porcentajeEfectivo = total > 0 ? Math.round(((presentes + atrasos * 0.7 + licencias * 0.9) / total) * 100) : 0;

        return {
            total,
            presentes,
            atrasos,
            faltas,
            licencias,
            pendientes,
            totalMarcados,
            porcentajeEfectivo,
            blockBreakdown
        };
    }

    // --- GESTIÓN DE CUOTAS Y TARIFAS DEFINIDAS ---
    getCuotas() {
        if (!this.state.cuotas_definidas || !Array.isArray(this.state.cuotas_definidas) || this.state.cuotas_definidas.length === 0) {
            this.state.cuotas_definidas = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.cuotas_definidas || []));
            this.saveState();
        }
        return this.state.cuotas_definidas;
    }

    getCuotaById(id) {
        return this.getCuotas().find(c => c.id === id);
    }

    addCuota(cuotaData) {
        if (!this.state.cuotas_definidas) this.state.cuotas_definidas = [];
        const monto = parseFloat(cuotaData.monto) || 0;
        if (!cuotaData.title || cuotaData.title.trim().length === 0) {
            throw new Error('El título o concepto de la cuota es obligatorio');
        }
        if (monto <= 0) {
            throw new Error('El monto de la cuota debe ser mayor a 0 Bs.');
        }

        const maxNum = this.state.cuotas_definidas.reduce((max, c) => {
            const num = parseInt((c.id || '').replace('cuota_', ''), 10);
            return !isNaN(num) && num > max ? num : max;
        }, 0);

        const newCuota = {
            id: cuotaData.id || ('cuota_' + (maxNum + 1)),
            title: cuotaData.title.trim(),
            monto: monto,
            vencimiento: cuotaData.vencimiento || new Date().toISOString().substring(0, 10),
            obligatorio: cuotaData.obligatorio !== undefined ? !!cuotaData.obligatorio : true,
            categoria: cuotaData.categoria || 'General'
        };

        this.state.cuotas_definidas.push(newCuota);
        this.saveState();
        return newCuota;
    }

    updateCuota(id, updates) {
        const index = this.getCuotas().findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cuota no encontrada');

        this.state.cuotas_definidas[index] = {
            ...this.state.cuotas_definidas[index],
            title: updates.title !== undefined ? updates.title.trim() : this.state.cuotas_definidas[index].title,
            monto: updates.monto !== undefined ? (parseFloat(updates.monto) || 0) : this.state.cuotas_definidas[index].monto,
            vencimiento: updates.vencimiento !== undefined ? updates.vencimiento : this.state.cuotas_definidas[index].vencimiento,
            obligatorio: updates.obligatorio !== undefined ? !!updates.obligatorio : this.state.cuotas_definidas[index].obligatorio,
            categoria: updates.categoria !== undefined ? updates.categoria : (this.state.cuotas_definidas[index].categoria || 'General')
        };

        this.saveState();
        return this.state.cuotas_definidas[index];
    }

    deleteCuota(id) {
        if (!this.state.cuotas_definidas) return false;
        const initialLen = this.state.cuotas_definidas.length;
        this.state.cuotas_definidas = this.state.cuotas_definidas.filter(c => c.id !== id);
        if (this.state.cuotas_definidas.length !== initialLen) {
            this.saveState();
            return true;
        }
        return false;
    }

    // --- PAGOS, COMPROBANTES Y VOUCHERS ---
    registerPayment(ci, paymentData) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.pagos) member.pagos = [];

        const monto = parseFloat(paymentData.monto) || 0;
        if (monto <= 0) throw new Error('El monto del pago debe ser mayor a 0');

        const cuotaId = paymentData.cuota_id || 'cuota_general';
        const cuota = this.getCuotaById(cuotaId);
        const concepto = paymentData.concepto || (cuota ? cuota.title : 'Aporte Carnaval de Oruro 2027');

        const now = new Date();
        const nroRecibo = paymentData.nro_recibo !== undefined && paymentData.nro_recibo !== '' 
            ? paymentData.nro_recibo 
            : ('REC-' + Math.floor(10000 + Math.random() * 90000));

        const newPayment = {
            id: paymentData.id || ('PAG-' + Date.now().toString().slice(-6)),
            cuota_id: cuotaId,
            concepto: concepto,
            monto: monto,
            fecha: paymentData.fecha || now.toISOString().substring(0, 10),
            hora: paymentData.hora || now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            metodo: paymentData.metodo || 'Efectivo',
            banco_origen: paymentData.banco_origen || '',
            nro_transaccion: paymentData.nro_transaccion || '',
            nro_recibo: nroRecibo,
            cajero: paymentData.cajero || 'Tesorería Wistus',
            estado: paymentData.estado || 'pagado',
            saldo_pendiente: paymentData.saldo_pendiente !== undefined ? paymentData.saldo_pendiente : 0,
            observaciones: paymentData.observaciones || ''
        };

        member.pagos.unshift(newPayment);

        // Si había una observación de rechazo previa en esta cuota, limpiarla al registrar el pago
        if (member.vouchers_rechazados && Array.isArray(member.vouchers_rechazados)) {
            member.vouchers_rechazados = member.vouchers_rechazados.filter(vr => vr.cuota_id !== cuotaId);
        }

        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.savePago({
                ...newPayment,
                ci: String(ci)
            }, false).catch(err => console.warn(err));
        }

        return newPayment;
    }

    submitVoucher(ci, voucherData) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.vouchers_pendientes) member.vouchers_pendientes = [];

        const monto = parseFloat(voucherData.monto) || 0;
        if (monto <= 0) throw new Error('El monto reportado debe ser mayor a 0');

        const cuotaId = voucherData.cuota_id;
        const existingIndex = member.vouchers_pendientes.findIndex(v => v.cuota_id === cuotaId);
        
        const now = new Date();
        const voucherObj = {
            id: existingIndex >= 0 ? member.vouchers_pendientes[existingIndex].id : ('VOUCH-' + Date.now().toString().slice(-6)),
            cuota_id: cuotaId,
            concepto: voucherData.concepto || 'Cuota Fraternal',
            monto: monto,
            foto_base64: voucherData.foto_base64,
            banco_origen: voucherData.banco_origen || 'Banco Nacional de Bolivia (BNB)',
            nro_transaccion: voucherData.nro_transaccion || '',
            fecha_transferencia: voucherData.fecha_transferencia || now.toISOString().substring(0, 10),
            notas_fraterno: voucherData.notas_fraterno || '',
            fecha: voucherData.fecha || now.toISOString().substring(0, 10),
            hora: now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            estado: 'pendiente_verificacion'
        };

        if (existingIndex >= 0) {
            member.vouchers_pendientes[existingIndex] = voucherObj;
        } else {
            member.vouchers_pendientes.unshift(voucherObj);
        }

        // Si se reenvía un voucher, limpiar advertencia de rechazo anterior para esa cuota
        if (member.vouchers_rechazados && Array.isArray(member.vouchers_rechazados)) {
            member.vouchers_rechazados = member.vouchers_rechazados.filter(vr => vr.cuota_id !== cuotaId);
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
                    member_telefono: m.telefono || '',
                    bloque_id: m.bloque_id || 'hombres',
                    bloque_nombre: m.bloque_nombre || 'Bloque Hombres',
                    filial_id: m.filial_id || 'matriz_lp',
                    filial_nombre: m.filial_nombre || 'Matriz (La Paz)'
                });
            });
        });
        pending.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        return pending;
    }

    confirmVoucher(ci, voucherId, customAmount = null, directivaNotes = '') {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.vouchers_pendientes) member.vouchers_pendientes = [];

        const idx = member.vouchers_pendientes.findIndex(v => v.id === voucherId);
        if (idx === -1) throw new Error('Voucher no encontrado');

        const voucher = member.vouchers_pendientes[idx];
        member.vouchers_pendientes.splice(idx, 1);

        const montoFinal = (customAmount !== null && !isNaN(customAmount) && parseFloat(customAmount) > 0) 
            ? parseFloat(customAmount) 
            : voucher.monto;

        const metodoTexto = voucher.banco_origen ? `Transferencia / ${voucher.banco_origen}` : 'Transferencia / QR (Voucher)';

        const payment = this.registerPayment(ci, {
            cuota_id: voucher.cuota_id,
            concepto: voucher.concepto,
            monto: montoFinal,
            metodo: metodoTexto,
            banco_origen: voucher.banco_origen || '',
            nro_transaccion: voucher.nro_transaccion || '',
            cajero: 'Verificación Directiva',
            observaciones: directivaNotes || (customAmount ? `Monto verificado ajustado a Bs. ${montoFinal}` : 'Verificado por Directiva')
        });

        this.saveState();
        return payment;
    }

    rejectVoucher(ci, voucherId, motivo = 'Comprobante no válido o no legible') {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        if (!member.vouchers_pendientes) member.vouchers_pendientes = [];

        const idx = member.vouchers_pendientes.findIndex(v => v.id === voucherId);
        if (idx !== -1) {
            const voucher = member.vouchers_pendientes[idx];
            if (!member.vouchers_rechazados) member.vouchers_rechazados = [];
            
            member.vouchers_rechazados.unshift({
                id: voucher.id,
                cuota_id: voucher.cuota_id,
                concepto: voucher.concepto,
                monto: voucher.monto,
                motivo: motivo || 'Comprobante observado por Tesorería',
                fecha: new Date().toISOString().substring(0, 10)
            });

            member.vouchers_pendientes.splice(idx, 1);
            this.saveState();
            return true;
        }
        return false;
    }

    confirmAllPendingVouchers() {
        const pending = this.getPendingVouchers();
        let confirmedCount = 0;
        pending.forEach(v => {
            try {
                this.confirmVoucher(v.member_ci, v.id);
                confirmedCount++;
            } catch (e) {
                console.warn('Error confirmando voucher por lote:', e);
            }
        });
        return confirmedCount;
    }

    getFinancialSummary() {
        const members = this.getMembers();
        const cuotasDef = this.getCuotas();
        let cuotaTotalIndividual = 0;
        cuotasDef.forEach(c => cuotaTotalIndividual += (parseFloat(c.monto) || 0));

        let totalRecaudado = 0;
        let totalProyectado = cuotaTotalIndividual * members.length;
        let fraternosAlDia = 0;
        let fraternosConSaldo = 0;

        const bloquesConfig = (this.state && Array.isArray(this.state.bloques) && this.state.bloques.length > 0)
            ? this.state.bloques
            : (DEFAULT_PORTAL_CONFIG.bloques || []);
        const bloquesMap = {};
        bloquesConfig.forEach(b => {
            bloquesMap[b.id] = {
                id: b.id,
                name: b.name,
                color: b.color || '#3b82f6',
                total_miembros: 0,
                recaudado: 0,
                proyectado: 0,
                al_dia: 0,
                con_saldo: 0
            };
        });

        members.forEach(m => {
            const bId = (m.bloque_id === 'mujeres' || m.bloque_id === 'hombres') ? m.bloque_id : 'hombres';
            if (!bloquesMap[bId]) {
                bloquesMap[bId] = {
                    id: bId,
                    name: m.bloque_nombre || (bId === 'mujeres' ? 'Bloque Mujeres' : 'Bloque Hombres'),
                    color: bId === 'mujeres' ? '#ec4899' : '#3b82f6',
                    total_miembros: 0,
                    recaudado: 0,
                    proyectado: 0,
                    al_dia: 0,
                    con_saldo: 0
                };
            }

            const mPagos = m.pagos || [];
            const pagado = mPagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
            
            totalRecaudado += pagado;
            bloquesMap[bId].total_miembros++;
            bloquesMap[bId].recaudado += pagado;
            bloquesMap[bId].proyectado += cuotaTotalIndividual;

            if (pagado >= cuotaTotalIndividual && cuotaTotalIndividual > 0) {
                fraternosAlDia++;
                bloquesMap[bId].al_dia++;
            } else {
                fraternosConSaldo++;
                bloquesMap[bId].con_saldo++;
            }
        });

        const pendingVouchers = this.getPendingVouchers();
        const pendingMonto = pendingVouchers.reduce((acc, v) => acc + (parseFloat(v.monto) || 0), 0);

        const porBloque = Object.values(bloquesMap).map(b => ({
            ...b,
            porcentaje: b.proyectado > 0 ? Math.round((b.recaudado / b.proyectado) * 100) : 100
        }));

        return {
            totalRecaudado,
            totalProyectado,
            cuotaTotalIndividual,
            fraternosAlDia,
            fraternosConSaldo,
            pendingVouchersCount: pendingVouchers.length,
            pendingVouchersMonto: pendingMonto,
            porBloque
        };
    }

    getBloques() {
        return (this.state && Array.isArray(this.state.bloques) && this.state.bloques.length > 0)
            ? this.state.bloques
            : (DEFAULT_PORTAL_CONFIG.bloques || []);
    }

    getFiliales() {
        return (this.state && Array.isArray(this.state.filiales) && this.state.filiales.length > 0)
            ? this.state.filiales
            : (DEFAULT_PORTAL_CONFIG.filiales || []);
    }

    getStatsByFilial() {
        const members = this.getMembers();
        const filialesConfig = this.getFiliales();
        const filialesMap = {};

        filialesConfig.forEach(f => {
            filialesMap[f.id] = {
                id: f.id,
                name: f.name,
                pais: f.pais || 'Bolivia',
                sede: f.sede || '',
                total_miembros: 0,
                hombres: 0,
                mujeres: 0,
                recaudado: 0
            };
        });

        members.forEach(m => {
            const fId = m.filial_id || 'matriz_lp';
            if (!filialesMap[fId]) {
                filialesMap[fId] = {
                    id: fId,
                    name: m.filial_nombre || fId,
                    pais: 'Bolivia',
                    sede: '',
                    total_miembros: 0,
                    hombres: 0,
                    mujeres: 0,
                    recaudado: 0
                };
            }
            filialesMap[fId].total_miembros++;
            if (m.bloque_id === 'mujeres') {
                filialesMap[fId].mujeres++;
            } else {
                filialesMap[fId].hombres++;
            }

            const pagado = (m.pagos || []).reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
            filialesMap[fId].recaudado += pagado;
        });

        return Object.values(filialesMap);
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
            lugar: eventData.lugar || 'Sede Social Tinkus Wistus',
            responsable: eventData.responsable || 'Mesa Directiva y Control',
            tolerancia_minutos: parseInt(eventData.tolerancia_minutos, 10) || 15,
            referencia_mapa: eventData.referencia_mapa || '',
            estado: eventData.estado || 'proximo',
            obligatorio: eventData.obligatorio !== undefined ? !!eventData.obligatorio : true
        };
        this.state.eventos.push(newEvent);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveEvento(newEvent, false).catch(err => console.warn(err));
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
                responsable: eventData.responsable !== undefined ? eventData.responsable : (this.state.eventos[index].responsable || 'Mesa Directiva y Control'),
                tolerancia_minutos: eventData.tolerancia_minutos !== undefined ? parseInt(eventData.tolerancia_minutos, 10) : (this.state.eventos[index].tolerancia_minutos || 15),
                referencia_mapa: eventData.referencia_mapa !== undefined ? eventData.referencia_mapa : (this.state.eventos[index].referencia_mapa || ''),
                estado: eventData.estado !== undefined ? eventData.estado : this.state.eventos[index].estado,
                obligatorio: eventData.obligatorio !== undefined ? !!eventData.obligatorio : this.state.eventos[index].obligatorio
            };
            this.saveState();

            if (window.DBService && window.DBService.isCloudActive) {
                window.DBService.saveEvento(this.state.eventos[index], false).catch(err => console.warn(err));
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
        return this.markAttendance(registro.ci, registro.eventoId || registro.evento_id, registro.estado, registro.marcado_por);
    }

    addPago(pago) {
        return this.registerPayment(pago.ci, pago);
    }

    addEvento(evento) {
        const existing = this.getEventById(evento.id);
        if (existing) {
            return this.updateEvent(evento.id, evento);
        } else {
            return this.addEvent(evento);
        }
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
