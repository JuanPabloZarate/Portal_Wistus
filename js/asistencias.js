/**
 * MÓDULO DE ASISTENCIAS Y ESCÁNER QR
 * Gestiona la visualización para fraternos y la terminal de marcaje para el rol control.
 */

class AsistenciasManager {
    constructor() {
        this.currentEventId = 'ev_4'; // Evento activo por defecto
        this.selectedBlockFilter = 'all';
    }

    init() {
        // Escuchar cambios de estado para refrescar vistas
        window.PortalState.subscribe(() => {
            const session = window.PortalState.getSession();
            if (session) {
                if (session.role === 'miembro') this.renderMemberAttendances();
                if (session.role === 'control') this.renderControlAttendances();
            }
        });
    }

    // --- VISTA FRATERNO / MIEMBRO ---
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

            let badgeClass = 'bg-secondary';
            let badgeText = 'Pendiente';
            let horaInfo = '<span class="text-muted small"><i class="bi bi-dash"></i> No registrado</span>';

            if (reg.estado === 'presente') {
                asistidos++;
                badgeClass = 'bg-success text-white';
                badgeText = 'Presente';
                horaInfo = `<span class="text-success small fw-semibold"><i class="bi bi-check-circle-fill me-1"></i>${reg.hora || '15:00'} (Verificado)</span>`;
            } else if (reg.estado === 'atraso') {
                atrasos++;
                badgeClass = 'chip-warning';
                badgeText = 'Atraso';
                horaInfo = `<span class="text-amber small fw-semibold"><i class="bi bi-clock-fill me-1"></i>${reg.hora || '16:15'}</span>`;
            } else if (reg.estado === 'licencia') {
                licencias++;
                badgeClass = 'bg-info text-dark';
                badgeText = 'Licencia';
                horaInfo = `<span class="text-info small fw-semibold"><i class="bi bi-file-earmark-text-fill me-1"></i>Autorizado</span>`;
            } else if (reg.estado === 'falta') {
                faltas++;
                badgeClass = 'bg-danger text-white';
                badgeText = 'Falta';
                horaInfo = `<span class="text-danger small fw-semibold"><i class="bi bi-x-circle-fill me-1"></i>Inasistencia</span>`;
            }

            html += `
            <div class="card bg-surface-1 border border-subtle rounded-4 p-3 mb-3 hover-scale-sm">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge ${badgeClass} px-3 py-1 rounded-pill text-uppercase fw-bold">${badgeText}</span>
                            <span class="badge bg-surface-2 text-brand border border-subtle rounded-pill small">${ev.tipo}</span>
                            ${ev.obligatorio ? '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 rounded-pill small">Obligatorio</span>' : ''}
                        </div>
                        <h6 class="fw-bold mb-1 text-dark">${ev.title}</h6>
                        <div class="text-secondary small">
                            <i class="bi bi-calendar3 me-1"></i>${ev.fecha} &nbsp;|&nbsp; 
                            <i class="bi bi-geo-alt-fill me-1"></i>${ev.lugar}
                        </div>
                    </div>
                    <div class="text-end">
                        ${horaInfo}
                        <div class="small text-muted mt-1">Puntos: +${ev.puntos_asistencia}</div>
                    </div>
                </div>
            </div>`;
        });

        container.innerHTML = html;

        // Calcular porcentaje
        const puntajeEfectivo = asistidos + (atrasos * 0.7) + (licencias * 0.9);
        const porcentaje = totalObligatorios > 0 ? Math.min(100, Math.round((puntajeEfectivo / totalObligatorios) * 100)) : 100;

        // Actualizar tarjetas de resumen del miembro
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
                elHabilitacion.innerHTML = '<span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill"><i class="bi bi-shield-check me-1"></i> HABILITADO PARA ENTRADA UNIVERSITARIA LA PAZ</span>';
            } else {
                elHabilitacion.innerHTML = '<span class="chip-warning px-3 py-2 rounded-pill"><i class="bi bi-exclamation-triangle me-1"></i> EN OBSERVACIÓN (REQUIERE ASISTIR)</span>';
            }
        }

        const elStatsCount = document.getElementById('memberAttendanceCounts');
        if (elStatsCount) {
            elStatsCount.innerHTML = `
                <span class="text-success fw-bold me-3"><i class="bi bi-check-circle me-1"></i>${asistidos} Presentes</span>
                <span class="text-amber fw-bold me-3"><i class="bi bi-clock me-1"></i>${atrasos} Atrasos</span>
                <span class="text-danger fw-bold me-3"><i class="bi bi-x-circle me-1"></i>${faltas} Faltas</span>
                <span class="text-info fw-bold"><i class="bi bi-file-text me-1"></i>${licencias} Licencias</span>
            `;
        }
    }

    // --- VISTA CONTROL / DIRECTIVA ---
    renderControlAttendances() {
        const events = window.PortalState.getEvents();
        const selectEvent = document.getElementById('selectControlEvent');
        if (selectEvent && selectEvent.options.length <= 1) {
            selectEvent.innerHTML = events.map(ev => 
                `<option value="${ev.id}" ${ev.id === this.currentEventId ? 'selected' : ''}>${ev.title} (${ev.fecha})</option>`
            ).join('');
            selectEvent.addEventListener('change', (e) => {
                this.currentEventId = e.target.value;
                this.renderControlAttendances();
            });
        }

        // Estadísticas del evento actual
        const stats = window.PortalState.getEventAttendanceStats(this.currentEventId);
        const elStats = document.getElementById('controlEventStatsBar');
        if (elStats) {
            elStats.innerHTML = `
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-subtle p-2 text-center rounded-3">
                        <div class="small text-secondary text-uppercase">Padrón</div>
                        <div class="fs-4 fw-bold text-dark">${stats.total}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-success border-opacity-50 p-2 text-center rounded-3">
                        <div class="small text-success text-uppercase">Presentes</div>
                        <div class="fs-4 fw-bold text-success">${stats.presentes}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-amber border-opacity-50 p-2 text-center rounded-3">
                        <div class="small text-amber text-uppercase">Atrasos</div>
                        <div class="fs-4 fw-bold text-amber">${stats.atrasos}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-danger border-opacity-50 p-2 text-center rounded-3">
                        <div class="small text-danger text-uppercase">Faltas</div>
                        <div class="fs-4 fw-bold text-danger">${stats.faltas}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-info border-opacity-50 p-2 text-center rounded-3">
                        <div class="small text-info text-uppercase">Licencias</div>
                        <div class="fs-4 fw-bold text-info">${stats.licencias}</div>
                    </div>
                </div>
                <div class="col-6 col-md-2 mb-2">
                    <div class="card bg-surface-1 border border-brand border-opacity-50 p-2 text-center rounded-3">
                        <div class="small text-brand text-uppercase">% Asistencia</div>
                        <div class="fs-4 fw-bold text-brand">${stats.porcentajeEfectivo}%</div>
                    </div>
                </div>
            `;
        }

        // Renderizar lista manual de pase de lista
        this.renderManualPassList();
        this.populateScannerMemberSelect();
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

            return matchesSearch && matchesBlock;
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
                                CI: <span class="text-brand fw-semibold">${m.ci} ${m.ci_exp}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-surface-2 border border-subtle text-primary fw-semibold">${m.bloque_nombre}</span>
                </td>
                <td>
                    ${this.getStatusBadgeHtml(reg.estado)}
                    ${reg.hora ? `<span class="small text-muted ms-1">${reg.hora}</span>` : ''}
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-success ${reg.estado === 'presente' ? 'active' : ''}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'presente')" title="Presente">
                            <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="btn btn-outline-warning ${reg.estado === 'atraso' ? 'active' : ''}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'atraso')" title="Atraso">
                            <i class="bi bi-clock"></i>
                        </button>
                        <button class="btn btn-outline-info ${reg.estado === 'licencia' ? 'active' : ''}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'licencia')" title="Licencia">
                            <i class="bi bi-file-text"></i>
                        </button>
                        <button class="btn btn-outline-danger ${reg.estado === 'falta' ? 'active' : ''}" 
                                onclick="window.Asistencias.markQuick('${m.ci}', 'falta')" title="Falta">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        if (filtered.length === 0) {
            html = '<tr><td colspan="4" class="text-center py-4 text-muted">No se encontraron fraternos con el filtro seleccionado.</td></tr>';
        }

        container.innerHTML = html;
    }

    getStatusBadgeHtml(estado) {
        switch (estado) {
            case 'presente':
                return '<span class="badge bg-success text-white"><i class="bi bi-check-circle me-1"></i>Presente</span>';
            case 'atraso':
                return '<span class="chip-warning"><i class="bi bi-clock me-1"></i>Atraso</span>';
            case 'licencia':
                return '<span class="badge bg-info text-dark"><i class="bi bi-file-text me-1"></i>Licencia</span>';
            case 'falta':
                return '<span class="badge bg-danger text-white"><i class="bi bi-x-circle me-1"></i>Falta</span>';
            default:
                return '<span class="badge bg-secondary text-white-50"><i class="bi bi-dash me-1"></i>Pendiente</span>';
        }
    }

    markQuick(ci, estado) {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
        window.PortalState.markAttendance(ci, this.currentEventId, estado, 'Control Manual');
        this.renderControlAttendances();
        window.PortalApp.showToast(`Asistencia de ${ci} actualizada a: ${estado.toUpperCase()}`);
    }

    populateScannerMemberSelect() {
        const sel = document.getElementById('selectScannerTestMember');
        if (!sel) return;
        const members = window.PortalState.getMembers();
        sel.innerHTML = '<option value="">-- Seleccione fraterno para simular escaneo QR --</option>' + 
            members.map(m => `<option value="${m.ci}">${m.nombres} ${m.apellidos} (CI: ${m.ci}) - ${m.bloque_nombre}</option>`).join('');
    }

    simulateQRScan(ciInput) {
        const ci = ciInput || document.getElementById('selectScannerTestMember').value;
        if (!ci) {
            window.PortalApp.showToast('Seleccione o ingrese un CI para simular escaneo', 'warning');
            return;
        }

        const member = window.PortalState.getMemberByCI(ci);
        if (!member) {
            window.PortalApp.showToast(`Código QR no reconocido (CI ${ci} inexistente)`, 'danger');
            return;
        }

        // Marcar asistencia como presente
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
        window.PortalState.markAttendance(ci, this.currentEventId, 'presente', 'Terminal QR');

        // Mostrar pantalla de confirmación tipo terminal con animación
        const resultCard = document.getElementById('scannerResultCard');
        if (resultCard) {
            resultCard.classList.remove('d-none');
            resultCard.classList.add('animate__animated', 'animate__bounceIn');
            setTimeout(() => resultCard.classList.remove('animate__animated', 'animate__bounceIn'), 1000);

            document.getElementById('scanResFoto').src = member.foto || 'assets/img/avatar-default.svg';
            document.getElementById('scanResNombre').textContent = `${member.nombres} ${member.apellidos}`;
            document.getElementById('scanResCI').textContent = `CI: ${member.ci} ${member.ci_exp}`;
            document.getElementById('scanResBloque').textContent = member.bloque_nombre;
            document.getElementById('scanResHora').textContent = `Hora: ${new Date().toLocaleTimeString('es-BO')}`;
            
            const cuotasStatus = member.pagos && member.pagos.length >= 3 ? 
                '<span class="badge bg-success"><i class="bi bi-cash-coin me-1"></i>Cuotas al Día</span>' : 
                '<span class="chip-warning"><i class="bi bi-exclamation-circle me-1"></i>Cuotas Pendientes</span>';
            document.getElementById('scanResCuotas').innerHTML = cuotasStatus;
        }

        this.renderControlAttendances();
        window.PortalApp.showToast(`¡QR Validado! Asistencia registrada para ${member.nombres} ${member.apellidos}`);
    }
}

window.Asistencias = new AsistenciasManager();
