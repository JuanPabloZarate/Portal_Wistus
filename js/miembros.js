/**
 * DIRECTORIO DE MIEMBROS Y GESTIÓN DE PADRÓN
 * Gestiona el padrón fraternal, perfil del fraterno y kardex individual.
 */

class MiembrosManager {
    constructor() {
        this.selectedFilter = 'all';
        this.selectedBlock = 'all';
        this.init();
    }

    init() {
        window.PortalState.subscribe(() => {
            const session = window.PortalState.getSession();
            if (session) {
                if (session.role === 'control') this.renderControlDirectory();
                if (session.role === 'miembro') this.renderMemberProfile();
            }
        });
    }

    // --- VISTA FRATERNO: PERFIL Y DATOS PERSONALES ---
    renderMemberProfile() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        // Inyectar datos en la vista de Credencial y Perfil
        document.querySelectorAll('.member-val-nombre').forEach(el => el.textContent = `${member.nombres} ${member.apellidos}`);
        document.querySelectorAll('.member-val-ci').forEach(el => el.textContent = `${member.ci} ${member.ci_exp}`);
        document.querySelectorAll('.member-val-bloque').forEach(el => el.textContent = member.bloque_nombre);
        document.querySelectorAll('.member-val-rol').forEach(el => el.textContent = member.rol_fraternal);
        document.querySelectorAll('.member-val-antiguedad').forEach(el => el.textContent = `${member.antiguedad_anios} años en Entrada Universitaria La Paz`);
        document.querySelectorAll('.member-val-telefono').forEach(el => el.textContent = member.telefono || 'No registrado');
        document.querySelectorAll('.member-val-email').forEach(el => el.textContent = member.email || 'Sin correo asociado');
        document.querySelectorAll('.member-val-foto').forEach(el => {
            if (el.tagName === 'IMG') el.src = member.foto || 'assets/img/avatar-default.svg';
        });
    }

    // --- VISTA CONTROL: DIRECTORIO GENERAL Y ACCIONES ---
    renderControlDirectory() {
        const container = document.getElementById('controlDirectoryTableBody');
        if (!container) return;

        const members = window.PortalState.getMembers();
        const searchInput = document.getElementById('searchDirectoryMember');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        // Contadores
        let total = members.length;

        // Actualizar badges de conteo
        const elTotalCount = document.getElementById('dirCountTotal');
        if (elTotalCount) elTotalCount.textContent = total;

        // Filtrar
        const filtered = members.filter(m => {
            const matchesSearch = !searchTerm ||
                m.ci.includes(searchTerm) ||
                `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchTerm) ||
                m.bloque_nombre.toLowerCase().includes(searchTerm);

            let matchesBlock = this.selectedBlock === 'all' || m.bloque_id === this.selectedBlock;

            return matchesSearch && matchesBlock;
        });

        let html = '';
        filtered.forEach(m => {
            // Calcular % asistencia
            const totalEvents = window.PortalState.getEvents().length;
            let attended = 0;
            if (m.asistencias) {
                Object.values(m.asistencias).forEach(a => {
                    if (a.estado === 'presente') attended++;
                });
            }
            const attPct = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;

            html += `
            <tr class="align-middle">
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${m.foto || 'assets/img/avatar-default.svg'}" class="rounded-circle border border-brand" width="40" height="40" alt="Foto">
                        <div>
                            <div class="fw-bold text-white">${m.nombres} ${m.apellidos}</div>
                            <div class="small text-secondary">${m.telefono || 'Sin teléfono'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="fw-bold text-brand font-monospace">${m.ci} ${m.ci_exp}</span>
                </td>
                <td>
                    <span class="badge bg-surface-2 border border-subtle text-primary fw-semibold">${m.bloque_nombre}</span>
                    <div class="small text-muted">${m.rol_fraternal}</div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px; width: 60px; background: #e2e8f0;">
                            <div class="progress-bar ${attPct >= 75 ? 'bg-success' : 'bg-brand'}" style="width: ${attPct}%"></div>
                        </div>
                        <span class="small text-primary fw-bold">${attPct}%</span>
                    </div>
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="window.Miembros.viewMemberDetails('${m.ci}')" title="Ver Ficha / Kardex">
                            <i class="bi bi-person-vcard"></i> Ficha
                        </button>
                        <button class="btn btn-outline-success" onclick="window.Pagos.openRegisterPaymentModal('${m.ci}')" title="Cobrar Cuota">
                            <i class="bi bi-cash"></i> Cobrar
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        if (filtered.length === 0) {
            html = '<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron fraternos registrados con este criterio.</td></tr>';
        }

        container.innerHTML = html;
    }

    viewMemberDetails(ci) {
        const member = window.PortalState.getMemberByCI(ci);
        if (!member) return;

        document.getElementById('kardexNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('kardexCI').textContent = `${member.ci} ${member.ci_exp}`;
        document.getElementById('kardexBloque').textContent = member.bloque_nombre;
        document.getElementById('kardexRol').textContent = member.rol_fraternal;
        document.getElementById('kardexAntiguedad').textContent = `${member.antiguedad_anios} años`;
        document.getElementById('kardexTelefono').textContent = member.telefono || 'Sin teléfono';
        document.getElementById('kardexFoto').src = member.foto || 'assets/img/avatar-default.svg';

        // Lista de asistencias
        const events = window.PortalState.getEvents();
        let attHtml = '';
        events.forEach(ev => {
            const reg = (member.asistencias && member.asistencias[ev.id]) || { estado: 'pendiente' };
            attHtml += `<div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25">
                <div>
                    <div class="fw-semibold text-white small">${ev.title}</div>
                    <div class="text-secondary small">${ev.fecha}</div>
                </div>
                ${window.Asistencias.getStatusBadgeHtml(reg.estado)}
            </div>`;
        });
        document.getElementById('kardexAsistenciasList').innerHTML = attHtml;

        // Historial de pagos
        let pagosHtml = '';
        (member.pagos || []).forEach(p => {
            pagosHtml += `<div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25">
                <div>
                    <div class="fw-semibold text-white small">${p.concepto}</div>
                    <div class="text-secondary small">${p.fecha} &bull; ${p.nro_recibo}</div>
                </div>
                <span class="text-brand fw-bold">Bs. ${p.monto}</span>
            </div>`;
        });
        if (!member.pagos || member.pagos.length === 0) {
            pagosHtml = '<div class="text-muted small py-2">Sin pagos registrados.</div>';
        }
        document.getElementById('kardexPagosList').innerHTML = pagosHtml;

        const modalEl = document.getElementById('modalMemberKardex');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    openNewMemberModal() {
        const modalEl = document.getElementById('modalNewMember');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    submitNewMember() {
        const ci = document.getElementById('newMemberCI').value.trim();
        const exp = document.getElementById('newMemberExp').value;
        const nombres = document.getElementById('newMemberNombres').value.trim();
        const apellidos = document.getElementById('newMemberApellidos').value.trim();
        const telefono = document.getElementById('newMemberTelefono').value.trim();
        const bloqueId = document.getElementById('newMemberBloque').value;
        const rol = document.getElementById('newMemberRol').value;
        const antiguedad = document.getElementById('newMemberAntiguedad').value;

        if (!ci || !nombres || !apellidos) {
            window.PortalApp.showToast('CI, nombres y apellidos son requeridos', 'warning');
            return;
        }

        const bloqueObj = window.PortalState.state.bloques.find(b => b.id === bloqueId);
        const bloqueNombre = bloqueObj ? bloqueObj.name : 'Bloque Galanes';

        try {
            window.PortalState.addMember({
                ci,
                ci_exp: exp,
                nombres,
                apellidos,
                telefono,
                bloque_id: bloqueId,
                bloque_nombre: bloqueNombre,
                rol_fraternal: rol,
                antiguedad_anios: antiguedad
            });

            const modalEl = document.getElementById('modalNewMember');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
            }

            window.PortalApp.showToast(`¡Fraterno ${nombres} ${apellidos} registrado exitosamente en el Padrón 2026!`);
        } catch (e) {
            window.PortalApp.showToast(e.message, 'danger');
        }
    }

    exportDirectoryCSV() {
        const members = window.PortalState.getMembers();
        let csv = 'CI,Expedido,Nombres,Apellidos,Bloque,Rol,Antiguedad,Telefono,Email,Tiene_Usuario,Estado\n';

        members.forEach(m => {
            csv += `"${m.ci}","${m.ci_exp}","${m.nombres}","${m.apellidos}","${m.bloque_nombre}","${m.rol_fraternal}","${m.antiguedad_anios}","${m.telefono}","${m.email || ''}","${m.has_user_account ? 'SI' : 'NO'}","${m.estado_fraterno}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `padron_fraternos_entrada_universitaria_la_paz_2026.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.PortalApp.showToast('Padrón descargado en formato CSV compatible con Excel.');
    }
}

window.Miembros = new MiembrosManager();
