/**
 * APLICACIÓN PRINCIPAL Y ENRUTADOR DE SUBPÁGINAS
 * Controla la navegación, vistas activas, barra de prueba y utilidades visuales.
 */

class PortalAppManager {
    constructor() {
        this.currentView = 'login';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindNavigationEvents();
            this.bindQuickBarEvents();
        });
        window.PortalState.subscribe(() => {
            if (this.currentView === 'member-eventos') this.renderEventsTimeline();
            if (this.currentView === 'control-eventos') this.renderEventsTimeline(true);
        });
    }

    showView(viewName) {
        this.currentView = viewName;

        // Ocultar todas las vistas principales
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.add('d-none');
            view.classList.remove('animate__animated', 'animate__fadeIn');
        });

        // Mostrar la vista requerida
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.classList.remove('d-none');
            target.classList.add('animate__animated', 'animate__fadeIn');
        }

        // Actualizar barra de navegación activa
        document.querySelectorAll('.nav-link-subpage').forEach(link => {
            if (link.getAttribute('data-subpage') === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Acciones específicas de renderizado por vista
        if (viewName === 'member-dashboard') this.renderMemberDashboard();
        if (viewName === 'member-asistencias') window.Asistencias.renderMemberAttendances();
        if (viewName === 'member-pagos') window.Pagos.renderMemberPayments();
        if (viewName === 'member-credencial') this.renderDigitalCredential();
        if (viewName === 'member-eventos') this.renderEventsTimeline();

        if (viewName === 'control-dashboard') this.renderControlDashboard();
        if (viewName === 'control-asistencias') window.Asistencias.renderControlAttendances();
        if (viewName === 'control-pagos') window.Pagos.renderControlPayments();
        if (viewName === 'control-directorio') window.Miembros.renderControlDirectory();
        if (viewName === 'control-eventos') this.renderEventsTimeline(true);
    }

    navigateToDashboard(role) {
        if (role === 'miembro') {
            this.showView('member-dashboard');
        } else if (role === 'control') {
            this.showView('control-dashboard');
        } else {
            this.showView('login');
        }
    }

    bindNavigationEvents() {
        // Enlaces de navegación interna
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link-subpage');
            if (link) {
                e.preventDefault();
                const subpage = link.getAttribute('data-subpage');
                if (subpage) this.showView(subpage);
            }
        });

        // Botón de restablecer datos demo
        const btnReset = document.getElementById('btnResetPortalData');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('¿Desea restablecer todos los datos, asistencias y pagos a su estado inicial de demostración?')) {
                    window.PortalState.resetDefaults();
                    this.showToast('Datos demo restablecidos a su estado inicial.');
                    location.reload();
                }
            });
        }
    }

    bindQuickBarEvents() {
        // Accesos rápidos desde la barra superior de demo
        const qMemberBase = document.getElementById('quickSwitchMemberBase');
        if (qMemberBase) {
            qMemberBase.addEventListener('click', (e) => {
                e.preventDefault();
                window.Auth.loginAsMember('4839201');
                this.showToast('Cambiado a: Fraterno (Juan Pablo Quispe)');
            });
        }

        const qMemberMigrated = document.getElementById('quickSwitchMemberMigrated');
        if (qMemberMigrated) {
            qMemberMigrated.addEventListener('click', (e) => {
                e.preventDefault();
                window.Auth.loginAsMember('6892341');
                this.showToast('Cambiado a: Fraterna (Maria Elena Flores)');
            });
        }

        const qControl = document.getElementById('quickSwitchControl');
        if (qControl) {
            qControl.addEventListener('click', (e) => {
                e.preventDefault();
                window.Auth.loginAsControl('control', 'wistus2026');
                this.showToast('Cambiado a: Rol Control / Directiva');
            });
        }
    }

    // --- DASHBOARD MIEMBRO ---
    renderMemberDashboard() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        // Actualizar saludo y datos
        document.getElementById('dashMemberGreeting').textContent = `¡Hola, ${member.nombres.split(' ')[0]}!`;
        document.getElementById('dashMemberBloque').textContent = member.bloque_nombre;
        document.getElementById('dashMemberRol').textContent = member.rol_fraternal;

        // Asistencias resumen
        window.Asistencias.renderMemberAttendances();
        // Pagos resumen
        window.Pagos.renderMemberPayments();
        // Perfil miembro
        window.Miembros.renderMemberProfile();
        // Próximo evento destacado
        this.renderNextUpcomingEvent();
        // Comunicados oficiales
        this.renderAnnouncements();
    }

    renderNextUpcomingEvent() {
        const events = window.PortalState.getEvents();
        const next = events.find(e => e.estado === 'activo' || e.estado === 'proximo');
        const container = document.getElementById('dashNextEventCard');
        if (!container || !next) return;

        container.innerHTML = `
            <div class="card bg-gradient-dark border-brand rounded-4 p-4 position-relative overflow-hidden">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge bg-brand text-dark fw-bold text-uppercase px-3 py-1 rounded-pill">
                        ${next.estado === 'activo' ? '<i class="bi bi-broadcast me-1"></i> En Curso Hoy' : 'Próximo Evento Oficial'}
                    </span>
                    <span class="text-brand small fw-semibold">${next.tipo}</span>
                </div>
                <h5 class="fw-bold text-white mb-2">${next.title}</h5>
                <div class="text-secondary small mb-3">
                    <div><i class="bi bi-calendar3 me-2 text-brand"></i>${next.fecha} &nbsp;&bull;&nbsp; <i class="bi bi-clock me-1 text-brand"></i>${next.hora}</div>
                    <div class="mt-1"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>${next.lugar}</div>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-25">
                    <span class="small text-white-50">Control con Credencial Digital QR</span>
                    <button class="btn btn-brand-subtle btn-sm rounded-pill" onclick="window.PortalApp.showView('member-credencial')">
                        <i class="bi bi-qr-code me-1"></i> Abrir Mi Credencial
                    </button>
                </div>
            </div>
        `;
    }

    renderAnnouncements() {
        const list = window.PortalState.state.comunicados || [];
        const container = document.getElementById('dashAnnouncementsList');
        if (!container) return;

        let html = '';
        list.forEach(c => {
            html += `
            <div class="card bg-surface-1 border border-subtle rounded-4 p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 rounded-pill small">
                        ${c.autor}
                    </span>
                    <span class="small text-secondary">${c.fecha}</span>
                </div>
                <h6 class="fw-bold text-dark mb-1">${c.titulo}</h6>
                <p class="text-secondary small mb-0">${c.contenido}</p>
            </div>`;
        });
        container.innerHTML = html;
    }

    // --- DASHBOARD CONTROL ---
    renderControlDashboard() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'control') return;

        const members = window.PortalState.getMembers();
        const events = window.PortalState.getEvents();

        // Contadores
        let total = members.length;
        let activos = members.filter(m => m.estado_fraterno === 'activo').length;

        const elTotal = document.getElementById('ctrlMetricTotalFraternos');
        if (elTotal) elTotal.textContent = total;

        const elMigrados = document.getElementById('ctrlMetricMigrados');
        if (elMigrados) elMigrados.textContent = `${activos} activos`;

        const elSoloCI = document.getElementById('ctrlMetricSoloCI');
        if (elSoloCI) elSoloCI.textContent = `${total - activos}`;

        // Asistencia general
        const activeEvent = events.find(e => e.estado === 'activo') || events[events.length - 1];
        if (activeEvent) {
            const stats = window.PortalState.getEventAttendanceStats(activeEvent.id);
            document.getElementById('ctrlMetricAsistenciaPct').textContent = `${stats.porcentajeEfectivo}%`;
            document.getElementById('ctrlMetricAsistenciaDetalle').textContent = `${stats.presentes} presentes de ${stats.total}`;
        }

        // Renderizar mini tablas de control
        window.Asistencias.renderControlAttendances();
        window.Pagos.renderControlPayments();
    }

    // --- CREDENCIAL DIGITAL ---
    renderDigitalCredential() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        const theme = window.PortalState.getCurrentTheme();

        // Generar código QR dinámico mediante SVG directo
        const qrContainer = document.getElementById('credentialQRCode');
        if (qrContainer) {
            const verifyPayload = `https://entradauniversitarialapaz2026.bo/verificar?ci=${member.ci}&frat=${encodeURIComponent(theme.short_name)}&t=${Date.now()}`;
            qrContainer.innerHTML = this.generateSVGQRCode(member.ci, theme.short_name);
        }

        document.getElementById('credFratName').textContent = theme.name;
        document.getElementById('credFratDanza').textContent = theme.danza;
        document.getElementById('credFratYear').textContent = `ENTRADA UNIVERSITARIA LA PAZ ${theme.year}`;
        document.getElementById('credEscudo').src = theme.escudo_url;
        document.getElementById('credFoto').src = member.foto || 'assets/img/avatar-default.svg';
        document.getElementById('credNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('credCI').textContent = `CI: ${member.ci} ${member.ci_exp}`;
        document.getElementById('credBloque').textContent = member.bloque_nombre;
        document.getElementById('credRol').textContent = member.rol_fraternal;
        document.getElementById('credAntiguedad').textContent = `${member.antiguedad_anios} Años`;
        document.getElementById('credCodigoSocio').textContent = `SOC-2026-${member.ci.slice(-4)}`;

        // Estado de habilitación en la credencial
        const totalEvents = window.PortalState.getEvents().length;
        let attended = 0;
        if (member.asistencias) {
            Object.values(member.asistencias).forEach(a => { if (a.estado === 'presente') attended++; });
        }
        const pct = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 100;
        const cuotasPagadas = (member.pagos || []).length >= 3;

        const credBadge = document.getElementById('credHabilitadoBadge');
        if (credBadge) {
            if (pct >= 75 && cuotasPagadas) {
                credBadge.className = 'badge bg-success px-3 py-1 rounded-pill';
                credBadge.innerHTML = '<i class="bi bi-patch-check-fill me-1"></i> FRATERNO HABILITADO';
            } else {
                credBadge.className = 'chip-warning px-3 py-1 rounded-pill';
                credBadge.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> REVISIÓN PENDIENTE';
            }
        }
    }

    generateSVGQRCode(ci, fratName) {
        // Generador de matriz de puntos QR estilizada y visualmente idéntica a un QR oficial
        return `
        <svg viewBox="0 0 100 100" width="130" height="130" xmlns="http://www.w3.org/2000/svg" class="bg-white p-2 rounded-3 shadow">
            <!-- Esquinas guía QR -->
            <rect x="5" y="5" width="26" height="26" rx="4" fill="#000" />
            <rect x="9" y="9" width="18" height="18" rx="2" fill="#fff" />
            <rect x="13" y="13" width="10" height="10" rx="1" fill="#7c3aed" />

            <rect x="69" y="5" width="26" height="26" rx="4" fill="#000" />
            <rect x="73" y="9" width="18" height="18" rx="2" fill="#fff" />
            <rect x="77" y="13" width="10" height="10" rx="1" fill="#7c3aed" />

            <rect x="5" y="69" width="26" height="26" rx="4" fill="#000" />
            <rect x="9" y="73" width="18" height="18" rx="2" fill="#fff" />
            <rect x="13" y="77" width="10" height="10" rx="1" fill="#7c3aed" />

            <!-- Matriz de datos simulada y estilizada -->
            <g fill="#1a1a1a">
                <rect x="36" y="8" width="5" height="5" />
                <rect x="44" y="8" width="5" height="5" />
                <rect x="56" y="8" width="5" height="5" />
                <rect x="36" y="18" width="5" height="5" />
                <rect x="50" y="18" width="5" height="5" />
                <rect x="60" y="18" width="5" height="5" />
                <rect x="8" y="36" width="5" height="5" />
                <rect x="18" y="36" width="5" height="5" />
                <rect x="26" y="36" width="5" height="5" />
                <rect x="36" y="36" width="6" height="6" fill="#7c3aed" />
                <rect x="46" y="36" width="5" height="5" />
                <rect x="58" y="36" width="5" height="5" />
                <rect x="68" y="36" width="5" height="5" />
                <rect x="80" y="36" width="5" height="5" />
                <rect x="88" y="36" width="5" height="5" />
                <rect x="14" y="46" width="5" height="5" />
                <rect x="24" y="46" width="5" height="5" />
                <rect x="36" y="46" width="5" height="5" />
                <rect x="46" y="46" width="8" height="8" rx="2" fill="#7c3aed" />
                <rect x="60" y="46" width="5" height="5" />
                <rect x="74" y="46" width="5" height="5" />
                <rect x="84" y="46" width="5" height="5" />
                <rect x="8" y="58" width="5" height="5" />
                <rect x="22" y="58" width="5" height="5" />
                <rect x="36" y="58" width="5" height="5" />
                <rect x="48" y="58" width="5" height="5" />
                <rect x="62" y="58" width="5" height="5" />
                <rect x="76" y="58" width="5" height="5" />
                <rect x="86" y="58" width="5" height="5" />
                <rect x="36" y="68" width="5" height="5" />
                <rect x="46" y="68" width="5" height="5" />
                <rect x="56" y="68" width="5" height="5" />
                <rect x="68" y="68" width="5" height="5" />
                <rect x="82" y="68" width="5" height="5" />
                <rect x="36" y="80" width="5" height="5" />
                <rect x="50" y="80" width="5" height="5" />
                <rect x="62" y="80" width="5" height="5" />
                <rect x="74" y="80" width="5" height="5" />
                <rect x="86" y="80" width="5" height="5" />
            </g>

            <!-- Logo W central en el QR (Fondo amarillo y W en lila) -->
            <circle cx="50" cy="50" r="11" fill="#fbbf24" stroke="#5b21b6" stroke-width="1.5" />
            <text x="50" y="54" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="11" fill="#5b21b6">W</text>
        </svg>
        `;
    }

    printCredential() {
        window.print();
    }

    // --- EVENTOS / CRONOGRAMA ---
    renderEventsTimeline(isControl = false) {
        const events = window.PortalState.getEvents();
        const container = document.getElementById(isControl ? 'controlEventsTimeline' : 'memberEventsTimeline');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-secondary">
                    <i class="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                    <p class="mb-0">No hay convocatorias registradas en el cronograma.</p>
                </div>`;
            return;
        }

        let html = '';
        events.forEach(ev => {
            let statusBadge = '';
            if (ev.estado === 'finalizado') statusBadge = '<span class="badge bg-secondary">Realizado</span>';
            else if (ev.estado === 'activo') statusBadge = '<span class="badge bg-success animate__animated animate__pulse animate__infinite"><i class="bi bi-broadcast me-1"></i>En Curso Hoy</span>';
            else statusBadge = '<span class="badge bg-info text-dark">Próximo</span>';

            let controlActions = '';
            if (isControl) {
                controlActions = `
                <div class="d-flex align-items-center gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25 flex-wrap">
                    <button type="button" class="btn btn-sm btn-outline-brand rounded-pill px-3" onclick="window.PortalApp.openEventModal('${ev.id}')">
                        <i class="bi bi-pencil me-1"></i> Editar
                    </button>
                    
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown">
                            Estado: <strong class="text-white text-capitalize">${ev.estado}</strong>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark shadow">
                            <li><a class="dropdown-item ${ev.estado === 'proximo' ? 'active' : ''}" href="#" onclick="event.preventDefault(); window.PortalApp.changeEventStatus('${ev.id}', 'proximo')"><i class="bi bi-clock me-2"></i>Próximo</a></li>
                            <li><a class="dropdown-item ${ev.estado === 'activo' ? 'active' : ''}" href="#" onclick="event.preventDefault(); window.PortalApp.changeEventStatus('${ev.id}', 'activo')"><i class="bi bi-broadcast text-success me-2"></i>En Curso (Activo)</a></li>
                            <li><a class="dropdown-item ${ev.estado === 'finalizado' ? 'active' : ''}" href="#" onclick="event.preventDefault(); window.PortalApp.changeEventStatus('${ev.id}', 'finalizado')"><i class="bi bi-check2-circle text-secondary me-2"></i>Finalizado / Realizado</a></li>
                        </ul>
                    </div>

                    <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 ms-auto" onclick="window.PortalApp.deleteEvent('${ev.id}')">
                        <i class="bi bi-trash me-1"></i> Eliminar
                    </button>
                </div>`;
            }

            html += `
            <div class="timeline-item pb-4 position-relative">
                <div class="card bg-surface-1 border border-subtle rounded-4 p-3 hover-scale-sm shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <div class="d-flex align-items-center gap-2">
                            ${statusBadge}
                            <span class="badge bg-surface-2 text-brand border border-subtle">${ev.tipo}</span>
                            ${ev.obligatorio ? '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25">Obligatorio</span>' : ''}
                        </div>
                        <span class="text-brand fw-bold small">+${ev.puntos_asistencia} Pts</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">${ev.title}</h5>
                    <div class="row g-2 text-secondary small">
                        <div class="col-md-6"><i class="bi bi-calendar-event me-2 text-brand"></i>${ev.fecha} &bull; ${ev.hora}</div>
                        <div class="col-md-6"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>${ev.lugar}</div>
                    </div>
                    ${controlActions}
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    openEventModal(eventId = null) {
        const modalEl = document.getElementById('modalEventEditor');
        if (!modalEl || !window.bootstrap) return;

        const titleEl = document.getElementById('modalEventEditorTitle');
        const inputId = document.getElementById('eventEditId');
        const inputTitle = document.getElementById('eventEditTitle');
        const inputTipo = document.getElementById('eventEditTipo');
        const inputEstado = document.getElementById('eventEditEstado');
        const inputFecha = document.getElementById('eventEditFecha');
        const inputHora = document.getElementById('eventEditHora');
        const inputLugar = document.getElementById('eventEditLugar');
        const inputPuntos = document.getElementById('eventEditPuntos');
        const inputObligatorio = document.getElementById('eventEditObligatorio');

        if (eventId) {
            const ev = window.PortalState.getEventById(eventId);
            if (!ev) return;
            titleEl.innerHTML = '<i class="bi bi-pencil-square text-brand me-2"></i>Editar Evento Oficial';
            inputId.value = ev.id;
            inputTitle.value = ev.title || '';
            inputTipo.value = ev.tipo || 'Ensayo';
            inputEstado.value = ev.estado || 'proximo';
            inputFecha.value = ev.fecha || '';
            inputHora.value = ev.hora || '';
            inputLugar.value = ev.lugar || '';
            inputPuntos.value = ev.puntos_asistencia || 10;
            inputObligatorio.checked = !!ev.obligatorio;
        } else {
            titleEl.innerHTML = '<i class="bi bi-calendar-plus text-brand me-2"></i>Nuevo Evento Oficial';
            inputId.value = '';
            inputTitle.value = '';
            inputTipo.value = 'Ensayo';
            inputEstado.value = 'proximo';
            const today = new Date().toISOString().split('T')[0];
            inputFecha.value = today;
            inputHora.value = '15:00 - 19:00';
            inputLugar.value = 'Sede Social Tinkus Wistus';
            inputPuntos.value = 10;
            inputObligatorio.checked = true;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }

    saveEvent(e) {
        e.preventDefault();
        const id = document.getElementById('eventEditId').value;
        const eventData = {
            title: document.getElementById('eventEditTitle').value.trim(),
            tipo: document.getElementById('eventEditTipo').value,
            estado: document.getElementById('eventEditEstado').value,
            fecha: document.getElementById('eventEditFecha').value,
            hora: document.getElementById('eventEditHora').value.trim(),
            lugar: document.getElementById('eventEditLugar').value.trim(),
            puntos_asistencia: parseInt(document.getElementById('eventEditPuntos').value, 10) || 10,
            obligatorio: document.getElementById('eventEditObligatorio').checked
        };

        if (id) {
            window.PortalState.updateEvent(id, eventData);
            this.showToast('Evento modificado exitosamente.', 'success');
        } else {
            window.PortalState.addEvent(eventData);
            this.showToast('Nuevo evento creado e incorporado al cronograma.', 'success');
        }

        const modalEl = document.getElementById('modalEventEditor');
        if (modalEl && window.bootstrap) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        this.renderEventsTimeline(true);
        if (window.Asistencias && typeof window.Asistencias.renderControlAttendances === 'function') {
            window.Asistencias.renderControlAttendances();
        }
    }

    changeEventStatus(eventId, newEstado) {
        const ev = window.PortalState.getEventById(eventId);
        if (!ev) return;

        window.PortalState.updateEvent(eventId, { estado: newEstado });
        this.showToast(`Estado de "${ev.title}" actualizado a "${newEstado}".`, 'info');
        this.renderEventsTimeline(true);

        if (window.Asistencias && typeof window.Asistencias.renderControlAttendances === 'function') {
            window.Asistencias.renderControlAttendances();
        }
    }

    deleteEvent(eventId) {
        const ev = window.PortalState.getEventById(eventId);
        if (!ev) return;

        if (confirm(`¿Está seguro de eliminar el evento "${ev.title}" del cronograma?`)) {
            window.PortalState.deleteEvent(eventId);
            this.showToast('Evento eliminado del cronograma.', 'warning');
            this.renderEventsTimeline(true);

            if (window.Asistencias && typeof window.Asistencias.renderControlAttendances === 'function') {
                window.Asistencias.renderControlAttendances();
            }
        }
    }

    showToast(msg, type = 'success') {
        const toastEl = document.getElementById('toastNotification');
        if (!toastEl || !window.bootstrap) return;

        document.getElementById('toastMessage').textContent = msg;
        const header = toastEl.querySelector('.toast-header');
        if (header) {
            const isLightBg = ['warning', 'light', 'info'].includes(type);
            header.className = `toast-header bg-${type} ${isLightBg ? 'text-dark' : 'text-white'}`;
        }

        const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
        toast.show();
    }
}

window.PortalApp = new PortalAppManager();

PortalAppManager.prototype.copyBankDetails = function(accountNumber) {
    const num = accountNumber || '150-1928374-2';
    navigator.clipboard.writeText(num).then(() => {
        this.showToast(`Nro de cuenta ${num} copiado al portapapeles.`, 'success');
    }).catch(() => {
        this.showToast(`Nro de cuenta: ${num}`, 'info');
    });
};
