/**
 * MÓDULO DE ASISTENCIAS Y ESCÁNER QR - TINKUS WISTUS 2026
 * Entrada Universitaria La Paz 2026 - Fraternidad Tinkus Wistus
 * 
 * Funcionalidades completas:
 * 1. Generación de QR automático basado en CI / Carnet.
 * 2. Gestión de Punto de Asistencia y Evento Activo por Directiva.
 * 3. Escáner QR con cámara en vivo (html5-qrcode), audio sintetizado y validación anti-duplicados.
 * 4. Tablero de Gestión Directiva con KPIs, filtros por bloque/estado y acciones por lote.
 * 5. Vista de Asistencia Fraterno con estado de habilitación para Entrada Universitaria (mínimo 80%).
 */

class AsistenciasManager {
    constructor() {
        this.currentEventId = 'ev_4'; // Evento activo por defecto
        this.selectedBlockFilter = 'all';
        this.selectedStatusFilter = 'all';
        this.recentCheckins = [];
        this.html5QrScanner = null;
        this.isCameraScanning = false;
        this.currentCameraFacing = 'environment';
        this.soundEnabled = true;
        this.audioCtx = null;
    }

    init() {
        // Escuchar cambios de estado reactivos
        window.PortalState.subscribe(() => {
            const session = window.PortalState.getSession();
            if (session) {
                if (session.role === 'miembro') this.renderMemberAttendances();
                if (session.role === 'control') this.renderControlAttendances();
            }
        });

        // Asegurar que el evento actual esté sincronizado
        const events = window.PortalState.getEvents();
        const activeEv = events.find(e => e.estado === 'activo');
        if (activeEv) {
            this.currentEventId = activeEv.id;
        } else if (events.length > 0) {
            this.currentEventId = events[0].id;
        }
    }

    // =========================================================================
    // AUDIO & FEEDBACK SINTETIZADO (WEB AUDIO API)
    // =========================================================================
    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    playFeedbackTone(type = 'success') {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            if (type === 'success') {
                // Tono doble armónico agudo y agradable (880Hz -> 1760Hz)
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(880, now);
                osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(1320, now);
                osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.15);

                gainNode.gain.setValueAtTime(0.25, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.25);
                osc2.stop(now + 0.25);
            } else if (type === 'warning' || type === 'duplicate') {
                // Tono de advertencia doble pulso (659Hz y 523Hz)
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now);
                osc.frequency.setValueAtTime(523.25, now + 0.12);

                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'error') {
                // Tono de error grave
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.25);
            }
        } catch (e) {
            console.warn('Audio feedback no disponible:', e);
        }
    }

    // =========================================================================
    // VISTA FRATERNO: MI HISTORIAL Y ESTADO DE ASISTENCIA
    // =========================================================================
    renderMemberAttendances() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        const events = window.PortalState.getEvents();
        const container = document.getElementById('memberAttendancesList');
        if (!container) return;

        let totalObligatorios = 0;
        let asistidos = 0;
        let atrasos = 0;
        let faltas = 0;
        let licencias = 0;

        let html = '';

        events.forEach(ev => {
            if (ev.obligatorio) totalObligatorios++;
            const reg = (member.asistencias && member.asistencias[ev.id]) || { estado: 'pendiente' };

            let badgeClass = 'bg-secondary text-white';
            let badgeText = 'Pendiente';
            let iconClass = 'bi-hourglass-split';
            let horaInfo = '<span class="text-secondary small"><i class="bi bi-dash-circle me-1"></i>Convocatoria próxima</span>';

            if (reg.estado === 'presente') {
                asistidos++;
                badgeClass = 'bg-success text-white';
                badgeText = 'Presente';
                iconClass = 'bi-check-circle-fill';
                horaInfo = `<span class="text-success small fw-bold"><i class="bi bi-qr-code-scan me-1"></i>Marcado: ${reg.hora || '15:00'} ${reg.marcado_por ? '(' + reg.marcado_por + ')' : ''}</span>`;
            } else if (reg.estado === 'atraso') {
                atrasos++;
                badgeClass = 'chip-warning';
                badgeText = 'Atraso';
                iconClass = 'bi-clock-fill';
                horaInfo = `<span class="text-amber small fw-bold"><i class="bi bi-clock-history me-1"></i>Ingreso con atraso: ${reg.hora || '16:15'}</span>`;
            } else if (reg.estado === 'licencia') {
                licencias++;
                badgeClass = 'bg-info text-dark';
                badgeText = 'Licencia';
                iconClass = 'bi-file-earmark-text-fill';
                horaInfo = `<span class="text-info small fw-bold"><i class="bi bi-shield-check me-1"></i>Licencia autorizada por Directiva</span>`;
            } else if (reg.estado === 'falta') {
                faltas++;
                badgeClass = 'bg-danger text-white';
                badgeText = 'Falta';
                iconClass = 'bi-x-circle-fill';
                horaInfo = `<span class="text-danger small fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i>Inasistencia no justificada</span>`;
            }

            html += `
            <div class="card bg-surface-1 border border-subtle rounded-4 p-3 mb-3 shadow-sm hover-scale-sm">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span class="badge ${badgeClass} px-3 py-1 rounded-pill text-uppercase fw-bold">
                                <i class="bi ${iconClass} me-1"></i>${badgeText}
                            </span>
                            <span class="badge bg-surface-2 text-brand border border-subtle rounded-pill">${ev.tipo}</span>
                            ${ev.obligatorio ? '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 rounded-pill">Obligatorio Entrada</span>' : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25 rounded-pill">Opcional</span>'}
                        </div>
                        <h6 class="fw-bold mb-1 text-dark fs-6">${ev.title}</h6>
                        <div class="text-secondary small mb-1">
                            <i class="bi bi-calendar-event text-brand me-1"></i>${ev.fecha} &bull; <i class="bi bi-clock me-1 text-secondary"></i>${ev.hora}
                        </div>
                        <div class="text-secondary small">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i><strong>Punto:</strong> ${ev.lugar}
                        </div>
                        ${ev.responsable ? `<div class="text-muted small mt-1"><i class="bi bi-person-badge text-brand me-1"></i>Control: ${ev.responsable}</div>` : ''}
                    </div>
                    <div class="text-end min-w-150">
                        ${horaInfo}
                        <div class="mt-2">
                            <button class="btn btn-outline-brand btn-sm rounded-pill px-3" onclick="window.PortalApp.showView('member-credencial')">
                                <i class="bi bi-qr-code me-1"></i> Mi Carnet QR
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        container.innerHTML = html;

        // Cálculo de porcentaje para habilitación (Entrada Universitaria La Paz)
        const puntajeEfectivo = asistidos + (atrasos * 0.7) + (licencias * 0.9);
        const porcentaje = totalObligatorios > 0 ? Math.min(100, Math.round((puntajeEfectivo / totalObligatorios) * 100)) : 100;

        // Elementos de resumen del fraterno
        const elPorcentaje = document.getElementById('memberAttendancePct');
        const elProgressBar = document.getElementById('memberAttendanceProgressBar');
        const elHabilitacion = document.getElementById('memberHabilitacionStatus');

        if (elPorcentaje) elPorcentaje.textContent = `${porcentaje}%`;
        if (elProgressBar) {
            elProgressBar.style.width = `${porcentaje}%`;
            elProgressBar.className = `progress-bar progress-bar-striped progress-bar-animated ${porcentaje >= 80 ? 'bg-success' : (porcentaje >= 60 ? 'bg-brand' : 'bg-danger')}`;
        }
        if (elHabilitacion) {
            if (porcentaje >= 80) {
                elHabilitacion.innerHTML = `
                    <div class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                        <i class="bi bi-shield-fill-check fs-6"></i>
                        <span class="fw-bold">HABILITADO PARA ENTRADA UNIVERSITARIA 2026</span>
                    </div>`;
            } else if (porcentaje >= 60) {
                elHabilitacion.innerHTML = `
                    <div class="chip-warning px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                        <i class="bi bi-exclamation-triangle-fill fs-6"></i>
                        <span class="fw-bold">EN OBSERVACIÓN (REQUIERE ASISTIR A PRÓXIMOS ENSAYOS)</span>
                    </div>`;
            } else {
                elHabilitacion.innerHTML = `
                    <div class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                        <i class="bi bi-x-octagon-fill fs-6"></i>
                        <span class="fw-bold">INHABILITADO (ASISTENCIA INFERIOR AL 60%)</span>
                    </div>`;
            }
        }

        const elStatsCount = document.getElementById('memberAttendanceCounts');
        if (elStatsCount) {
            elStatsCount.innerHTML = `
                <span class="text-success fw-bold me-3"><i class="bi bi-check-circle-fill me-1"></i>${asistidos} Presentes</span>
                <span class="text-amber fw-bold me-3"><i class="bi bi-clock-fill me-1"></i>${atrasos} Atrasos</span>
                <span class="text-danger fw-bold me-3"><i class="bi bi-x-circle-fill me-1"></i>${faltas} Faltas</span>
                <span class="text-info fw-bold"><i class="bi bi-file-earmark-text-fill me-1"></i>${licencias} Licencias</span>
            `;
        }
    }

    // =========================================================================
    // VISTA CONTROL / DIRECTIVA: TABLERO DE GESTIÓN Y TERMINAL QR
    // =========================================================================
    setActiveEvent(eventId) {
        this.currentEventId = eventId;
        const ev = window.PortalState.getEventById(eventId);
        if (ev && ev.estado !== 'activo') {
            window.PortalState.updateEvent(eventId, { estado: 'activo' });
        }
        this.renderControlAttendances();
        window.PortalApp.showToast(`Punto de Asistencia activo establecido: "${ev ? ev.title : eventId}"`, 'success');
        window.PortalApp.showView('control-asistencias');
    }

    renderControlAttendances() {
        const events = window.PortalState.getEvents();
        const selectEvent = document.getElementById('selectControlEvent');
        if (selectEvent) {
            selectEvent.innerHTML = events.map(ev => 
                `<option value="${ev.id}" ${ev.id === this.currentEventId ? 'selected' : ''}>${ev.estado === 'activo' ? '🔴 [ACTIVO HOY] ' : ''}${ev.title} (${ev.fecha})</option>`
            ).join('');
            selectEvent.onchange = (e) => {
                this.currentEventId = e.target.value;
                this.renderControlAttendances();
            };
        }

        const activeEvent = window.PortalState.getEventById(this.currentEventId) || events[0];

        // Renderizar banner informativo del Punto de Asistencia Activo
        const activeBanner = document.getElementById('controlActivePointBanner');
        if (activeBanner && activeEvent) {
            activeBanner.innerHTML = `
                <div class="card bg-surface-1 border border-brand rounded-4 p-3 mb-3 shadow-sm">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge ${activeEvent.estado === 'activo' ? 'bg-success animate__animated animate__pulse animate__infinite' : 'bg-secondary'} px-3 py-1 rounded-pill">
                                    <i class="bi bi-broadcast me-1"></i>${activeEvent.estado === 'activo' ? 'PUNTO DE ASISTENCIA ACTIVO' : 'CONVOCATORIA: ' + activeEvent.estado.toUpperCase()}
                                </span>
                                <span class="badge bg-surface-2 text-brand border border-subtle rounded-pill">${activeEvent.tipo}</span>
                            </div>
                            <h5 class="fw-bold text-dark mb-1">${activeEvent.title}</h5>
                            <div class="text-secondary small">
                                <i class="bi bi-geo-alt-fill text-danger me-1"></i><strong>Lugar:</strong> ${activeEvent.lugar} &nbsp;|&nbsp;
                                <i class="bi bi-calendar3 text-brand me-1"></i>${activeEvent.fecha} (${activeEvent.hora}) &nbsp;|&nbsp;
                                <i class="bi bi-person-badge text-primary me-1"></i><strong>Responsable:</strong> ${activeEvent.responsable || 'Directiva'}
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-outline-brand btn-sm rounded-pill px-3" onclick="window.PortalApp.openEventModal('${activeEvent.id}')">
                                <i class="bi bi-pencil me-1"></i> Editar Punto
                            </button>
                            <button class="btn btn-brand btn-sm rounded-pill px-3" onclick="window.PortalApp.openEventModal()">
                                <i class="bi bi-plus-lg me-1"></i> Nuevo Evento
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Estadísticas del evento actual
        const stats = window.PortalState.getEventAttendanceStats(this.currentEventId);
        const elStats = document.getElementById('controlEventStatsBar');
        if (elStats) {
            elStats.innerHTML = `
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-subtle p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-secondary text-uppercase fw-semibold">Padrón</div>
                        <div class="fs-4 fw-bold text-dark">${stats.total}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-success border-opacity-50 p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-success text-uppercase fw-semibold">Presentes</div>
                        <div class="fs-4 fw-bold text-success">${stats.presentes}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-amber border-opacity-50 p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-amber text-uppercase fw-semibold">Atrasos</div>
                        <div class="fs-4 fw-bold text-amber">${stats.atrasos}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-danger border-opacity-50 p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-danger text-uppercase fw-semibold">Faltas</div>
                        <div class="fs-4 fw-bold text-danger">${stats.faltas}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-info border-opacity-50 p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-info text-uppercase fw-semibold">Licencias</div>
                        <div class="fs-4 fw-bold text-info">${stats.licencias}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-brand border-opacity-50 p-2 text-center rounded-3 shadow-sm">
                        <div class="small text-brand text-uppercase fw-semibold">% Efectivo</div>
                        <div class="fs-4 fw-bold text-brand">${stats.porcentajeEfectivo}%</div>
                    </div>
                </div>
            `;
        }

        // Renderizar desglose por bloque
        this.renderBlockBreakdown(stats);

        // Renderizar lista manual y selector
        this.renderManualPassList();
        this.populateScannerMemberSelect();
        this.renderRecentCheckins();
    }

    renderBlockBreakdown(stats) {
        const container = document.getElementById('controlBlockAttendanceBars');
        if (!container || !stats.blockBreakdown) return;

        const blocks = Object.values(stats.blockBreakdown);
        let html = '';
        blocks.forEach(b => {
            const marked = b.presentes + b.atrasos + b.licencias;
            const pct = b.total > 0 ? Math.round((marked / b.total) * 100) : 0;
            html += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between align-items-center small mb-1">
                        <span class="fw-semibold text-dark">${b.name}</span>
                        <span class="text-secondary">${marked}/${b.total} fraternos (${pct}%)</span>
                    </div>
                    <div class="progress" style="height: 6px; background: #e2e8f0;">
                        <div class="progress-bar ${pct >= 75 ? 'bg-success' : (pct >= 50 ? 'bg-brand' : 'bg-amber')}" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderManualPassList() {
        const container = document.getElementById('controlManualPassTableBody');
        if (!container) return;

        const members = window.PortalState.getMembers();
        const searchInput = document.getElementById('searchManualPassMember');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const filtered = members.filter(m => {
            const matchesSearch = !searchTerm || 
                m.ci.includes(searchTerm) || 
                `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchTerm) ||
                m.bloque_nombre.toLowerCase().includes(searchTerm);
            
            const matchesBlock = this.selectedBlockFilter === 'all' || m.bloque_id === this.selectedBlockFilter;

            const reg = (m.asistencias && m.asistencias[this.currentEventId]) || { estado: 'pendiente' };
            const status = reg.estado || 'pendiente';
            const matchesStatus = this.selectedStatusFilter === 'all' || status === this.selectedStatusFilter;

            return matchesSearch && matchesBlock && matchesStatus;
        });

        let html = '';
        filtered.forEach(m => {
            const reg = (m.asistencias && m.asistencias[this.currentEventId]) || { estado: 'pendiente' };

            html += `
            <tr class="align-middle">
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${m.foto || 'assets/img/avatar-default.svg'}" class="rounded-circle border border-brand" width="36" height="36" alt="Avatar">
                        <div>
                            <div class="fw-bold text-dark">${m.nombres} ${m.apellidos}</div>
                            <div class="small text-secondary">
                                CI: <span class="text-brand fw-semibold font-mono">${m.ci} ${m.ci_exp || 'LP'}</span> &bull; ${m.rol_fraternal}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-surface-2 border border-subtle text-primary fw-semibold">${m.bloque_nombre}</span>
                </td>
                <td>
                    ${this.getStatusBadgeHtml(reg.estado)}
                    ${reg.hora ? `<div class="small text-muted font-mono"><i class="bi bi-clock me-1"></i>${reg.hora}</div>` : ''}
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn ${reg.estado === 'presente' ? 'btn-success text-white' : 'btn-outline-success'}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'presente')" title="Marcar Presente">
                            <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn ${reg.estado === 'atraso' ? 'btn-warning text-dark' : 'btn-outline-warning'}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'atraso')" title="Marcar Atraso">
                            <i class="bi bi-clock"></i>
                        </button>
                        <button class="btn ${reg.estado === 'licencia' ? 'btn-info text-dark' : 'btn-outline-info'}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'licencia')" title="Marcar Licencia">
                            <i class="bi bi-file-text"></i>
                        </button>
                        <button class="btn ${reg.estado === 'falta' ? 'btn-danger text-white' : 'btn-outline-danger'}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'falta')" title="Marcar Falta">
                            <i class="bi bi-x-lg"></i>
                        </button>
                        ${reg.estado && reg.estado !== 'pendiente' ? `
                        <button class="btn btn-outline-secondary" onclick="window.Asistencias.clearQuick('${m.ci}')" title="Desmarcar / Limpiar">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>`;
        });

        if (filtered.length === 0) {
            html = '<tr><td colspan="4" class="text-center py-4 text-muted">No se encontraron fraternos con el filtro seleccionado.</td></tr>';
        }

        container.innerHTML = html;

        // Actualizar contador del filtro
        const countEl = document.getElementById('controlFilterResultCount');
        if (countEl) countEl.textContent = `${filtered.length} fraternos listados`;
    }

    getStatusBadgeHtml(estado) {
        switch (estado) {
            case 'presente':
                return '<span class="badge bg-success text-white"><i class="bi bi-check-circle-fill me-1"></i>Presente</span>';
            case 'atraso':
                return '<span class="chip-warning"><i class="bi bi-clock-fill me-1"></i>Atraso</span>';
            case 'licencia':
                return '<span class="badge bg-info text-dark"><i class="bi bi-file-text-fill me-1"></i>Licencia</span>';
            case 'falta':
                return '<span class="badge bg-danger text-white"><i class="bi bi-x-circle-fill me-1"></i>Falta</span>';
            default:
                return '<span class="badge bg-secondary text-white-50"><i class="bi bi-dash me-1"></i>Pendiente</span>';
        }
    }

    markQuick(ci, estado) {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(25);
        this.playFeedbackTone('success');
        window.PortalState.markAttendance(ci, this.currentEventId, estado, 'Control Manual Directiva');
        this.renderControlAttendances();
        window.PortalApp.showToast(`Asistencia de ${ci} actualizada a: ${estado.toUpperCase()}`, 'success');
    }

    clearQuick(ci) {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
        window.PortalState.clearAttendance(ci, this.currentEventId);
        this.renderControlAttendances();
        window.PortalApp.showToast(`Registro de asistencia reseteado para CI ${ci}`, 'info');
    }

    // =========================================================================
    // ACCIONES POR LOTE (BULK ACTIONS)
    // =========================================================================
    markAllPendingAsFalta() {
        if (!confirm('¿Desea marcar a todos los fraternos que NO registraron asistencia como FALTA en este evento?')) return;
        const count = window.PortalState.markAllPendingAsFalta(this.currentEventId);
        this.renderControlAttendances();
        window.PortalApp.showToast(`Se marcaron ${count} inasistencias (faltas) por cierre de lista.`, 'info');
    }

    markBlockAsPresent(bloqueId) {
        const count = window.PortalState.markBlockAttendance(this.currentEventId, bloqueId, 'presente', 'Directiva de Bloque');
        this.renderControlAttendances();
        window.PortalApp.showToast(`Se registraron ${count} asistencias para el bloque seleccionado.`, 'success');
    }

    exportAttendanceCSV() {
        const members = window.PortalState.getMembers();
        const ev = window.PortalState.getEventById(this.currentEventId);
        const evTitle = ev ? ev.title : 'Evento';

        let csv = `LISTA DE ASISTENCIA OFICIAL - TINKUS WISTUS 2026\n`;
        csv += `Evento:,"${evTitle}"\n`;
        csv += `Fecha:,"${ev ? ev.fecha : ''}"\n`;
        csv += `Lugar:,"${ev ? ev.lugar : ''}"\n\n`;
        csv += `CI,Expedido,Nombres,Apellidos,Bloque,Rol,Estado_Asistencia,Hora_Registro,Marcado_Por\n`;

        members.forEach(m => {
            const reg = (m.asistencias && m.asistencias[this.currentEventId]) || { estado: 'pendiente', hora: '', marcado_por: '' };
            csv += `"${m.ci}","${m.ci_exp || 'LP'}","${m.nombres}","${m.apellidos}","${m.bloque_nombre}","${m.rol_fraternal}","${reg.estado}","${reg.hora || ''}","${reg.marcado_por || ''}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `asistencia_${this.currentEventId}_tinkus_wistus.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.PortalApp.showToast('Planilla de asistencia descargada en formato CSV.');
    }

    // =========================================================================
    // ESCÁNER QR CON CÁMARA REAL Y DECODIFICADOR AUTOMÁTICO
    // =========================================================================
    populateScannerMemberSelect() {
        const sel = document.getElementById('selectScannerTestMember');
        if (!sel) return;
        const members = window.PortalState.getMembers();
        sel.innerHTML = '<option value="">-- Seleccionar fraterno para validar QR al instante --</option>' + 
            members.map(m => `<option value="${m.ci}">${m.nombres} ${m.apellidos} (CI: ${m.ci}) - ${m.bloque_nombre}</option>`).join('');
    }

    extractCIFromPayload(rawText) {
        if (!rawText) return null;
        const clean = String(rawText).trim();

        // 1. JSON payload: {"ci": "4839201", ...}
        if (clean.startsWith('{') && clean.endsWith('}')) {
            try {
                const parsed = JSON.parse(clean);
                if (parsed.ci) return String(parsed.ci).trim();
                if (parsed.carnet) return String(parsed.carnet).trim();
            } catch (e) {}
        }

        // 2. URL payload: https://.../verificar?ci=4839201
        if (clean.includes('ci=')) {
            const match = clean.match(/[?&]ci=([0-9]+)/i);
            if (match && match[1]) return match[1];
        }

        // 3. Prefijo WISTUS:4839201 o CI:4839201
        if (clean.includes(':')) {
            const parts = clean.split(':');
            const candidate = parts[parts.length - 1].replace(/[^0-9]/g, '');
            if (candidate.length >= 4) return candidate;
        }

        // 4. Cadena numérica directa (CI)
        const numericOnly = clean.replace(/[^0-9]/g, '');
        if (numericOnly.length >= 4 && numericOnly.length <= 12) {
            return numericOnly;
        }

        return clean;
    }

    async toggleCameraScanner() {
        if (this.isCameraScanning) {
            this.stopCameraScanner();
        } else {
            await this.startCameraScanner();
        }
    }

    async startCameraScanner() {
        const readerEl = document.getElementById('qrCameraReader');
        const startBtn = document.getElementById('btnToggleQrCamera');
        if (!readerEl) return;

        if (typeof Html5Qrcode === 'undefined') {
            window.PortalApp.showToast('Librería de escáner cargando...', 'info');
            return;
        }

        try {
            if (!this.html5QrScanner) {
                this.html5QrScanner = new Html5Qrcode('qrCameraReader');
            }

            const config = {
                fps: 15,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await this.html5QrScanner.start(
                { facingMode: this.currentCameraFacing },
                config,
                (decodedText) => {
                    this.handleDecodedQRCode(decodedText);
                },
                (errorMessage) => {
                    // Errores menores de parseo continuo ignorados
                }
            );

            this.isCameraScanning = true;
            if (startBtn) {
                startBtn.innerHTML = '<i class="bi bi-stop-circle-fill me-1 text-danger"></i> Detener Cámara';
                startBtn.className = 'btn btn-danger btn-sm rounded-pill px-3';
            }
            readerEl.classList.remove('d-none');
            const guide = document.getElementById('scannerCameraGuide');
            if (guide) guide.classList.remove('d-none');

            window.PortalApp.showToast('Cámara iniciada. Apunte al código QR del carnet.', 'info');
        } catch (err) {
            console.error('Error al iniciar cámara:', err);
            this.isCameraScanning = false;
            window.PortalApp.showToast('No se pudo acceder a la cámara. Verifique permisos o use el selector rápido.', 'warning');
        }
    }

    async stopCameraScanner() {
        if (this.html5QrScanner && this.isCameraScanning) {
            try {
                await this.html5QrScanner.stop();
            } catch (e) {
                console.warn('Error al detener cámara:', e);
            }
            this.isCameraScanning = false;
        }

        const startBtn = document.getElementById('btnToggleQrCamera');
        if (startBtn) {
            startBtn.innerHTML = '<i class="bi bi-camera-video me-1"></i> Iniciar Escáner con Cámara';
            startBtn.className = 'btn btn-portal-primary btn-sm rounded-pill px-3';
        }

        const guide = document.getElementById('scannerCameraGuide');
        if (guide) guide.classList.add('d-none');
    }

    async switchCameraFacing() {
        this.currentCameraFacing = this.currentCameraFacing === 'environment' ? 'user' : 'environment';
        if (this.isCameraScanning) {
            await this.stopCameraScanner();
            await this.startCameraScanner();
        }
    }

    scanQRFromFile(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (typeof Html5Qrcode === 'undefined') {
            window.PortalApp.showToast('Librería QR no lista', 'warning');
            return;
        }

        const html5QrCode = new Html5Qrcode('qrCameraReader');
        html5QrCode.scanFile(file, true)
            .then(decodedText => {
                this.handleDecodedQRCode(decodedText);
            })
            .catch(err => {
                this.playFeedbackTone('error');
                window.PortalApp.showToast('No se detectó un código QR válido en la imagen seleccionada.', 'danger');
            });
    }

    handleDecodedQRCode(decodedText) {
        const extractedCI = this.extractCIFromPayload(decodedText);
        if (!extractedCI) {
            this.playFeedbackTone('error');
            window.PortalApp.showToast('Formato de QR no reconocido.', 'danger');
            return;
        }

        this.processAttendanceScan(extractedCI);
    }

    simulateQRScan(ciInput) {
        const ci = ciInput || document.getElementById('selectScannerTestMember').value;
        if (!ci) {
            window.PortalApp.showToast('Seleccione un fraterno o ingrese un número de CI para validar.', 'warning');
            return;
        }
        this.processAttendanceScan(ci);
    }

    processAttendanceScan(ci) {
        const member = window.PortalState.getMemberByCI(ci);
        if (!member) {
            this.playFeedbackTone('error');
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
            window.PortalApp.showToast(`Código QR no reconocido: El CI ${ci} no existe en el Padrón Oficial 2026.`, 'danger');
            return;
        }

        const activeEvent = window.PortalState.getEventById(this.currentEventId);
        const eventTitle = activeEvent ? activeEvent.title : 'Evento';
        const eventLugar = activeEvent ? activeEvent.lugar : 'Punto Oficial Tinkus Wistus';

        // Comprobar si ya estaba registrado
        const prevReg = (member.asistencias && member.asistencias[this.currentEventId]);
        const alreadyRegistered = !!(prevReg && prevReg.estado && prevReg.estado !== 'pendiente');

        let targetStatus = 'presente';
        const now = new Date();
        const horaMarcada = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

        // Marcar la asistencia en el estado reactivo
        window.PortalState.markAttendance(member.ci, this.currentEventId, targetStatus, 'Terminal QR Directiva', {
            lugar: eventLugar,
            hora: horaMarcada
        });

        // Registrar en feed de marcajes recientes
        this.recentCheckins.unshift({
            ci: member.ci,
            nombre: `${member.nombres} ${member.apellidos}`,
            foto: member.foto || 'assets/img/avatar-default.svg',
            bloque: member.bloque_nombre,
            hora: horaMarcada,
            estado: targetStatus,
            ya_estaba: alreadyRegistered
        });
        if (this.recentCheckins.length > 15) this.recentCheckins.pop();

        // Feedback sonoro y háptico
        if (alreadyRegistered) {
            this.playFeedbackTone('warning');
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 80, 50]);
        } else {
            this.playFeedbackTone('success');
            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([40, 60, 40]);
        }

        // Mostrar Ficha de Confirmación en la Terminal
        this.displayScannerResultCard(member, targetStatus, horaMarcada, eventTitle, eventLugar, alreadyRegistered);

        // Actualizar vistas
        this.renderControlAttendances();

        if (alreadyRegistered) {
            window.PortalApp.showToast(`¡Fraterno ${member.nombres} ya tenía registro previo! Hora actualizada a ${horaMarcada}.`, 'warning');
        } else {
            window.PortalApp.showToast(`¡QR VALIDADO! Asistencia registrada para ${member.nombres} ${member.apellidos}`, 'success');
        }
    }

    displayScannerResultCard(member, estado, hora, evento, lugar, yaEstaba) {
        const resultCard = document.getElementById('scannerResultCard');
        if (!resultCard) return;

        resultCard.classList.remove('d-none');
        resultCard.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => resultCard.classList.remove('animate__animated', 'animate__fadeIn'), 600);

        // Foto y datos principales
        const imgFoto = document.getElementById('scanResFoto');
        if (imgFoto) imgFoto.src = member.foto || 'assets/img/avatar-default.svg';

        const txtNombre = document.getElementById('scanResNombre');
        if (txtNombre) txtNombre.textContent = `${member.nombres} ${member.apellidos}`;

        const txtCI = document.getElementById('scanResCI');
        if (txtCI) txtCI.textContent = `CI: ${member.ci} ${member.ci_exp || 'LP'}`;

        const txtBloque = document.getElementById('scanResBloque');
        if (txtBloque) txtBloque.textContent = `${member.bloque_nombre} • ${member.rol_fraternal}`;

        const txtHora = document.getElementById('scanResHora');
        if (txtHora) txtHora.textContent = `${hora}`;

        const txtEvento = document.getElementById('scanResEvento');
        if (txtEvento) txtEvento.textContent = `${evento} (${lugar})`;

        // Banner de estado
        const badgeEstado = document.getElementById('scanResBadgeEstado');
        if (badgeEstado) {
            if (yaEstaba) {
                badgeEstado.innerHTML = `<span class="chip-warning px-3 py-1 rounded-pill"><i class="bi bi-clock-history me-1"></i> REGISTRO ACTUALIZADO</span>`;
            } else {
                badgeEstado.innerHTML = `<span class="badge bg-success text-white px-3 py-1 rounded-pill"><i class="bi bi-check2-circle me-1"></i> ¡ASISTENCIA REGISTRADA!</span>`;
            }
        }

        // Estado Financiero / Cuotas
        const cuotasStatusEl = document.getElementById('scanResCuotas');
        if (cuotasStatusEl) {
            const pagosCount = (member.pagos || []).length;
            const cuotasTotal = (DEFAULT_PORTAL_CONFIG.cuotas_definidas || []).length;
            if (pagosCount >= cuotasTotal) {
                cuotasStatusEl.innerHTML = '<span class="badge bg-success"><i class="bi bi-shield-check me-1"></i>Cuotas al Día (100%)</span>';
            } else if (pagosCount > 0) {
                cuotasStatusEl.innerHTML = `<span class="chip-warning"><i class="bi bi-hourglass-split me-1"></i>${pagosCount}/${cuotasTotal} Cuotas Canceladas</span>`;
            } else {
                cuotasStatusEl.innerHTML = '<span class="badge bg-danger text-white"><i class="bi bi-exclamation-circle me-1"></i>Sin Pagos Registrados</span>';
            }
        }

        // Botones de cambio rápido en la tarjeta de resultado
        const quickActionsEl = document.getElementById('scanResQuickActions');
        if (quickActionsEl) {
            quickActionsEl.innerHTML = `
                <div class="btn-group btn-group-sm w-100 mt-2">
                    <button class="btn btn-outline-success ${estado === 'presente' ? 'active' : ''}" onclick="window.Asistencias.markQuick('${member.ci}', 'presente')">
                        <i class="bi bi-check-lg me-1"></i>Presente
                    </button>
                    <button class="btn btn-outline-warning ${estado === 'atraso' ? 'active' : ''}" onclick="window.Asistencias.markQuick('${member.ci}', 'atraso')">
                        <i class="bi bi-clock me-1"></i>Atraso
                    </button>
                    <button class="btn btn-outline-info ${estado === 'licencia' ? 'active' : ''}" onclick="window.Asistencias.markQuick('${member.ci}', 'licencia')">
                        <i class="bi bi-file-text me-1"></i>Licencia
                    </button>
                    <button class="btn btn-outline-danger ${estado === 'falta' ? 'active' : ''}" onclick="window.Asistencias.markQuick('${member.ci}', 'falta')">
                        <i class="bi bi-x-lg me-1"></i>Falta
                    </button>
                </div>
            `;
        }
    }

    renderRecentCheckins() {
        const feedContainer = document.getElementById('scannerRecentFeedList');
        if (!feedContainer) return;

        if (this.recentCheckins.length === 0) {
            feedContainer.innerHTML = '<div class="text-muted text-center py-3 small">Esperando escaneos de credenciales QR...</div>';
            return;
        }

        let html = '';
        this.recentCheckins.forEach(item => {
            html += `
                <div class="d-flex align-items-center justify-content-between p-2 border-bottom border-subtle">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${item.foto}" width="30" height="30" class="rounded-circle border border-brand" alt="Foto">
                        <div>
                            <div class="fw-bold text-dark small">${item.nombre}</div>
                            <div class="text-secondary" style="font-size: 0.72rem;">CI: ${item.ci} &bull; ${item.bloque}</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <span class="badge ${item.estado === 'presente' ? 'bg-success' : 'chip-warning'} text-white" style="font-size: 0.7rem;">${item.estado.toUpperCase()}</span>
                        <div class="text-secondary font-mono" style="font-size: 0.7rem;">${item.hora}</div>
                    </div>
                </div>
            `;
        });
        feedContainer.innerHTML = html;
    }
}

window.Asistencias = new AsistenciasManager();
