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
                    
                    if (!parsed.eliminados || !Array.isArray(parsed.eliminados)) {
                        parsed.eliminados = [];
                    }
                    if (!parsed.purgados || !Array.isArray(parsed.purgados)) {
                        parsed.purgados = [];
                    }
                    if (!parsed.ci_modificados || typeof parsed.ci_modificados !== 'object') {
                        parsed.ci_modificados = {};
                    }

                    // Asegurar que los miembros oficiales base estén sincronizados sin revivir eliminados, purgados o modificados
                    if (DEFAULT_PORTAL_CONFIG && Array.isArray(DEFAULT_PORTAL_CONFIG.miembros)) {
                        DEFAULT_PORTAL_CONFIG.miembros.forEach(defaultM => {
                            const dCI = String(defaultM.ci || '').trim();
                            const dClean = dCI.replace(/[^0-9]/g, '');

                            const isEliminado = parsed.eliminados && parsed.eliminados.some(e => {
                                const eRaw = String(e.ci || '').trim();
                                const eOrig = String(e.ci_original || '').trim();
                                const eClean = eRaw.replace(/[^0-9]/g, '');
                                return eRaw.toLowerCase() === dCI.toLowerCase() || (dClean && eClean === dClean) ||
                                       (eOrig && eOrig.toLowerCase() === dCI.toLowerCase());
                            });

                            const isPurgado = parsed.purgados && parsed.purgados.some(p => {
                                const pRaw = String(p || '').trim();
                                const pClean = pRaw.replace(/[^0-9]/g, '');
                                return pRaw.toLowerCase() === dCI.toLowerCase() || (dClean && pClean === dClean);
                            });

                            const isRenombrado = (parsed.ci_modificados && parsed.ci_modificados[dCI]) ||
                                (parsed.miembros && parsed.miembros.some(m => {
                                    const mOrig = String(m.ci_original || '').trim();
                                    return mOrig && mOrig.toLowerCase() === dCI.toLowerCase();
                                }));

                            const idx = parsed.miembros.findIndex(m => {
                                const mRaw = String(m.ci || '').trim();
                                const mOrig = String(m.ci_original || '').trim();
                                const mClean = mRaw.replace(/[^0-9]/g, '');
                                return mRaw.toLowerCase() === dCI.toLowerCase() || (dClean && mClean === dClean) ||
                                       (mOrig && mOrig.toLowerCase() === dCI.toLowerCase());
                            });

                            if (idx === -1 && !isEliminado && !isPurgado && !isRenombrado) {
                                parsed.miembros.unshift(JSON.parse(JSON.stringify(defaultM)));
                            } else if (idx !== -1) {
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
                    // Sincronizar filiales oficiales vigentes y eliminar bloques
                    parsed.bloques = [];
                    parsed.filiales = JSON.parse(JSON.stringify(DEFAULT_PORTAL_CONFIG.filiales));

                    // Normalizar miembros al esquema 100% por Filial oficial
                    if (Array.isArray(parsed.miembros)) {
                        parsed.miembros.forEach(m => {
                            delete m.bloque_id;
                            delete m.bloque_nombre;
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
            if (!s) return null;
            const parsed = JSON.parse(s);
            if (parsed && parsed.role === 'miembro' && (parsed.bloque_id !== undefined || !parsed.filial_id)) {
                delete parsed.bloque_id;
                delete parsed.bloque_nombre;
                const member = this.getMemberByCI(parsed.ci);
                if (member) {
                    parsed.filial_id = member.filial_id || 'matriz_lp';
                    parsed.filial_nombre = member.filial_nombre || 'Matriz (La Paz)';
                    parsed.rol_fraternal = member.rol_fraternal || parsed.rol_fraternal || 'Fraterno Titular';
                } else {
                    parsed.filial_id = parsed.filial_id || 'matriz_lp';
                    parsed.filial_nombre = parsed.filial_nombre || 'Matriz (La Paz)';
                }
                const sanitizedStr = JSON.stringify(parsed);
                if (sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, sanitizedStr);
                if (localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, sanitizedStr);
            }
            return parsed;
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
            const mOrig = String(m.ci_original || '').trim();
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI) ||
                   (mOrig && mOrig.toLowerCase() === rawCI.toLowerCase());
        });

        // Revisar si el CI fue renombrado
        if (!member && this.state && this.state.ci_modificados && this.state.ci_modificados[rawCI]) {
            const mappedCI = this.state.ci_modificados[rawCI];
            member = this.getMembers().find(m => String(m.ci || '').trim().toLowerCase() === String(mappedCI).trim().toLowerCase());
        }

        if (!member && DEFAULT_PORTAL_CONFIG && Array.isArray(DEFAULT_PORTAL_CONFIG.miembros)) {
            const isEliminado = this.state.eliminados && this.state.eliminados.some(e => {
                const eRaw = String(e.ci || '').trim();
                const eClean = eRaw.replace(/[^0-9]/g, '');
                const eOrig = String(e.ci_original || '').trim();
                return eRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && eClean === cleanCI) ||
                       (eOrig && eOrig.toLowerCase() === rawCI.toLowerCase());
            });

            const isPurgado = this.state.purgados && this.state.purgados.some(p => {
                const pRaw = String(p || '').trim();
                const pClean = pRaw.replace(/[^0-9]/g, '');
                return pRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && pClean === cleanCI);
            });

            const isRenombrado = (this.state.ci_modificados && this.state.ci_modificados[rawCI]) ||
                this.getMembers().some(m => String(m.ci_original || '').trim().toLowerCase() === rawCI.toLowerCase());

            if (!isEliminado && !isPurgado && !isRenombrado) {
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

    getEliminados() {
        return (this.state && Array.isArray(this.state.eliminados)) ? this.state.eliminados : [];
    }

    getEliminadoByCI(ci) {
        if (!ci || !String(ci).trim()) return null;
        const rawCI = String(ci).trim();
        const cleanCI = rawCI.replace(/[^0-9]/g, '');
        return this.getEliminados().find(m => {
            const mRaw = String(m.ci || '').trim();
            const mClean = mRaw.replace(/[^0-9]/g, '');
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
        }) || null;
    }

    updateMember(ci, updates) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Miembro no encontrado');

        let oldCI = null;

        // Validar cambio de CI si se incluye en los updates
        if (updates.ci && String(updates.ci).trim() !== String(member.ci).trim()) {
            const newCI = String(updates.ci).trim();
            const cleanNewCI = newCI.replace(/[^0-9]/g, '');

            // Verificar colisión en padrón activo
            const conflict = this.getMembers().find(m => {
                if (m === member) return false;
                const mRaw = String(m.ci || '').trim();
                const mClean = mRaw.replace(/[^0-9]/g, '');
                return mRaw.toLowerCase() === newCI.toLowerCase() || (cleanNewCI && mClean === cleanNewCI);
            });
            if (conflict) {
                throw new Error(`El CI ${newCI} ya está registrado para el fraterno ${conflict.nombres} ${conflict.apellidos}.`);
            }

            // Verificar colisión con eliminados
            const conflictEliminado = this.getEliminados().find(e => {
                const eRaw = String(e.ci || '').trim();
                const eClean = eRaw.replace(/[^0-9]/g, '');
                return eRaw.toLowerCase() === newCI.toLowerCase() || (cleanNewCI && eClean === cleanNewCI);
            });
            if (conflictEliminado) {
                throw new Error(`El CI ${newCI} pertenece a un fraterno en la Base de Eliminados (${conflictEliminado.nombres} ${conflictEliminado.apellidos}). Restáurelo o use un CI diferente.`);
            }

            oldCI = String(member.ci).trim();
            member.ci_original = member.ci_original || oldCI;

            if (!this.state.ci_modificados) this.state.ci_modificados = {};
            this.state.ci_modificados[oldCI] = newCI;

            member.ci = newCI;

            // Actualizar pagos del miembro si tenían referencia a su CI
            if (Array.isArray(member.pagos)) {
                member.pagos.forEach(p => { p.ci = newCI; });
            }

            // Actualizar vouchers si tenían referencia
            if (Array.isArray(member.vouchers_pendientes)) {
                member.vouchers_pendientes.forEach(v => { v.member_ci = newCI; if (v.ci) v.ci = newCI; });
            }

            // Actualizar sesión activa si corresponde al miembro editado
            const session = this.getSession();
            if (session && session.ci && String(session.ci).trim() === String(oldCI).trim()) {
                session.ci = newCI;
                this.setSession(session);
            }
        }

        // Sincronizar nombre de filial oficial si cambia filial_id
        if (updates.filial_id && !updates.filial_nombre) {
            const filialesDef = (DEFAULT_PORTAL_CONFIG && DEFAULT_PORTAL_CONFIG.filiales) ? DEFAULT_PORTAL_CONFIG.filiales : [];
            const filialObj = filialesDef.find(f => f.id === updates.filial_id);
            if (filialObj) {
                updates.filial_nombre = filialObj.name;
            }
        }

        // Parsear antigüedad si viene como string
        if (updates.antiguedad_anios !== undefined) {
            updates.antiguedad_anios = parseInt(updates.antiguedad_anios, 10) || 1;
        }

        Object.assign(member, updates);
        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(member, false, oldCI).catch(err => console.warn(err));
        }

        return member;
    }

    deleteMember(ci, motivo = 'Baja solicitada por Mesa Directiva') {
        const member = this.getMemberByCI(ci);
        if (!member) {
            throw new Error(`Fraterno con CI ${ci} no encontrado en el padrón activo.`);
        }

        if (!this.state.miembros) this.state.miembros = [];
        const idx = this.state.miembros.indexOf(member);
        if (idx === -1) {
            const rawCI = String(ci || '').trim();
            const cleanCI = rawCI.replace(/[^0-9]/g, '');
            const fallbackIdx = this.state.miembros.findIndex(m => {
                const mRaw = String(m.ci || '').trim();
                const mClean = mRaw.replace(/[^0-9]/g, '');
                return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
            });
            if (fallbackIdx === -1) {
                throw new Error(`Fraterno con CI ${ci} no encontrado en el padrón activo.`);
            }
            this.state.miembros.splice(fallbackIdx, 1);
        } else {
            this.state.miembros.splice(idx, 1);
        }

        const session = this.getSession();
        const auditor = (session && (session.nombre_completo || session.username)) ? (session.nombre_completo || session.username) : 'Mesa Directiva';

        const recordEliminado = {
            ...member,
            estado_fraterno: 'eliminado',
            fecha_eliminacion: new Date().toISOString(),
            eliminado_por: auditor,
            motivo_eliminacion: motivo || 'Baja solicitada por Mesa Directiva'
        };

        if (!this.state.eliminados || !Array.isArray(this.state.eliminados)) {
            this.state.eliminados = [];
        }
        this.state.eliminados.unshift(recordEliminado);

        // Si la sesión activa pertenecía al miembro dado de baja, cerrar sesión
        if (session && session.ci && String(session.ci).trim() === String(member.ci).trim()) {
            this.clearSession();
        } else {
            this.saveState();
        }

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.deleteFraterno(member.ci, recordEliminado).catch(err => console.warn(err));
        }

        return recordEliminado;
    }

    restoreMember(ci) {
        const rawCI = String(ci || '').trim();
        const cleanCI = rawCI.replace(/[^0-9]/g, '');
        if (!this.state.eliminados || !Array.isArray(this.state.eliminados)) {
            this.state.eliminados = [];
        }

        const idx = this.state.eliminados.findIndex(m => {
            const mRaw = String(m.ci || '').trim();
            const mClean = mRaw.replace(/[^0-9]/g, '');
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
        });

        if (idx === -1) {
            throw new Error(`Fraterno con CI ${ci} no encontrado en la base de eliminados.`);
        }

        // Verificar colisión con padrón activo
        const conflict = this.getMembers().find(m => {
            const mRaw = String(m.ci || '').trim();
            const mClean = mRaw.replace(/[^0-9]/g, '');
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
        });
        if (conflict) {
            throw new Error(`Ya existe un fraterno activo con el CI ${ci} (${conflict.nombres} ${conflict.apellidos}).`);
        }

        const [removedEliminado] = this.state.eliminados.splice(idx, 1);
        const restored = { ...removedEliminado };
        restored.estado_fraterno = 'activo';
        restored.fecha_restauracion = new Date().toISOString();
        delete restored.fecha_eliminacion;
        delete restored.motivo_eliminacion;
        delete restored.eliminado_por;

        if (this.state.purgados && Array.isArray(this.state.purgados)) {
            this.state.purgados = this.state.purgados.filter(p => String(p).trim() !== rawCI);
        }

        if (!this.state.miembros) this.state.miembros = [];
        this.state.miembros.unshift(restored);

        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.restoreFraterno(restored.ci, restored).catch(err => console.warn(err));
        }

        return restored;
    }

    permanentlyDeleteEliminado(ci) {
        const rawCI = String(ci || '').trim();
        const cleanCI = rawCI.replace(/[^0-9]/g, '');
        if (!this.state.eliminados || !Array.isArray(this.state.eliminados)) return false;

        const idx = this.state.eliminados.findIndex(m => {
            const mRaw = String(m.ci || '').trim();
            const mClean = mRaw.replace(/[^0-9]/g, '');
            return mRaw.toLowerCase() === rawCI.toLowerCase() || (cleanCI && mClean === cleanCI);
        });

        if (idx === -1) return false;
        const [purged] = this.state.eliminados.splice(idx, 1);

        if (!this.state.purgados || !Array.isArray(this.state.purgados)) {
            this.state.purgados = [];
        }
        if (!this.state.purgados.includes(rawCI)) {
            this.state.purgados.push(rawCI);
        }
        if (purged.ci_original && !this.state.purgados.includes(purged.ci_original)) {
            this.state.purgados.push(purged.ci_original);
        }

        this.saveState();

        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.purgeEliminado(rawCI).catch(err => console.warn(err));
        }

        return true;
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

    markFilialAttendance(eventId, filialId, estado = 'presente', marcadoPor = 'Directiva Oficial') {
        const members = this.getMembers();
        let updatedCount = 0;
        members.forEach(m => {
            if (filialId === 'all' || m.filial_id === filialId) {
                this.markAttendance(m.ci, eventId, estado, marcadoPor);
                updatedCount++;
            }
        });
        return updatedCount;
    }

    markBlockAttendance(eventId, bloqueId, estado = 'presente', marcadoPor = 'Directiva Oficial') {
        return this.markFilialAttendance(eventId, bloqueId, estado, marcadoPor);
    }

    getEventAttendanceStats(eventId) {
        const members = this.getMembers();
        let presentes = 0, atrasos = 0, faltas = 0, licencias = 0, pendientes = 0;
        const filialBreakdown = {};

        const filiales = this.getFiliales();
        filiales.forEach(f => {
            filialBreakdown[f.id] = {
                id: f.id,
                name: f.name,
                total: 0,
                presentes: 0,
                atrasos: 0,
                faltas: 0,
                licencias: 0,
                pendientes: 0
            };
        });

        members.forEach(m => {
            const fId = m.filial_id || 'matriz_lp';
            if (!filialBreakdown[fId]) {
                filialBreakdown[fId] = {
                    id: fId,
                    name: m.filial_nombre || fId,
                    total: 0,
                    presentes: 0,
                    atrasos: 0,
                    faltas: 0,
                    licencias: 0,
                    pendientes: 0
                };
            }
            filialBreakdown[fId].total++;

            const reg = m.asistencias ? m.asistencias[eventId] : null;
            if (!reg || reg.estado === 'pendiente' || !reg.estado) {
                pendientes++;
                filialBreakdown[fId].pendientes++;
            } else if (reg.estado === 'presente') {
                presentes++;
                filialBreakdown[fId].presentes++;
            } else if (reg.estado === 'atraso') {
                atrasos++;
                filialBreakdown[fId].atrasos++;
            } else if (reg.estado === 'licencia') {
                licencias++;
                filialBreakdown[fId].licencias++;
            } else if (reg.estado === 'falta') {
                faltas++;
                filialBreakdown[fId].faltas++;
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
            filialBreakdown,
            blockBreakdown: filialBreakdown
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

        const prevTitle = this.state.cuotas_definidas[index].title;
        const newTitle = updates.title !== undefined ? updates.title.trim() : prevTitle;

        this.state.cuotas_definidas[index] = {
            ...this.state.cuotas_definidas[index],
            title: newTitle,
            monto: updates.monto !== undefined ? (parseFloat(updates.monto) || 0) : this.state.cuotas_definidas[index].monto,
            vencimiento: updates.vencimiento !== undefined ? updates.vencimiento : this.state.cuotas_definidas[index].vencimiento,
            obligatorio: updates.obligatorio !== undefined ? !!updates.obligatorio : this.state.cuotas_definidas[index].obligatorio,
            categoria: updates.categoria !== undefined ? updates.categoria : (this.state.cuotas_definidas[index].categoria || 'General')
        };

        // Si el título cambió, sincronizar en cascada en miembros, pagos y vouchers
        if (newTitle && newTitle !== prevTitle) {
            this.getMembers().forEach(m => {
                let memberModified = false;
                if (Array.isArray(m.pagos)) {
                    m.pagos.forEach(p => {
                        if (p.cuota_id === id) { p.concepto = newTitle; memberModified = true; }
                    });
                }
                if (Array.isArray(m.vouchers_pendientes)) {
                    m.vouchers_pendientes.forEach(v => {
                        if (v.cuota_id === id) { v.concepto = newTitle; memberModified = true; }
                    });
                }
                if (Array.isArray(m.cuotas_asignadas)) {
                    m.cuotas_asignadas.forEach(ca => {
                        if (ca.cuota_id === id || ca.id === id) { ca.title = newTitle; memberModified = true; }
                    });
                }
                if (memberModified && window.DBService && window.DBService.isCloudActive) {
                    window.DBService.saveFraterno(m, false).catch(err => console.warn(err));
                }
            });
        }

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

    renameCuota(id, newTitle) {
        if (!newTitle || !newTitle.trim()) {
            throw new Error('El título de la cuota no puede estar vacío');
        }
        const trimmed = newTitle.trim();

        // 1. Si existe en catálogo de cuotas definidas
        const inCatalog = this.getCuotas().some(c => c.id === id);
        if (inCatalog) {
            return this.updateCuota(id, { title: trimmed });
        }

        // 2. Si es un cobro único o cuota específica asignada
        let updatedCobro = null;
        this.getMembers().forEach(m => {
            let memberModified = false;
            if (Array.isArray(m.cuotas_asignadas)) {
                m.cuotas_asignadas.forEach(ca => {
                    if (ca.id === id || ca.cuota_id === id) {
                        ca.title = trimmed;
                        updatedCobro = ca;
                        memberModified = true;
                    }
                });
            }
            if (Array.isArray(m.pagos)) {
                m.pagos.forEach(p => {
                    if (p.cuota_id === id) {
                        p.concepto = trimmed;
                        memberModified = true;
                    }
                });
            }
            if (Array.isArray(m.vouchers_pendientes)) {
                m.vouchers_pendientes.forEach(v => {
                    if (v.cuota_id === id) {
                        v.concepto = trimmed;
                        memberModified = true;
                    }
                });
            }
            if (memberModified && window.DBService && window.DBService.isCloudActive) {
                window.DBService.saveFraterno(m, false).catch(err => console.warn(err));
            }
        });

        if (!updatedCobro) {
            throw new Error(`Cuota o Cobro Único con ID ${id} no encontrado`);
        }

        this.saveState();
        return updatedCobro;
    }

    getMemberCuotas(ci, includeUnassigned = false) {
        const member = this.getMemberByCI(ci);
        const catalog = this.getCuotas();
        if (!member) {
            return catalog.map(c => ({
                ...c,
                cuota_id: c.id,
                asignada: true,
                is_cobro_unico: false,
                monto_original: c.monto,
                monto: c.monto
            }));
        }

        const asignadas = member.cuotas_asignadas || null;
        const result = [];

        // Si no hay personalización explícita, hereda todas las cuotas del catálogo
        if (!asignadas || !Array.isArray(asignadas)) {
            catalog.forEach(cat => {
                result.push({
                    id: cat.id,
                    cuota_id: cat.id,
                    title: cat.title,
                    monto: cat.monto,
                    monto_original: cat.monto,
                    vencimiento: cat.vencimiento,
                    obligatorio: cat.obligatorio,
                    categoria: cat.categoria || 'General',
                    asignada: true,
                    is_cobro_unico: false
                });
            });
            return result;
        }

        // Si hay asignaciones personalizadas:
        catalog.forEach(cat => {
            const found = asignadas.find(a => (a.cuota_id === cat.id || a.id === cat.id));
            if (found) {
                const isAsignada = found.asignada !== false;
                if (isAsignada || includeUnassigned) {
                    result.push({
                        id: cat.id,
                        cuota_id: cat.id,
                        title: cat.title, // siempre actualizado con catálogo
                        monto: found.monto !== undefined ? (parseFloat(found.monto) || 0) : cat.monto,
                        monto_original: cat.monto,
                        vencimiento: found.vencimiento || cat.vencimiento,
                        obligatorio: found.obligatorio !== undefined ? found.obligatorio : cat.obligatorio,
                        categoria: cat.categoria || 'General',
                        asignada: isAsignada,
                        is_cobro_unico: false,
                        descuento: found.descuento || 0,
                        motivo_exencion: found.motivo_exencion || ''
                    });
                }
            } else {
                result.push({
                    id: cat.id,
                    cuota_id: cat.id,
                    title: cat.title,
                    monto: cat.monto,
                    monto_original: cat.monto,
                    vencimiento: cat.vencimiento,
                    obligatorio: cat.obligatorio,
                    categoria: cat.categoria || 'General',
                    asignada: true,
                    is_cobro_unico: false
                });
            }
        });

        // Cobros Únicos específicos para este miembro
        asignadas.forEach(a => {
            if (a.is_cobro_unico) {
                const isAsignada = a.asignada !== false;
                if (isAsignada || includeUnassigned) {
                    result.push({
                        id: a.id,
                        cuota_id: a.id,
                        title: a.title,
                        monto: parseFloat(a.monto) || 0,
                        vencimiento: a.vencimiento || new Date().toISOString().substring(0, 10),
                        obligatorio: a.obligatorio !== undefined ? a.obligatorio : true,
                        categoria: a.categoria || 'Cobro Único',
                        asignada: isAsignada,
                        is_cobro_unico: true,
                        fecha_asignacion: a.fecha_asignacion || new Date().toISOString().substring(0, 10),
                        observacion: a.observacion || ''
                    });
                }
            }
        });

        return result;
    }

    setMemberCuotasAsignadas(ci, assignedList) {
        const member = this.getMemberByCI(ci);
        if (!member) throw new Error('Fraterno no encontrado');
        member.cuotas_asignadas = JSON.parse(JSON.stringify(assignedList));
        this.saveState();
        if (window.DBService && window.DBService.isCloudActive) {
            window.DBService.saveFraterno(member, false).catch(err => console.warn(err));
        }
        return member.cuotas_asignadas;
    }

    assignCobroUnico(destinatarios, cobroData) {
        if (!cobroData || !cobroData.title || !cobroData.title.trim()) {
            throw new Error('El título o concepto del cobro único es obligatorio');
        }
        const monto = parseFloat(cobroData.monto) || 0;
        if (monto <= 0) {
            throw new Error('El monto del cobro único debe ser mayor a 0 Bs.');
        }

        const cobroId = cobroData.id || ('cu_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
        const itemCobro = {
            id: cobroId,
            cuota_id: cobroId,
            title: cobroData.title.trim(),
            monto: monto,
            vencimiento: cobroData.vencimiento || new Date().toISOString().substring(0, 10),
            categoria: cobroData.categoria || 'Cobro Único',
            obligatorio: cobroData.obligatorio !== undefined ? !!cobroData.obligatorio : true,
            is_cobro_unico: true,
            asignada: true,
            fecha_asignacion: new Date().toISOString().substring(0, 10),
            observacion: (cobroData.observacion || '').trim()
        };

        let targetCIs = [];
        if (Array.isArray(destinatarios)) {
            targetCIs = destinatarios;
        } else if (typeof destinatarios === 'string') {
            if (destinatarios === 'all') {
                targetCIs = this.getMembers().map(m => m.ci);
            } else {
                targetCIs = [destinatarios];
            }
        } else if (destinatarios && typeof destinatarios === 'object') {
            targetCIs = this.getMembers().filter(m => {
                const memFilial = m.filial_id || 'matriz_lp';
                if (destinatarios.filial_id && destinatarios.filial_id !== 'all' && memFilial !== destinatarios.filial_id) return false;
                if (destinatarios.rol && destinatarios.rol !== 'all' && m.rol_fraternal !== destinatarios.rol) return false;
                return true;
            }).map(m => m.ci);
        }

        if (targetCIs.length === 0) {
            throw new Error('No se seleccionaron fraternos destinatarios');
        }

        let countAssigned = 0;
        targetCIs.forEach(ci => {
            const member = this.getMemberByCI(ci);
            if (!member) return;

            if (!member.cuotas_asignadas || !Array.isArray(member.cuotas_asignadas)) {
                const currentCuotas = this.getMemberCuotas(ci);
                member.cuotas_asignadas = currentCuotas.map(c => ({
                    id: c.id,
                    cuota_id: c.cuota_id || c.id,
                    title: c.title,
                    monto: c.monto,
                    asignada: true,
                    is_cobro_unico: !!c.is_cobro_unico
                }));
            }

            const existingIdx = member.cuotas_asignadas.findIndex(ca => ca.id === cobroId);
            if (existingIdx !== -1) {
                member.cuotas_asignadas[existingIdx] = { ...itemCobro };
            } else {
                member.cuotas_asignadas.push({ ...itemCobro });
            }
            countAssigned++;

            if (window.DBService && window.DBService.isCloudActive) {
                window.DBService.saveFraterno(member, false).catch(err => console.warn(err));
            }
        });

        this.saveState();
        return { countAssigned, cobro: itemCobro, targetCIs };
    }

    batchUpdateCuotas(targetCIs, action, options = {}) {
        if (!Array.isArray(targetCIs) || targetCIs.length === 0) {
            throw new Error('Debe seleccionar al menos un fraterno para la operación en lote');
        }

        const cuotaId = options.cuotaId;
        const catalogCuota = cuotaId ? this.getCuotaById(cuotaId) : null;
        if (!catalogCuota) {
            throw new Error('Debe seleccionar una cuota válida del catálogo');
        }
        let modifiedCount = 0;

        targetCIs.forEach(ci => {
            const member = this.getMemberByCI(ci);
            if (!member) return;

            if (!member.cuotas_asignadas || !Array.isArray(member.cuotas_asignadas)) {
                const currentCuotas = this.getMemberCuotas(ci);
                member.cuotas_asignadas = currentCuotas.map(c => ({
                    id: c.id,
                    cuota_id: c.cuota_id || c.id,
                    title: c.title,
                    monto: c.monto,
                    asignada: true,
                    is_cobro_unico: !!c.is_cobro_unico
                }));
            }

            if (action === 'assign_cuota' && catalogCuota) {
                const idx = member.cuotas_asignadas.findIndex(ca => ca.id === cuotaId || ca.cuota_id === cuotaId);
                if (idx !== -1) {
                    member.cuotas_asignadas[idx].asignada = true;
                    if (options.monto !== undefined) member.cuotas_asignadas[idx].monto = parseFloat(options.monto) || catalogCuota.monto;
                } else {
                    member.cuotas_asignadas.push({
                        id: catalogCuota.id,
                        cuota_id: catalogCuota.id,
                        title: catalogCuota.title,
                        monto: options.monto !== undefined ? (parseFloat(options.monto) || catalogCuota.monto) : catalogCuota.monto,
                        asignada: true,
                        is_cobro_unico: false
                    });
                }
                modifiedCount++;
            } else if (action === 'unassign_cuota' && cuotaId) {
                const idx = member.cuotas_asignadas.findIndex(ca => ca.id === cuotaId || ca.cuota_id === cuotaId);
                if (idx !== -1) {
                    member.cuotas_asignadas[idx].asignada = false;
                    if (options.motivo) member.cuotas_asignadas[idx].motivo_exencion = options.motivo;
                } else if (catalogCuota) {
                    member.cuotas_asignadas.push({
                        id: catalogCuota.id,
                        cuota_id: catalogCuota.id,
                        title: catalogCuota.title,
                        monto: catalogCuota.monto,
                        asignada: false,
                        is_cobro_unico: false,
                        motivo_exencion: options.motivo || 'Exoneración autorizada por Mesa Directiva'
                    });
                }
                modifiedCount++;
            } else if (action === 'adjust_monto' && cuotaId) {
                const newMonto = parseFloat(options.monto);
                if (isNaN(newMonto) || newMonto < 0) throw new Error('El monto ajustado debe ser mayor o igual a 0');
                const idx = member.cuotas_asignadas.findIndex(ca => ca.id === cuotaId || ca.cuota_id === cuotaId);
                if (idx !== -1) {
                    member.cuotas_asignadas[idx].monto = newMonto;
                    member.cuotas_asignadas[idx].asignada = true;
                } else if (catalogCuota) {
                    member.cuotas_asignadas.push({
                        id: catalogCuota.id,
                        cuota_id: catalogCuota.id,
                        title: catalogCuota.title,
                        monto: newMonto,
                        asignada: true,
                        is_cobro_unico: false
                    });
                }
                modifiedCount++;
            }

            if (window.DBService && window.DBService.isCloudActive) {
                window.DBService.saveFraterno(member, false).catch(err => console.warn(err));
            }
        });

        this.saveState();
        return { modifiedCount };
    }

    getMemberFinancialStatus(ci) {
        const member = this.getMemberByCI(ci);
        if (!member) return null;

        const cuotas = this.getMemberCuotas(ci);
        const pagos = member.pagos || [];
        const pendingVouchers = member.vouchers_pendientes || [];

        let totalExigido = 0;
        const cuotasStatus = cuotas.map(c => {
            const isOblig = c.obligatorio !== false;
            if (isOblig) totalExigido += parseFloat(c.monto) || 0;

            const pagosEsta = pagos.filter(p => p.cuota_id === c.id || p.cuota_id === c.cuota_id);
            const pagado = pagosEsta.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
            const pendiente = Math.max(0, (parseFloat(c.monto) || 0) - pagado);
            const voucherPend = pendingVouchers.find(v => v.cuota_id === c.id || v.cuota_id === c.cuota_id);

            return {
                ...c,
                pagado,
                saldo_pendiente: pendiente,
                al_dia: pendiente === 0,
                voucher_pendiente: voucherPend || null
            };
        });

        const totalPagado = pagos.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
        const saldoPendiente = cuotasStatus.reduce((sum, c) => sum + (c.obligatorio !== false ? c.saldo_pendiente : 0), 0);
        const montoCubierto = Math.max(0, totalExigido - saldoPendiente);
        const porcentajePago = totalExigido > 0 ? Math.min(100, Math.round((montoCubierto / totalExigido) * 100)) : 100;

        return {
            ci: member.ci,
            nombres: member.nombres,
            apellidos: member.apellidos,
            filial_id: member.filial_id || 'matriz_lp',
            filial_nombre: member.filial_nombre || 'Matriz (La Paz)',
            rol_fraternal: member.rol_fraternal,
            totalExigido,
            totalPagado,
            saldoPendiente,
            porcentajePago,
            alDia: saldoPendiente === 0,
            hasPendingVouchers: pendingVouchers.length > 0,
            pendingVouchersCount: pendingVouchers.length,
            cuotas: cuotasStatus
        };
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
        let totalProyectado = 0;
        let fraternosAlDia = 0;
        let fraternosConSaldo = 0;

        const filialesConfig = this.getFiliales();
        const filialesMap = {};
        filialesConfig.forEach(f => {
            filialesMap[f.id] = {
                id: f.id,
                name: f.name,
                color: '#7c3aed',
                total_miembros: 0,
                recaudado: 0,
                proyectado: 0,
                al_dia: 0,
                con_saldo: 0
            };
        });

        members.forEach(m => {
            const fId = m.filial_id || 'matriz_lp';
            if (!filialesMap[fId]) {
                filialesMap[fId] = {
                    id: fId,
                    name: m.filial_nombre || fId,
                    color: '#7c3aed',
                    total_miembros: 0,
                    recaudado: 0,
                    proyectado: 0,
                    al_dia: 0,
                    con_saldo: 0
                };
            }

            const mPagos = m.pagos || [];
            const pagado = mPagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
            
            const memberCuotas = this.getMemberCuotas(m.ci);
            const hasCustomCuotas = Array.isArray(m.cuotas_asignadas);
            const memberExigido = memberCuotas.reduce((acc, c) => acc + (c.obligatorio !== false ? (parseFloat(c.monto) || 0) : 0), 0);
            const requiredAmount = hasCustomCuotas ? memberExigido : cuotaTotalIndividual;

            totalRecaudado += pagado;
            totalProyectado += requiredAmount;
            filialesMap[fId].total_miembros++;
            filialesMap[fId].recaudado += pagado;
            filialesMap[fId].proyectado += requiredAmount;

            if (pagado >= requiredAmount) {
                fraternosAlDia++;
                filialesMap[fId].al_dia++;
            } else {
                fraternosConSaldo++;
                filialesMap[fId].con_saldo++;
            }
        });

        const pendingVouchers = this.getPendingVouchers();
        const pendingMonto = pendingVouchers.reduce((acc, v) => acc + (parseFloat(v.monto) || 0), 0);

        const porFilial = Object.values(filialesMap).map(f => ({
            ...f,
            porcentaje: f.proyectado > 0 ? Math.round((f.recaudado / f.proyectado) * 100) : 100
        }));

        return {
            totalRecaudado,
            totalProyectado,
            cuotaTotalIndividual,
            fraternosAlDia,
            fraternosConSaldo,
            pendingVouchersCount: pendingVouchers.length,
            pendingVouchersMonto: pendingMonto,
            porFilial,
            porBloque: []
        };
    }

    getBloques() {
        return (this.state && Array.isArray(this.state.bloques))
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
                    recaudado: 0
                };
            }
            filialesMap[fId].total_miembros++;
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
