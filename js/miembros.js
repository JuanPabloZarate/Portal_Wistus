/**
 * DIRECTORIO DE MIEMBROS Y GESTIÓN DE PADRÓN
 * Gestiona el padrón fraternal, perfil del fraterno y kardex individual.
 * Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus
 */

class MiembrosManager {
    constructor() {
        this.selectedFilter = 'all';
        this.selectedBlock = 'all';
        this.selectedFilial = 'all';
        this.currentKardexCI = null;
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
        document.querySelectorAll('.member-val-ci').forEach(el => el.textContent = `${member.ci} ${member.ci_exp || 'LP'}`);
        document.querySelectorAll('.member-val-bloque').forEach(el => el.textContent = member.filial_nombre || 'Matriz (La Paz)');
        document.querySelectorAll('.member-val-filial').forEach(el => el.textContent = member.filial_nombre || 'Matriz (La Paz)');
        document.querySelectorAll('.member-val-rol').forEach(el => el.textContent = member.rol_fraternal || 'Fraterno Titular');
        document.querySelectorAll('.member-val-antiguedad').forEach(el => el.textContent = `${member.antiguedad_anios || 1} años en Carnaval de Oruro`);
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

        // Contadores y distribución por filiales oficiales
        let total = members.length;
        const filialCounts = {};

        const filialesDef = (window.DEFAULT_PORTAL_CONFIG && window.DEFAULT_PORTAL_CONFIG.filiales) ? window.DEFAULT_PORTAL_CONFIG.filiales : [];
        filialesDef.forEach(f => {
            filialCounts[f.id] = { id: f.id, name: f.name, count: 0 };
        });

        members.forEach(m => {
            const fid = m.filial_id || 'matriz_lp';
            if (!filialCounts[fid]) {
                filialCounts[fid] = { id: fid, name: m.filial_nombre || fid, count: 0 };
            }
            filialCounts[fid].count++;
        });

        // Actualizar badges de conteo y métricas de distribución
        const elTotalCount = document.getElementById('dirCountTotal');
        if (elTotalCount) elTotalCount.textContent = total;

        const countEliminados = (window.PortalState && window.PortalState.getEliminados) ? window.PortalState.getEliminados().length : 0;
        const elEliminadosBadge = document.getElementById('badgeCountEliminados');
        if (elEliminadosBadge) elEliminadosBadge.textContent = countEliminados;

        const filialesBadgesContainer = document.getElementById('distFilialesBadgesContainer');
        if (filialesBadgesContainer) {
            let fHtml = '';
            Object.values(filialCounts).forEach(f => {
                fHtml += `
                    <span class="badge bg-surface-2 border border-subtle text-dark p-2 d-inline-flex align-items-center gap-1 rounded-3">
                        <i class="bi bi-geo-alt text-brand"></i>
                        <span class="fw-semibold">${f.name}:</span>
                        <span class="badge bg-brand text-white ms-1">${f.count}</span>
                    </span>
                `;
            });
            filialesBadgesContainer.innerHTML = fHtml;
        }

        // Leer filtros
        const filterRolEl = document.getElementById('filterDirectoryRol');
        const selectedRol = filterRolEl ? filterRolEl.value : (this.selectedRol || 'all');
        const filterFilialEl = document.getElementById('filterDirectoryFilial');
        const selectedFilial = filterFilialEl ? filterFilialEl.value : (this.selectedFilial || 'all');

        // Filtrar
        const filtered = members.filter(m => {
            const fullName = `${m.nombres || ''} ${m.apellidos || ''}`.toLowerCase();
            const ciStr = String(m.ci || '');
            const fName = String(m.filial_nombre || '').toLowerCase();
            const rName = String(m.rol_fraternal || '').toLowerCase();

            const matchesSearch = !searchTerm ||
                ciStr.includes(searchTerm) ||
                fullName.includes(searchTerm) ||
                fName.includes(searchTerm) ||
                rName.includes(searchTerm);

            let matchesFilial = selectedFilial === 'all' || m.filial_id === selectedFilial;
            let matchesRol = selectedRol === 'all' || m.rol_fraternal === selectedRol;

            return matchesSearch && matchesFilial && matchesRol;
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
                            <div class="fw-bold text-dark">${m.nombres} ${m.apellidos}</div>
                            <div class="small text-secondary">${m.telefono || 'Sin teléfono'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="fw-bold text-brand font-monospace">${m.ci} ${m.ci_exp || 'LP'}</span>
                </td>
                <td>
                    <span class="badge bg-surface-2 text-dark border border-subtle fw-semibold">
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>${m.filial_nombre || 'Matriz (La Paz)'}
                    </span>
                </td>
                <td>
                    <div class="small text-dark fw-semibold">${m.rol_fraternal || 'Fraterno Titular'}</div>
                    <div class="text-muted" style="font-size:0.75rem;">${m.antiguedad_anios || 1} años</div>
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
                        <button class="btn btn-outline-primary" onclick="window.Miembros.viewMemberDetails('${m.ci}')" title="Ver Ficha y Kardex">
                            <i class="bi bi-person-gear"></i> Ficha & Filial
                        </button>
                        <button class="btn btn-outline-warning text-dark" onclick="window.Miembros.openEditMemberModal('${m.ci}')" title="Editar Fraterno en su totalidad (Directiva)">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                        <button class="btn btn-outline-success" onclick="window.Pagos.openRegisterPaymentModal('${m.ci}')" title="Cobrar Cuota">
                            <i class="bi bi-cash"></i> Cobrar
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        if (filtered.length === 0) {
            html = '<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron fraternos registrados con este criterio de filtro.</td></tr>';
        }

        container.innerHTML = html;
    }

    openMemberKardex(ci) {
        return this.viewMemberDetails(ci);
    }

    viewMemberDetails(ci) {
        const member = window.PortalState.getMemberByCI(ci) || (window.PortalState.getEliminadoByCI ? window.PortalState.getEliminadoByCI(ci) : null);
        if (!member) return;

        this.currentKardexCI = member.ci;
        const isEliminado = member.estado_fraterno === 'eliminado';

        document.getElementById('kardexNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('kardexCI').textContent = `${member.ci} ${member.ci_exp || 'LP'}`;
        const elBloque = document.getElementById('kardexBloque');
        if (elBloque) elBloque.textContent = member.filial_nombre || 'Matriz (La Paz)';
        const elFilial = document.getElementById('kardexFilial');
        if (elFilial) elFilial.textContent = member.filial_nombre || 'Matriz (La Paz)';
        const elRol = document.getElementById('kardexRol');
        if (elRol) {
            elRol.textContent = isEliminado ? `${member.rol_fraternal || 'Fraterno Titular'} (Baja Directiva)` : (member.rol_fraternal || 'Fraterno Titular');
        }
        document.getElementById('kardexAntiguedad').textContent = `${member.antiguedad_anios || 1} años`;
        document.getElementById('kardexTelefono').textContent = member.telefono || 'Sin teléfono';
        document.getElementById('kardexFoto').src = member.foto || 'assets/img/avatar-default.svg';

        // Set form values in reassign section
        const editFilial = document.getElementById('kardexEditFilial');
        if (editFilial) editFilial.value = member.filial_id || 'matriz_lp';

        // Lista de asistencias
        const events = window.PortalState.getEvents();
        let attHtml = '';
        events.forEach(ev => {
            const reg = (member.asistencias && member.asistencias[ev.id]) || { estado: 'pendiente' };
            attHtml += `<div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25">
                <div>
                    <div class="fw-semibold text-dark small">${ev.title}</div>
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
                    <div class="fw-semibold text-dark small">${p.concepto}</div>
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
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    submitReassignFilial() {
        if (!this.currentKardexCI) return;
        const ci = this.currentKardexCI;
        const editFilial = document.getElementById('kardexEditFilial');
        const newFilialId = editFilial ? editFilial.value : 'matriz_lp';

        const filialesDef = (window.DEFAULT_PORTAL_CONFIG && window.DEFAULT_PORTAL_CONFIG.filiales) ? window.DEFAULT_PORTAL_CONFIG.filiales : [];
        const filialObj = filialesDef.find(f => f.id === newFilialId);
        const filialNombre = filialObj ? filialObj.name : 'Matriz (La Paz)';

        try {
            const updated = window.PortalState.updateMember(ci, {
                filial_id: newFilialId,
                filial_nombre: filialNombre
            });

            // Actualizar etiquetas en el modal
            const elFilial = document.getElementById('kardexFilial');
            if (elFilial) elFilial.textContent = filialNombre;

            this.renderControlDirectory();
            window.PortalApp.showToast(`¡Asignación oficial actualizada para ${updated.nombres}! Filial: ${filialNombre}`, 'success');
        } catch (e) {
            window.PortalApp.showToast(e.message, 'danger');
        }
    }

    submitReassignBloqueFilial() {
        return this.submitReassignFilial();
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
        const filialEl = document.getElementById('newMemberFilial');
        const filialId = filialEl ? filialEl.value : 'matriz_lp';
        const rol = document.getElementById('newMemberRol').value;
        const antiguedad = document.getElementById('newMemberAntiguedad').value;

        if (!ci || !nombres || !apellidos) {
            window.PortalApp.showToast('CI, nombres y apellidos son requeridos', 'warning');
            return;
        }

        const filialesDef = (window.DEFAULT_PORTAL_CONFIG && window.DEFAULT_PORTAL_CONFIG.filiales) ? window.DEFAULT_PORTAL_CONFIG.filiales : [];
        const filialObj = filialesDef.find(f => f.id === filialId);
        const filialNombre = filialObj ? filialObj.name : 'Matriz (La Paz)';

        try {
            window.PortalState.addMember({
                ci,
                ci_exp: exp,
                nombres,
                apellidos,
                telefono,
                filial_id: filialId,
                filial_nombre: filialNombre,
                rol_fraternal: rol,
                antiguedad_anios: antiguedad
            });

            const modalEl = document.getElementById('modalNewMember');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
            }

            window.PortalApp.showToast(`¡Fraterno ${nombres} ${apellidos} registrado exitosamente en Filial ${filialNombre}!`);
        } catch (e) {
            window.PortalApp.showToast(e.message, 'danger');
        }
    }

    seedSampleFraternos(count = 10) {
        const added = window.PortalState.seedSampleMembers(count);
        if (added > 0) {
            window.PortalApp.showToast(`¡Se generaron ${added} nuevos fraternos de prueba en el Padrón!`, 'success');
            this.renderControlDirectory();
        } else {
            window.PortalApp.showToast('No se generaron nuevos fraternos.', 'info');
        }
    }

    exportDirectoryCSV() {
        const members = window.PortalState.getMembers();
        let csv = 'CI,Expedido,Nombres,Apellidos,Filial,Rol,Antiguedad,Telefono,Email,Tiene_Usuario,Estado\n';

        members.forEach(m => {
            csv += `"${m.ci}","${m.ci_exp || 'LP'}","${m.nombres}","${m.apellidos}","${m.filial_nombre || 'Matriz (La Paz)'}","${m.rol_fraternal}","${m.antiguedad_anios}","${m.telefono}","${m.email || ''}","${m.has_user_account ? 'SI' : 'NO'}","${m.estado_fraterno}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `padron_fraternos_carnaval_oruro_2027.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.PortalApp.showToast('Padrón descargado en formato CSV compatible con Excel.');
    }

    openCuotasFromKardex() {
        if (!this.currentKardexCI) return;
        const targetCI = this.currentKardexCI;
        const modalEl = document.getElementById('modalMemberKardex');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
        setTimeout(() => {
            if (window.Pagos && window.Pagos.openEditFraternoCuotasModal) {
                window.Pagos.openEditFraternoCuotasModal(targetCI);
            }
        }, 150);
    }

    openEditFromKardex() {
        if (!this.currentKardexCI) return;
        const targetCI = this.currentKardexCI;
        const modalEl = document.getElementById('modalMemberKardex');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
        setTimeout(() => {
            this.openEditMemberModal(targetCI);
        }, 150);
    }

    promptDeleteFromKardex() {
        if (!this.currentKardexCI) return;
        const targetCI = this.currentKardexCI;
        const modalEl = document.getElementById('modalMemberKardex');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
        setTimeout(() => {
            this.promptDeleteMember(targetCI);
        }, 150);
    }

    openEditMemberModal(ci) {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede editar la ficha completa de un fraterno.', 'danger');
            return;
        }

        const member = window.PortalState.getMemberByCI(ci) || (window.PortalState.getEliminadoByCI ? window.PortalState.getEliminadoByCI(ci) : null);
        if (!member) {
            if (window.PortalApp) window.PortalApp.showToast('Fraterno no encontrado para edición.', 'danger');
            return;
        }
        this.currentEditCI = member.ci;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = (val !== undefined && val !== null) ? val : '';
        };

        setVal('editMemberOriginalCI', member.ci);
        setVal('editMemberCI', member.ci);
        setVal('editMemberExp', member.ci_exp || 'LP');
        setVal('editMemberNombres', member.nombres || '');
        setVal('editMemberApellidos', member.apellidos || '');
        setVal('editMemberTelefono', member.telefono || '');
        setVal('editMemberEmail', member.email || '');
        setVal('editMemberFechaNac', member.fecha_nacimiento || '');
        setVal('editMemberFoto', member.foto || '');
        setVal('editMemberContactoEmergencia', member.contacto_emergencia || '');
        setVal('editMemberTelefonoEmergencia', member.telefono_emergencia || '');
        setVal('editMemberAntiguedad', member.antiguedad_anios || 1);
        setVal('editMemberEstado', member.estado_fraterno || 'activo');

        // Manejo dinámico seguro de talla
        const tallaSel = document.getElementById('editMemberTalla');
        if (tallaSel) {
            const targetTalla = member.talla_traje || 'M';
            let exists = Array.from(tallaSel.options).some(o => o.value === targetTalla);
            if (!exists && targetTalla) {
                const opt = document.createElement('option');
                opt.value = targetTalla;
                opt.textContent = targetTalla;
                tallaSel.appendChild(opt);
            }
            tallaSel.value = targetTalla;
        }

        // Manejo dinámico seguro de rol fraternal (evita pérdida de Guía General u otros)
        const rolSel = document.getElementById('editMemberRol');
        if (rolSel) {
            const targetRol = member.rol_fraternal || 'Fraterno Titular';
            let exists = Array.from(rolSel.options).some(o => o.value === targetRol);
            if (!exists && targetRol) {
                const opt = document.createElement('option');
                opt.value = targetRol;
                opt.textContent = targetRol;
                rolSel.appendChild(opt);
            }
            rolSel.value = targetRol;
        }

        // Manejo seguro de filial oficial
        const filialSel = document.getElementById('editMemberFilial');
        if (filialSel) {
            const targetFilial = member.filial_id || 'matriz_lp';
            let exists = Array.from(filialSel.options).some(o => o.value === targetFilial);
            if (!exists && targetFilial) {
                const opt = document.createElement('option');
                opt.value = targetFilial;
                opt.textContent = member.filial_nombre || targetFilial;
                filialSel.appendChild(opt);
            }
            filialSel.value = targetFilial;
        }

        const modalEl = document.getElementById('modalEditMember');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    submitEditMember() {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede modificar datos oficiales.', 'danger');
            return;
        }

        const origCI = (document.getElementById('editMemberOriginalCI') ? document.getElementById('editMemberOriginalCI').value : this.currentEditCI) || '';
        if (!origCI) return;

        const newCI = (document.getElementById('editMemberCI') ? document.getElementById('editMemberCI').value.trim() : '');
        const exp = document.getElementById('editMemberExp') ? document.getElementById('editMemberExp').value : 'LP';
        const nombres = document.getElementById('editMemberNombres') ? document.getElementById('editMemberNombres').value.trim() : '';
        const apellidos = document.getElementById('editMemberApellidos') ? document.getElementById('editMemberApellidos').value.trim() : '';
        const telefono = document.getElementById('editMemberTelefono') ? document.getElementById('editMemberTelefono').value.trim() : '';
        const email = document.getElementById('editMemberEmail') ? document.getElementById('editMemberEmail').value.trim() : '';
        const fechaNac = document.getElementById('editMemberFechaNac') ? document.getElementById('editMemberFechaNac').value : '';
        const talla = document.getElementById('editMemberTalla') ? document.getElementById('editMemberTalla').value : 'M';
        const foto = document.getElementById('editMemberFoto') ? document.getElementById('editMemberFoto').value.trim() : '';
        const contactoEmergencia = document.getElementById('editMemberContactoEmergencia') ? document.getElementById('editMemberContactoEmergencia').value.trim() : '';
        const telEmergencia = document.getElementById('editMemberTelefonoEmergencia') ? document.getElementById('editMemberTelefonoEmergencia').value.trim() : '';
        const filialId = document.getElementById('editMemberFilial') ? document.getElementById('editMemberFilial').value : 'matriz_lp';
        const rol = document.getElementById('editMemberRol') ? document.getElementById('editMemberRol').value : 'Fraterno Titular';
        const antiguedad = document.getElementById('editMemberAntiguedad') ? parseInt(document.getElementById('editMemberAntiguedad').value, 10) || 1 : 1;
        const estado = document.getElementById('editMemberEstado') ? document.getElementById('editMemberEstado').value : 'activo';

        if (!newCI || !nombres || !apellidos) {
            window.PortalApp.showToast('CI, nombres y apellidos son campos obligatorios.', 'warning');
            return;
        }

        const filialesDef = (window.DEFAULT_PORTAL_CONFIG && window.DEFAULT_PORTAL_CONFIG.filiales) ? window.DEFAULT_PORTAL_CONFIG.filiales : [];
        const filialObj = filialesDef.find(f => f.id === filialId);
        const filialNombre = filialObj ? filialObj.name : 'Matriz (La Paz)';

        const updates = {
            ci: newCI,
            ci_exp: exp,
            nombres,
            apellidos,
            telefono,
            email,
            fecha_nacimiento: fechaNac,
            talla_traje: talla,
            foto: foto || 'assets/img/avatar-default.svg',
            contacto_emergencia: contactoEmergencia,
            telefono_emergencia: telEmergencia,
            filial_id: filialId,
            filial_nombre: filialNombre,
            rol_fraternal: rol,
            antiguedad_anios: antiguedad,
            estado_fraterno: estado
        };

        try {
            const updated = window.PortalState.updateMember(origCI, updates);

            // Sincronizar referencias internas
            this.currentEditCI = updated.ci;
            if (this.currentKardexCI === origCI) this.currentKardexCI = updated.ci;
            const origEl = document.getElementById('editMemberOriginalCI');
            if (origEl) origEl.value = updated.ci;

            const modalEl = document.getElementById('modalEditMember');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
                if (bsModal) bsModal.hide();
            }

            this.renderControlDirectory();
            window.PortalApp.showToast(`¡Fraterno ${updated.nombres} ${updated.apellidos} actualizado exitosamente!`, 'success');
        } catch (err) {
            window.PortalApp.showToast(err.message, 'danger');
        }
    }

    promptDeleteMember(ci) {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede dar de baja fraternos.', 'danger');
            return;
        }

        const origInputCI = document.getElementById('editMemberOriginalCI') ? document.getElementById('editMemberOriginalCI').value : null;
        const targetCI = ci || origInputCI || this.currentEditCI || this.currentKardexCI;
        if (!targetCI) return;
        const member = window.PortalState.getMemberByCI(targetCI);
        if (!member) {
            window.PortalApp.showToast('Fraterno no encontrado para dar de baja.', 'danger');
            return;
        }

        this.pendingDeleteCI = member.ci;
        const nombreEl = document.getElementById('confirmDeleteMemberName');
        const ciEl = document.getElementById('confirmDeleteMemberCI');
        const filialEl = document.getElementById('confirmDeleteMemberFilial');
        const motivoInput = document.getElementById('inputDeleteMemberMotivo');

        if (nombreEl) nombreEl.textContent = `${member.nombres} ${member.apellidos}`;
        if (ciEl) ciEl.textContent = `${member.ci} ${member.ci_exp || 'LP'}`;
        if (filialEl) filialEl.textContent = member.filial_nombre || 'Matriz (La Paz)';
        if (motivoInput) motivoInput.value = 'Baja aprobada por Mesa Directiva - Carnaval de Oruro 2027';

        // Cerrar modal de edición o kardex si están abiertos
        const editModalEl = document.getElementById('modalEditMember');
        if (editModalEl && window.bootstrap) {
            const bsEdit = bootstrap.Modal.getInstance(editModalEl) || bootstrap.Modal.getOrCreateInstance(editModalEl);
            if (bsEdit) bsEdit.hide();
        }
        const kardexModalEl = document.getElementById('modalMemberKardex');
        if (kardexModalEl && window.bootstrap) {
            const bsKardex = bootstrap.Modal.getInstance(kardexModalEl) || bootstrap.Modal.getOrCreateInstance(kardexModalEl);
            if (bsKardex) bsKardex.hide();
        }

        setTimeout(() => {
            const modalConfirm = document.getElementById('modalConfirmDeleteMember');
            if (modalConfirm && window.bootstrap) {
                const bsConfirm = bootstrap.Modal.getOrCreateInstance(modalConfirm);
                bsConfirm.show();
            } else {
                if (confirm(`¿Confirma dar de baja y pasar a la Base de Eliminados al fraterno ${member.nombres} ${member.apellidos} (CI: ${member.ci})?`)) {
                    this.submitDeleteMember();
                }
            }
        }, 150);
    }

    submitDeleteMember() {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede procesar bajas.', 'danger');
            return;
        }

        const ci = this.pendingDeleteCI || this.currentEditCI;
        if (!ci) return;
        const motivoInput = document.getElementById('inputDeleteMemberMotivo');
        const motivo = motivoInput ? motivoInput.value.trim() : 'Baja aprobada por Mesa Directiva';

        try {
            const removed = window.PortalState.deleteMember(ci, motivo);

            this.pendingDeleteCI = null;
            this.currentEditCI = null;
            if (this.currentKardexCI === ci) this.currentKardexCI = null;

            const modalConfirm = document.getElementById('modalConfirmDeleteMember');
            if (modalConfirm && window.bootstrap) {
                const bsConfirm = bootstrap.Modal.getInstance(modalConfirm) || bootstrap.Modal.getOrCreateInstance(modalConfirm);
                if (bsConfirm) bsConfirm.hide();
            }

            this.renderControlDirectory();
            window.PortalApp.showToast(`¡Fraterno ${removed.nombres} ${removed.apellidos} pasado a la Base de Eliminados!`, 'warning');
        } catch (err) {
            window.PortalApp.showToast(err.message, 'danger');
        }
    }

    openEliminadosModal() {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva tiene acceso a la Base de Eliminados.', 'danger');
            return;
        }

        this.renderEliminadosTable();
        const modalEl = document.getElementById('modalBaseEliminados');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    renderEliminadosTable() {
        const container = document.getElementById('tableBaseEliminadosBody');
        if (!container) return;

        const eliminados = window.PortalState.getEliminados ? window.PortalState.getEliminados() : [];
        const searchInput = document.getElementById('searchEliminadosInput');
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const filtered = eliminados.filter(m => {
            const fullName = `${m.nombres || ''} ${m.apellidos || ''}`.toLowerCase();
            const ciStr = String(m.ci || '');
            const motivo = String(m.motivo_eliminacion || '').toLowerCase();
            const filial = String(m.filial_nombre || '').toLowerCase();
            const rol = String(m.rol_fraternal || '').toLowerCase();
            return !term || fullName.includes(term) || ciStr.includes(term) || motivo.includes(term) || filial.includes(term) || rol.includes(term);
        });

        const countEl = document.getElementById('countEliminadosTotal');
        if (countEl) countEl.textContent = eliminados.length;
        const badgeEl = document.getElementById('badgeCountEliminados');
        if (badgeEl) badgeEl.textContent = eliminados.length;

        if (filtered.length === 0) {
            container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-folder-x fs-3 d-block mb-2 text-secondary opacity-50"></i>
                No hay fraternos en la base de eliminados${term ? ' que coincidan con la búsqueda' : ''}.
            </td></tr>`;
            return;
        }

        let html = '';
        filtered.forEach(m => {
            const fechaStr = m.fecha_eliminacion ? new Date(m.fecha_eliminacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fecha no registrada';
            html += `
            <tr class="align-middle">
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${m.foto || 'assets/img/avatar-default.svg'}" class="rounded-circle border border-danger opacity-75" width="36" height="36" alt="Avatar">
                        <div>
                            <div class="fw-bold text-dark">${m.nombres} ${m.apellidos}</div>
                            <div class="small text-muted">${m.telefono || 'Sin teléfono'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="fw-bold text-brand font-monospace">${m.ci} ${m.ci_exp || 'LP'}</span>
                </td>
                <td>
                    <span class="badge bg-secondary bg-opacity-10 text-dark border border-subtle">
                        ${m.filial_nombre || 'Matriz (La Paz)'}
                    </span>
                    <div class="text-muted small mt-1" style="font-size:0.75rem;">${m.rol_fraternal || 'Fraterno Titular'}</div>
                </td>
                <td>
                    <div class="small text-dark fw-semibold">${fechaStr}</div>
                    <div class="text-muted" style="font-size:0.75rem;">Por: ${m.eliminado_por || 'Mesa Directiva'}</div>
                </td>
                <td>
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle text-wrap" style="max-width:220px;text-align:left;">
                        ${m.motivo_eliminacion || 'Baja por Mesa Directiva'}
                    </span>
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" onclick="window.Miembros.restoreMember('${m.ci}')" title="Restaurar al Padrón Activo">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Restaurar
                        </button>
                        <button class="btn btn-outline-danger" onclick="window.Miembros.permanentlyDeleteMember('${m.ci}')" title="Purgar definitivamente de la base">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });

        container.innerHTML = html;
    }

    restoreMember(ci) {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede restaurar fraternos.', 'danger');
            return;
        }

        try {
            const restored = window.PortalState.restoreMember(ci);
            this.renderControlDirectory();
            this.renderEliminadosTable();
            window.PortalApp.showToast(`¡Fraterno ${restored.nombres} ${restored.apellidos} restaurado con éxito al Padrón activo!`, 'success');
        } catch (err) {
            window.PortalApp.showToast(err.message, 'danger');
        }
    }

    permanentlyDeleteMember(ci) {
        const session = window.PortalState ? window.PortalState.getSession() : null;
        if (!session || session.role !== 'control') {
            if (window.PortalApp) window.PortalApp.showToast('Acceso restringido: Solo la Mesa Directiva puede purgar registros.', 'danger');
            return;
        }

        if (!confirm(`¿Está seguro de eliminar definitivamente al fraterno con CI ${ci}? Esta acción no se puede deshacer.`)) {
            return;
        }
        const ok = window.PortalState.permanentlyDeleteEliminado(ci);
        if (ok) {
            this.renderEliminadosTable();
            const badgeEl = document.getElementById('badgeCountEliminados');
            if (badgeEl && window.PortalState.getEliminados) {
                badgeEl.textContent = window.PortalState.getEliminados().length;
            }
            window.PortalApp.showToast('Registro purgado permanentemente de la base de datos.', 'info');
        }
    }
}

window.Miembros = new MiembrosManager();
