/**
 * MÓDULO DE ASISTENCIAS Y ESCÁNER QR - TINKUS WISTUS
 * Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus
 * 
 * Funcionalidades completas:
 * 1. Generación de QR automático basado en CI / Carnet.
 * 2. Gestión de Punto de Asistencia y Evento Activo por Directiva.
 * 3. Escáner QR con cámara en vivo (html5-qrcode), audio sintetizado y validación anti-duplicados.
 * 4. Tablero de Gestión Directiva con KPIs, filtros por bloque/estado y acciones por lote.
 * 5. Vista de Asistencia Fraterno con estado de habilitación para Carnaval de Oruro 2027 (mínimo 80%).
 */

class AsistenciasManager {
    constructor() {
        this.currentEventId = 'ev_4'; // Evento activo por defecto
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.selectedBlockFilter = 'all';
        this.selectedStatusFilter = 'all';
        this.recentCheckins = [];
        this.html5QrScanner = null;
        this.isCameraScanning = false;
        this.isPausedForConfirmation = false;
        this.autoAdvanceEnabled = true;
        this.countdownTimer = null;
        this.countdownSeconds = 3;
        this.currentScannedCI = null;
        this.modalInstance = null;
        this.currentCameraFacing = 'environment';
        this.soundEnabled = true;
        this.audioCtx = null;
    }

    init() {
        // Inicializar fecha seleccionada
        const today = new Date().toISOString().split('T')[0];
        this.selectedDate = today;

        // Escuchar cambios de estado reactivos
        window.PortalState.subscribe(() => {
            const session = window.PortalState.getSession();
            if (session) {
                if (session.role === 'miembro') this.renderMemberAttendances();
                if (session.role === 'control') this.renderControlAttendances();
            }
        });

        // Asegurar que el evento actual esté sincronizado automáticamente
        this.syncInitialEvent();
        this.bindKeyboardShortcuts();
    }

    syncInitialEvent() {
        const events = window.PortalState.getEvents();
        const today = new Date().toISOString().split('T')[0];
        const todayEvent = events.find(e => e.fecha === today);
        if (todayEvent) {
            this.currentEventId = todayEvent.id;
            this.selectedDate = today;
        } else {
            const activeEv = events.find(e => e.estado === 'activo');
            if (activeEv) {
                this.currentEventId = activeEv.id;
                this.selectedDate = activeEv.fecha || today;
            } else if (events.length > 0) {
                this.currentEventId = events[0].id;
                this.selectedDate = events[0].fecha || today;
            }
        }
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const modalEl = document.getElementById('modalVerificacionAsistenciaQR');
            if (modalEl && modalEl.classList.contains('show')) {
                if (e.key === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    this.confirmAndNextMember();
                } else if (e.key === 'Escape') {
                    this.closeVerificationModal(false);
                }
            }
        });
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

        // Cálculo de porcentaje para habilitación (Carnaval de Oruro 2027)
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
                    <div class="badge badge-socavon-gold gold-glow-pulse px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                        <i class="bi bi-shield-fill-check fs-6 text-white"></i>
                        <span class="fw-bold text-white">HABILITADO &bull; CARNAVAL DE ORURO 2027</span>
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
    autoSelectTodayEvent() {
        const today = new Date().toISOString().split('T')[0];
        this.selectedDate = today;
        const dateInput = document.getElementById('selectControlEventDate');
        if (dateInput) dateInput.value = today;

        const events = window.PortalState.getEvents();
        const todayEv = events.find(e => e.fecha === today);
        if (todayEv) {
            this.setActiveEvent(todayEv.id);
            window.PortalApp.showToast(`Convocatoria de hoy fijada: "${todayEv.title}"`, 'success');
        } else {
            const activeEv = events.find(e => e.estado === 'activo') || events[0];
            if (activeEv) {
                this.setActiveEvent(activeEv.id);
                window.PortalApp.showToast(`Sin evento programado para hoy (${today}). Manteniendo: "${activeEv.title}"`, 'info');
            }
        }
        this.updateLockedEventBanner();
    }

    handleDateChange(dateStr) {
        if (!dateStr) return;
        this.selectedDate = dateStr;
        const events = window.PortalState.getEvents();
        const matches = events.filter(e => e.fecha === dateStr);
        if (matches.length > 0) {
            this.setActiveEvent(matches[0].id);
            window.PortalApp.showToast(`Evento asignado para ${dateStr}: "${matches[0].title}"`, 'success');
        } else {
            window.PortalApp.showToast(`No existe convocatoria programada para ${dateStr}. Puede crear una en "Nuevo Evento".`, 'warning');
            this.updateLockedEventBanner();
        }
    }

    updateLockedEventBanner() {
        const ev = window.PortalState.getEventById(this.currentEventId);
        const titleEl = document.getElementById('lockedEventTitleText');
        const dateEl = document.getElementById('lockedEventDateText');
        const badgeEl = document.getElementById('lockedEventStatusBadge');
        if (ev && titleEl && dateEl) {
            titleEl.textContent = ev.title;
            dateEl.textContent = `${ev.fecha} (${ev.hora || 'Horario oficial'})`;
            if (badgeEl) {
                badgeEl.innerHTML = `<i class="bi bi-shield-check me-1"></i>Evento Fijado (${ev.tipo || 'Convocatoria'})`;
            }
        }
    }

    setActiveEvent(eventId) {
        this.currentEventId = eventId;
        const ev = window.PortalState.getEventById(eventId);
        if (ev) {
            this.selectedDate = ev.fecha || this.selectedDate;
            if (ev.estado !== 'activo') {
                window.PortalState.updateEvent(eventId, { estado: 'activo' });
            }
        }
        this.renderControlAttendances();
        window.PortalApp.showToast(`Convocatoria activa establecida: "${ev ? ev.title : eventId}"`, 'success');
        window.PortalApp.showView('control-asistencias');
    }

    renderControlAttendances() {
        const events = window.PortalState.getEvents();
        const selectEvent = document.getElementById('selectControlEvent');
        const selectDate = document.getElementById('selectControlEventDate');
        
        if (selectDate && !selectDate.value) {
            selectDate.value = this.selectedDate;
        }

        if (selectEvent) {
            selectEvent.innerHTML = events.map(ev => 
                `<option value="${ev.id}" ${ev.id === this.currentEventId ? 'selected' : ''}>${ev.estado === 'activo' ? '🔴 [ACTIVO HOY] ' : ''}${ev.title} (${ev.fecha})</option>`
            ).join('');
            selectEvent.onchange = (e) => {
                this.setActiveEvent(e.target.value);
            };
        }

        this.updateLockedEventBanner();

        const activeEvent = window.PortalState.getEventById(this.currentEventId) || events[0];

        // Renderizar banner informativo del Punto de Control Activo
        const activeBanner = document.getElementById('controlActivePointBanner');
        if (activeBanner && activeEvent) {
            activeBanner.innerHTML = `
                <div class="card bg-surface-1 border border-brand rounded-4 p-3 mb-3 shadow-sm">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge ${activeEvent.estado === 'activo' ? 'bg-success animate__animated animate__pulse animate__infinite' : 'bg-secondary'} px-3 py-1 rounded-pill">
                                    <i class="bi bi-broadcast me-1"></i>${activeEvent.estado === 'activo' ? 'CONVOCATORIA Y CONTROL ACTIVO' : 'CONVOCATORIA: ' + activeEvent.estado.toUpperCase()}
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
                                <i class="bi bi-pencil me-1"></i> Editar Convocatoria
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
        const breakdown = stats.filialBreakdown || stats.blockBreakdown;
        if (!container || !breakdown) return;

        const filiales = Object.values(breakdown);
        let html = '';
        filiales.forEach(b => {
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

        const filterFilialEl = document.getElementById('controlManualFilterFilial') || document.getElementById('controlManualFilterBlock');
        const selectedFilial = filterFilialEl ? filterFilialEl.value : (this.selectedBlockFilter || 'all');

        const filtered = members.filter(m => {
            const matchesSearch = !searchTerm || 
                m.ci.includes(searchTerm) || 
                `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchTerm) ||
                (m.filial_nombre && m.filial_nombre.toLowerCase().includes(searchTerm));
            
            const matchesFilial = selectedFilial === 'all' || m.filial_id === selectedFilial;

            const reg = (m.asistencias && m.asistencias[this.currentEventId]) || { estado: 'pendiente' };
            const status = reg.estado || 'pendiente';
            const matchesStatus = this.selectedStatusFilter === 'all' || status === this.selectedStatusFilter;

            return matchesSearch && matchesFilial && matchesStatus;
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
                    <span class="badge bg-surface-2 border border-subtle text-brand fw-semibold">
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>${m.filial_nombre || 'Matriz (La Paz)'}
                    </span>
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

    markFilialAsPresent(filialId) {
        const count = window.PortalState.markFilialAttendance(this.currentEventId, filialId, 'presente', 'Directiva Oficial');
        this.renderControlAttendances();
        window.PortalApp.showToast(`Se registraron ${count} asistencias para la filial seleccionada.`, 'success');
    }

    markBlockAsPresent(bloqueId) {
        return this.markFilialAsPresent(bloqueId);
    }

    exportAttendanceCSV() {
        const members = window.PortalState.getMembers();
        const ev = window.PortalState.getEventById(this.currentEventId);
        const evTitle = ev ? ev.title : 'Evento';

        let csv = `LISTA DE ASISTENCIA OFICIAL - TINKUS WISTUS - CARNAVAL DE ORURO 2027\n`;
        csv += `Evento:,"${evTitle}"\n`;
        csv += `Fecha:,"${ev ? ev.fecha : ''}"\n`;
        csv += `Lugar:,"${ev ? ev.lugar : ''}"\n\n`;
        csv += `CI,Expedido,Nombres,Apellidos,Filial,Rol,Estado_Asistencia,Hora_Registro,Marcado_Por\n`;

        members.forEach(m => {
            const reg = (m.asistencias && m.asistencias[this.currentEventId]) || { estado: 'pendiente', hora: '', marcado_por: '' };
            csv += `"${m.ci}","${m.ci_exp || 'LP'}","${m.nombres}","${m.apellidos}","${m.filial_nombre || 'Matriz (La Paz)'}","${m.rol_fraternal}","${reg.estado}","${reg.hora || ''}","${reg.marcado_por || ''}"\n`;
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
            members.map(m => `<option value="${m.ci}">${m.nombres} ${m.apellidos} (CI: ${m.ci}) - ${m.filial_nombre || 'Matriz (La Paz)'}</option>`).join('');
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
        const pauseBtn = document.getElementById('btnPauseResumeScanner');
        const placeholder = document.getElementById('qrCameraPlaceholder');
        const helpBanner = document.getElementById('chromeCameraHelpBanner');
        const statusBadge = document.getElementById('scannerLiveStatusBadge');

        if (!readerEl) return;

        // Comprobación de contexto seguro para Chrome
        const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (!isSecure && location.protocol !== 'https:') {
            if (helpBanner) {
                helpBanner.classList.remove('d-none');
            }
            window.PortalApp.showToast('En Chrome se recomienda http://localhost:8000 o HTTPS para habilitar la cámara.', 'warning');
        }

        if (typeof Html5Qrcode === 'undefined') {
            window.PortalApp.showToast('Librería de escáner cargando...', 'info');
            return;
        }

        try {
            if (helpBanner) helpBanner.classList.add('d-none');
            if (statusBadge) {
                statusBadge.innerHTML = '<i class="bi bi-hourglass-split me-1 text-warning"></i> Solicitando permiso en Chrome...';
                statusBadge.className = 'badge bg-warning bg-opacity-25 text-warning border border-warning rounded-pill small';
            }

            if (!this.html5QrScanner) {
                this.html5QrScanner = new Html5Qrcode('qrCameraReader');
            }

            const config = {
                fps: 20,
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
            this.isPausedForConfirmation = false;

            if (startBtn) {
                startBtn.innerHTML = '<i class="bi bi-stop-circle-fill me-1 text-danger"></i> Detener Cámara';
                startBtn.className = 'btn btn-danger btn-sm rounded-pill px-3 shadow-sm';
            }
            if (pauseBtn) pauseBtn.classList.remove('d-none');
            if (placeholder) placeholder.classList.add('d-none');
            if (statusBadge) {
                statusBadge.innerHTML = '<i class="bi bi-broadcast me-1 text-success"></i> Cámara en Vivo (Chrome)';
                statusBadge.className = 'badge bg-success bg-opacity-25 text-success border border-success rounded-pill small';
            }

            window.PortalApp.showToast('Cámara activa. Enfoque el código QR del carnet.', 'success');
        } catch (err) {
            console.error('Error al iniciar cámara en Chrome:', err);
            this.isCameraScanning = false;
            if (helpBanner) helpBanner.classList.remove('d-none');
            if (statusBadge) {
                statusBadge.innerHTML = '<i class="bi bi-camera-video-off me-1 text-danger"></i> Cámara no disponible';
                statusBadge.className = 'badge bg-danger bg-opacity-25 text-danger border border-danger rounded-pill small';
            }
            window.PortalApp.showToast('No se pudo acceder a la cámara en Chrome. Verifique los permisos mostrados arriba o use el selector rápido.', 'warning');
        }
    }

    async stopCameraScanner() {
        this.stopAutoAdvanceCountdown();
        if (this.html5QrScanner && this.isCameraScanning) {
            try {
                await this.html5QrScanner.stop();
            } catch (e) {
                console.warn('Error al detener cámara:', e);
            }
            this.isCameraScanning = false;
            this.isPausedForConfirmation = false;
        }

        const startBtn = document.getElementById('btnToggleQrCamera');
        if (startBtn) {
            startBtn.innerHTML = '<i class="bi bi-camera-video me-1"></i> Iniciar Escáner con Cámara';
            startBtn.className = 'btn btn-portal-primary btn-sm rounded-pill px-3 shadow-sm';
        }

        const pauseBtn = document.getElementById('btnPauseResumeScanner');
        if (pauseBtn) pauseBtn.classList.add('d-none');

        const placeholder = document.getElementById('qrCameraPlaceholder');
        if (placeholder) placeholder.classList.remove('d-none');

        const statusBadge = document.getElementById('scannerLiveStatusBadge');
        if (statusBadge) {
            statusBadge.innerHTML = '<i class="bi bi-camera-video me-1"></i> Lector QR en Vivo';
            statusBadge.className = 'badge bg-surface-2 text-brand border border-subtle rounded-pill small';
        }
    }

    async switchCameraFacing() {
        this.currentCameraFacing = this.currentCameraFacing === 'environment' ? 'user' : 'environment';
        if (this.isCameraScanning) {
            await this.stopCameraScanner();
            await this.startCameraScanner();
        }
    }

    togglePauseScanning() {
        const pauseBtn = document.getElementById('btnPauseResumeScanner');
        if (!this.html5QrScanner || !this.isCameraScanning) return;

        if (this.isPausedForConfirmation) {
            try {
                this.html5QrScanner.resume();
            } catch (e) {}
            this.isPausedForConfirmation = false;
            if (pauseBtn) pauseBtn.innerHTML = '<i class="bi bi-pause-circle me-1"></i> Pausar';
            window.PortalApp.showToast('Escaneo reanudado', 'info');
        } else {
            try {
                this.html5QrScanner.pause(true);
            } catch (e) {}
            this.isPausedForConfirmation = true;
            if (pauseBtn) pauseBtn.innerHTML = '<i class="bi bi-play-circle me-1"></i> Reanudar';
            window.PortalApp.showToast('Escaneo pausado', 'info');
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
        if (this.isPausedForConfirmation) return;

        const extractedCI = this.extractCIFromPayload(decodedText);
        if (!extractedCI) {
            this.playFeedbackTone('error');
            window.PortalApp.showToast('Formato de QR no reconocido o dañado.', 'danger');
            return;
        }

        // Pausar temporalmente para congelar el fotograma y evitar rebotes
        this.isPausedForConfirmation = true;
        if (this.html5QrScanner && this.isCameraScanning) {
            try {
                this.html5QrScanner.pause(true);
            } catch (e) {}
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
            window.PortalApp.showToast(`Código QR no reconocido: El CI ${ci} no existe en el Padrón Oficial.`, 'danger');
            
            // Reanudar cámara tras 2 segundos de advertencia si estaba escaneando
            setTimeout(() => {
                this.isPausedForConfirmation = false;
                if (this.html5QrScanner && this.isCameraScanning) {
                    try { this.html5QrScanner.resume(); } catch (e) {}
                }
            }, 2000);
            return;
        }

        const activeEvent = window.PortalState.getEventById(this.currentEventId);
        const eventTitle = activeEvent ? activeEvent.title : 'Convocatoria Fraternal';
        const eventLugar = activeEvent ? activeEvent.lugar : 'Punto Oficial Tinkus Wistus';
        const eventFecha = activeEvent ? activeEvent.fecha : this.selectedDate;

        // Comprobar si ya estaba registrado
        const prevReg = (member.asistencias && member.asistencias[this.currentEventId]);
        const alreadyRegistered = !!(prevReg && prevReg.estado && prevReg.estado !== 'pendiente');

        let targetStatus = 'presente';
        const now = new Date();
        const horaMarcada = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Marcar la asistencia en el estado reactivo vinculada estrictamente al evento activo del día
        window.PortalState.markAttendance(member.ci, this.currentEventId, targetStatus, 'Terminal QR Directiva', {
            lugar: eventLugar,
            hora: horaMarcada,
            fecha: eventFecha
        });

        // Registrar en feed de marcajes recientes
        this.recentCheckins.unshift({
            ci: member.ci,
            nombre: `${member.nombres} ${member.apellidos}`,
            foto: member.foto || 'assets/img/avatar-default.svg',
            filial: member.filial_nombre || 'Matriz (La Paz)',
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

        // Mostrar Ficha de Confirmación en la Terminal lateral
        this.displayScannerResultCard(member, targetStatus, horaMarcada, eventTitle, eventLugar, alreadyRegistered);

        // Desplegar Modal Integral de Verificación de Asistencia
        this.showVerificationModal(member, targetStatus, horaMarcada, activeEvent, alreadyRegistered, prevReg);

        // Actualizar vistas del tablero
        this.renderControlAttendances();

        if (alreadyRegistered) {
            window.PortalApp.showToast(`¡Fraterno ${member.nombres} ya tenía registro previo!`, 'warning');
        } else {
            window.PortalApp.showToast(`¡QR VALIDADO! Asistencia registrada para ${member.nombres} ${member.apellidos}`, 'success');
        }
    }

    showVerificationModal(member, estado, horaMarcada, activeEvent, alreadyRegistered, prevReg) {
        this.currentScannedCI = member.ci;
        const modalEl = document.getElementById('modalVerificacionAsistenciaQR');
        if (!modalEl) return;

        // 1. Datos Principales del Fraterno
        const elFoto = document.getElementById('modalVerifFoto');
        if (elFoto) elFoto.src = member.foto || 'assets/img/avatar-default.svg';

        const elNombre = document.getElementById('modalVerifNombre');
        if (elNombre) elNombre.textContent = `${member.nombres} ${member.apellidos}`;

        const elCI = document.getElementById('modalVerifCI');
        if (elCI) elCI.textContent = `CI: ${member.ci} ${member.ci_exp || 'LP'}`;

        const elFilial = document.getElementById('modalVerifFilial');
        if (elFilial) elFilial.textContent = member.filial_nombre || 'Matriz (La Paz)';

        const elRol = document.getElementById('modalVerifRol');
        if (elRol) elRol.textContent = member.rol_fraternal || 'Fraterno Titular';

        const elTimestamp = document.getElementById('modalVerifTimestamp');
        if (elTimestamp) elTimestamp.textContent = horaMarcada;

        // 2. Insignia de Estado
        const elBadge = document.getElementById('modalVerifEstadoBadge');
        if (elBadge) {
            if (alreadyRegistered) {
                elBadge.innerHTML = `<span class="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6"><i class="bi bi-clock-history me-1"></i> REGISTRO PREVIO (Ya Marcado)</span>`;
            } else {
                elBadge.innerHTML = `<span class="badge bg-success text-white px-3 py-2 rounded-pill fs-6"><i class="bi bi-check-circle-fill me-1"></i> ¡ASISTENCIA REGISTRADA!</span>`;
            }
        }

        // 3. Cuotas
        const elCuotas = document.getElementById('modalVerifCuotasChip');
        if (elCuotas) {
            const pagosCount = (member.pagos || []).length;
            const cuotasTotal = (DEFAULT_PORTAL_CONFIG.cuotas_definidas || []).length;
            if (pagosCount >= cuotasTotal) {
                elCuotas.innerHTML = '<span class="badge bg-success"><i class="bi bi-shield-check me-1"></i>Cuotas al Día</span>';
            } else if (pagosCount > 0) {
                elCuotas.innerHTML = `<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>${pagosCount}/${cuotasTotal} Cuotas</span>`;
            } else {
                elCuotas.innerHTML = '<span class="badge bg-danger"><i class="bi bi-exclamation-circle me-1"></i>Cuotas Pendientes</span>';
            }
        }

        // 4. Convocatoria / Evento del Día
        const elEvTitulo = document.getElementById('modalVerifEventoTitulo');
        if (elEvTitulo) elEvTitulo.textContent = activeEvent ? activeEvent.title : 'Convocatoria Activa';

        const elEvFecha = document.getElementById('modalVerifEventoFecha');
        if (elEvFecha) elEvFecha.textContent = activeEvent ? activeEvent.fecha : this.selectedDate;

        const elEvHora = document.getElementById('modalVerifHoraMarcada');
        if (elEvHora) elEvHora.textContent = horaMarcada;

        const elEvLugar = document.getElementById('modalVerifEventoLugar');
        if (elEvLugar) elEvLugar.textContent = activeEvent ? activeEvent.lugar : 'Punto Oficial';

        // 5. Base de Asistencia Previa (Historial acumulado del Fraterno)
        const events = window.PortalState.getEvents();
        let totalOblig = 0;
        let pres = 0;
        let atra = 0;
        let falt = 0;
        let lice = 0;

        events.forEach(ev => {
            if (ev.obligatorio) totalOblig++;
            const reg = (member.asistencias && member.asistencias[ev.id]);
            if (reg) {
                if (reg.estado === 'presente') pres++;
                else if (reg.estado === 'atraso') atra++;
                else if (reg.estado === 'licencia') lice++;
                else if (reg.estado === 'falta') falt++;
            }
        });

        const puntajeEfectivo = pres + (atra * 0.7) + (lice * 0.9);
        const pct = totalOblig > 0 ? Math.min(100, Math.round((puntajeEfectivo / totalOblig) * 100)) : 100;

        const elPct = document.getElementById('modalVerifPctAsistencia');
        if (elPct) elPct.textContent = `${pct}%`;

        const elProg = document.getElementById('modalVerifProgressBar');
        if (elProg) {
            elProg.style.width = `${pct}%`;
            elProg.className = `progress-bar ${pct >= 80 ? 'bg-success' : (pct >= 60 ? 'bg-warning' : 'bg-danger')}`;
        }

        const elHab = document.getElementById('modalVerifHabilitacionBadge');
        if (elHab) {
            if (pct >= 80) {
                elHab.innerHTML = `<span class="badge bg-success text-white px-2 py-1 rounded-pill small"><i class="bi bi-shield-check me-1"></i>HABILITADO 2027</span>`;
            } else if (pct >= 60) {
                elHab.innerHTML = `<span class="badge bg-warning text-dark px-2 py-1 rounded-pill small"><i class="bi bi-exclamation-triangle me-1"></i>EN OBSERVACIÓN</span>`;
            } else {
                elHab.innerHTML = `<span class="badge bg-danger text-white px-2 py-1 rounded-pill small"><i class="bi bi-x-octagon me-1"></i>INHABILITADO</span>`;
            }
        }

        const elDesglose = document.getElementById('modalVerifDesgloseHistorial');
        if (elDesglose) {
            elDesglose.innerHTML = `
                <div class="d-flex justify-content-between flex-wrap small">
                    <span><strong class="text-success">${pres}</strong> Pres.</span>
                    <span><strong class="text-warning">${atra}</strong> Atra.</span>
                    <span><strong class="text-danger">${falt}</strong> Falt.</span>
                    <span><strong class="text-info">${lice}</strong> Lic.</span>
                </div>
            `;
        }

        // 6. Alerta de Registro Previo
        const elAvisoDup = document.getElementById('modalVerifAvisoDuplicado');
        const elAvisoDupTxt = document.getElementById('modalVerifAvisoDuplicadoTexto');
        if (elAvisoDup) {
            if (alreadyRegistered) {
                elAvisoDup.classList.remove('d-none');
                if (elAvisoDupTxt && prevReg) {
                    elAvisoDupTxt.textContent = `Atención: Este fraterno ya estaba registrado previamente a las ${prevReg.hora || 'hora anterior'} (${prevReg.estado || 'presente'}).`;
                }
            } else {
                elAvisoDup.classList.add('d-none');
            }
        }

        // 7. Botones de estado rápido
        this.updateModalStatusButtons(estado);

        // 8. Desplegar Modal Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            if (!this.modalInstance) {
                this.modalInstance = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
            }
            this.modalInstance.show();
        }

        // 9. Iniciar cuenta regresiva para avance continuo
        this.startAutoAdvanceCountdown();
    }

    confirmAndNextMember() {
        this.stopAutoAdvanceCountdown();

        // Ocultar modal
        const modalEl = document.getElementById('modalVerificacionAsistenciaQR');
        if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const inst = bootstrap.Modal.getInstance(modalEl) || this.modalInstance;
            if (inst) inst.hide();
        }

        // Reanudar cámara inmediatamente para el siguiente fraterno
        this.isPausedForConfirmation = false;
        if (this.html5QrScanner && this.isCameraScanning) {
            try {
                this.html5QrScanner.resume();
            } catch (e) {
                console.warn('Error al reanudar cámara:', e);
            }
        }

        this.playFeedbackTone('success');
        window.PortalApp.showToast('Conforme recibido. Listo para el siguiente fraterno.', 'info');
    }

    closeVerificationModal(resumeScan = true) {
        this.stopAutoAdvanceCountdown();
        const modalEl = document.getElementById('modalVerificacionAsistenciaQR');
        if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const inst = bootstrap.Modal.getInstance(modalEl) || this.modalInstance;
            if (inst) inst.hide();
        }

        this.isPausedForConfirmation = false;
        if (resumeScan && this.html5QrScanner && this.isCameraScanning) {
            try {
                this.html5QrScanner.resume();
            } catch (e) {}
        }
    }

    startAutoAdvanceCountdown() {
        this.stopAutoAdvanceCountdown();
        if (!this.autoAdvanceEnabled) {
            const txt = document.getElementById('modalVerifCountdownText');
            if (txt) txt.textContent = 'Auto-siguiente en pausa';
            const btn = document.getElementById('btnToggleCountdown');
            if (btn) btn.textContent = 'Reanudar';
            return;
        }

        this.countdownSeconds = 3;
        const countSecEl = document.getElementById('modalVerifCountdownSec');
        const txt = document.getElementById('modalVerifCountdownText');
        const btn = document.getElementById('btnToggleCountdown');
        if (countSecEl) countSecEl.textContent = this.countdownSeconds;
        if (txt) txt.innerHTML = `<i class="bi bi-hourglass-split text-brand me-1"></i>Siguiente en <strong id="modalVerifCountdownSec" class="font-mono text-dark">${this.countdownSeconds}</strong>s`;
        if (btn) btn.textContent = 'Pausar';

        this.countdownTimer = setInterval(() => {
            this.countdownSeconds--;
            const countEl = document.getElementById('modalVerifCountdownSec');
            if (countEl) countEl.textContent = this.countdownSeconds;

            if (this.countdownSeconds <= 0) {
                this.stopAutoAdvanceCountdown();
                this.confirmAndNextMember();
            }
        }, 1000);
    }

    stopAutoAdvanceCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    toggleModalCountdown() {
        const btn = document.getElementById('btnToggleCountdown');
        if (this.countdownTimer) {
            this.stopAutoAdvanceCountdown();
            const txt = document.getElementById('modalVerifCountdownText');
            if (txt) txt.textContent = 'Pausado';
            if (btn) btn.textContent = 'Reanudar';
        } else {
            this.autoAdvanceEnabled = true;
            this.startAutoAdvanceCountdown();
        }
    }

    changeModalAttendanceStatus(nuevoEstado) {
        if (!this.currentScannedCI) return;
        this.stopAutoAdvanceCountdown();
        const btn = document.getElementById('btnToggleCountdown');
        if (btn) btn.textContent = 'Reanudar';

        window.PortalState.markAttendance(this.currentScannedCI, this.currentEventId, nuevoEstado, 'Directiva (Corrección Manual)');
        this.updateModalStatusButtons(nuevoEstado);
        this.renderControlAttendances();
        this.playFeedbackTone('success');
        window.PortalApp.showToast(`Estado actualizado a: ${nuevoEstado.toUpperCase()}`, 'info');
    }

    updateModalStatusButtons(estado) {
        const btnPres = document.getElementById('btnModalSetPresente');
        const btnAtra = document.getElementById('btnModalSetAtraso');
        const btnLice = document.getElementById('btnModalSetLicencia');
        if (btnPres) btnPres.className = `btn ${estado === 'presente' ? 'btn-success text-white' : 'btn-outline-success'}`;
        if (btnAtra) btnAtra.className = `btn ${estado === 'atraso' ? 'btn-warning text-dark' : 'btn-outline-warning'}`;
        if (btnLice) btnLice.className = `btn ${estado === 'licencia' ? 'btn-info text-dark' : 'btn-outline-info'}`;
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

        const txtFilial = document.getElementById('scanResFilial') || document.getElementById('scanResBloque');
        if (txtFilial) txtFilial.textContent = `${member.filial_nombre || 'Matriz (La Paz)'} • ${member.rol_fraternal || 'Fraterno Titular'}`;

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
                            <div class="text-secondary" style="font-size: 0.72rem;">CI: ${item.ci} &bull; ${item.filial || item.filial_nombre || ''}</div>
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
