/**
 * MÓDULO DE PAGOS Y CUOTAS FRATERNALES
 * Gestiona aportes, saldos, emisión de recibos y estado de cuentas.
 */

class PagosManager {
    constructor() {
        this.init();
    }

    init() {
        window.PortalState.subscribe(() => {
            const session = window.PortalState.getSession();
            if (session) {
                if (session.role === 'miembro') this.renderMemberPayments();
                if (session.role === 'control') this.renderControlPayments();
            }
        });
    }

    // --- VISTA FRATERNO / MIEMBRO ---
    renderMemberPayments() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        const cuotasDef = window.PortalState.state.cuotas_definidas || [];
        const containerCuotas = document.getElementById('memberCuotasCards');
        const containerRecibos = document.getElementById('memberReceiptsTableBody');

        let totalAportado = 0;
        let totalObligatorio = 0;

        // Calcular total obligatorio definido
        cuotasDef.forEach(c => totalObligatorio += c.monto);

        // Sumar pagos realizados
        const pagos = member.pagos || [];
        pagos.forEach(p => {
            totalAportado += parseFloat(p.monto) || 0;
        });

        const saldoPendiente = Math.max(0, totalObligatorio - totalAportado);
        const porcentajePago = totalObligatorio > 0 ? Math.min(100, Math.round((totalAportado / totalObligatorio) * 100)) : 100;

        // Actualizar indicadores principales
        const elTotalAportado = document.getElementById('memberTotalAportado');
        const elSaldoPendiente = document.getElementById('memberSaldoPendiente');
        const elPctPagos = document.getElementById('memberPctPagos');
        const elBarraPagos = document.getElementById('memberBarraPagos');
        const elEstadoFinanciero = document.getElementById('memberEstadoFinancieroBadge');

        if (elTotalAportado) elTotalAportado.textContent = `Bs. ${totalAportado.toLocaleString('es-BO')}`;
        if (elSaldoPendiente) elSaldoPendiente.textContent = `Bs. ${saldoPendiente.toLocaleString('es-BO')}`;
        if (elPctPagos) elPctPagos.textContent = `${porcentajePago}%`;
        if (elBarraPagos) {
            elBarraPagos.style.width = `${porcentajePago}%`;
            elBarraPagos.className = `progress-bar progress-bar-striped progress-bar-animated ${porcentajePago >= 80 ? 'bg-success' : (porcentajePago >= 50 ? 'bg-brand' : 'bg-danger')}`;
        }
        if (elEstadoFinanciero) {
            if (saldoPendiente === 0) {
                elEstadoFinanciero.innerHTML = '<span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill"><i class="bi bi-check-circle-fill me-1"></i> CUOTAS 100% AL DÍA</span>';
            } else if (porcentajePago >= 60) {
                elEstadoFinanciero.innerHTML = '<span class="chip-warning px-3 py-2 rounded-pill"><i class="bi bi-clock-history me-1"></i> PAGO PARCIAL (SALDO PENDIENTE)</span>';
            } else {
                elEstadoFinanciero.innerHTML = '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-2 rounded-pill"><i class="bi bi-exclamation-triangle-fill me-1"></i> PAGO ATRASADO</span>';
            }
        }

        // Renderizar tarjetas de cuotas requeridas
        if (containerCuotas) {
            let htmlCuotas = '';
            const pendingVouchers = member.vouchers_pendientes || [];

            cuotasDef.forEach(c => {
                // Buscar si se pagó esta cuota
                const pagosDeEstaCuota = pagos.filter(p => p.cuota_id === c.id);
                const pagadoEnEsta = pagosDeEstaCuota.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
                const pendienteEnEsta = Math.max(0, c.monto - pagadoEnEsta);
                const voucherPendiente = pendingVouchers.find(v => v.cuota_id === c.id);

                let badge = '';
                if (pendienteEnEsta === 0) {
                    badge = '<span class="badge bg-success px-3 py-1 rounded-pill"><i class="bi bi-check2 me-1"></i>Completado</span>';
                } else if (voucherPendiente) {
                    badge = `<span class="badge bg-warning text-dark px-3 py-1 rounded-pill"><i class="bi bi-clock-history me-1"></i>En Verificación (Bs. ${voucherPendiente.monto})</span>`;
                } else if (pagadoEnEsta > 0) {
                    badge = `<span class="chip-warning px-3 py-1 rounded-pill"><i class="bi bi-pie-chart me-1"></i>Abonado Bs. ${pagadoEnEsta}</span>`;
                } else {
                    badge = '<span class="badge bg-danger px-3 py-1 rounded-pill"><i class="bi bi-hourglass-split me-1"></i>Sin Pagar</span>';
                }

                let actionButtons = '';
                if (pendienteEnEsta > 0) {
                    if (voucherPendiente) {
                        actionButtons = `
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-outline-info btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.openViewVoucherModal('${member.ci}', '${voucherPendiente.id}', false)">
                                <i class="bi bi-eye me-1"></i> Ver Enviado
                            </button>
                            <button class="btn btn-outline-warning btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.openUploadVoucherModal('${c.id}', '${c.title}', ${pendienteEnEsta})">
                                <i class="bi bi-pencil me-1"></i> Reemplazar
                            </button>
                        </div>`;
                    } else {
                        actionButtons = `
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-brand-subtle btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.showBankQRModal('${c.title}', ${pendienteEnEsta})">
                                <i class="bi bi-qr-code me-1"></i> QR
                            </button>
                            <button class="btn btn-portal-primary btn-sm flex-grow-1 rounded-pill" style="width: auto;" onclick="window.Pagos.openUploadVoucherModal('${c.id}', '${c.title}', ${pendienteEnEsta})">
                                <i class="bi bi-upload me-1"></i> Cargar Voucher
                            </button>
                        </div>`;
                    }
                }

                htmlCuotas += `
                <div class="col-md-6 mb-3">
                    <div class="card bg-surface-1 border border-subtle p-3 rounded-4 h-100 hover-scale-sm">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-brand fw-bold small text-uppercase">${c.id.replace('_', ' ')}</span>
                            ${badge}
                        </div>
                        <h6 class="fw-bold text-dark mb-2">${c.title}</h6>
                        <div class="d-flex justify-content-between align-items-baseline mb-2">
                            <span class="text-secondary small">Monto Total:</span>
                            <span class="fs-5 fw-bold text-dark">Bs. ${c.monto}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-baseline text-secondary small mb-3">
                            <span>Vencimiento: ${c.vencimiento}</span>
                            <span class="${pendienteEnEsta > 0 ? 'text-danger fw-semibold' : 'text-success'}">
                                ${pendienteEnEsta > 0 ? `Resta: Bs. ${pendienteEnEsta}` : 'Cancelado'}
                            </span>
                        </div>
                        ${actionButtons}
                    </div>
                </div>`;
            });
            containerCuotas.innerHTML = htmlCuotas;
        }

        // Renderizar tabla de comprobantes / recibos
        if (containerRecibos) {
            let htmlRecibos = '';
            pagos.forEach(p => {
                htmlRecibos += `
                <tr class="align-middle">
                    <td>
                        <span class="badge bg-surface-2 text-brand border border-subtle font-monospace">${p.nro_recibo || p.id}</span>
                    </td>
                    <td class="text-dark fw-semibold">${p.concepto}</td>
                    <td class="text-brand fw-bold">Bs. ${p.monto.toLocaleString('es-BO')}</td>
                    <td class="text-secondary small">${p.fecha}</td>
                    <td>
                        <span class="badge bg-surface-2 border border-subtle text-dark small">${p.metodo}</span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="window.Pagos.viewDigitalReceipt('${p.id}')">
                            <i class="bi bi-receipt me-1"></i> Ver Recibo
                        </button>
                    </td>
                </tr>`;
            });

            if (pagos.length === 0) {
                htmlRecibos = '<tr><td colspan="6" class="text-center text-muted py-4">Aún no registra pagos o comprobantes.</td></tr>';
            }
            containerRecibos.innerHTML = htmlRecibos;
        }
    }

    // --- VISTA CONTROL / DIRECTIVA ---
    renderControlPayments() {
        const members = window.PortalState.getMembers();
        const cuotasDef = window.PortalState.state.cuotas_definidas || [];
        let montoTotalDefinidoPorMiembro = 0;
        cuotasDef.forEach(c => montoTotalDefinidoPorMiembro += c.monto);

        let totalRecaudado = 0;
        let totalProyectado = montoTotalDefinidoPorMiembro * members.length;
        let fraternosAlDia = 0;
        let fraternosConSaldo = 0;

        members.forEach(m => {
            const pagos = m.pagos || [];
            const pagado = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
            totalRecaudado += pagado;
            if (pagado >= montoTotalDefinidoPorMiembro) fraternosAlDia++;
            else fraternosConSaldo++;
        });

        // Actualizar barra de métricas financieras de control
        const elRecaudado = document.getElementById('controlFinRecaudado');
        const elProyectado = document.getElementById('controlFinProyectado');
        const elAlDia = document.getElementById('controlFinAlDia');
        const elMorosos = document.getElementById('controlFinMorosos');

        if (elRecaudado) elRecaudado.textContent = `Bs. ${totalRecaudado.toLocaleString('es-BO')}`;
        if (elProyectado) elProyectado.textContent = `Bs. ${totalProyectado.toLocaleString('es-BO')}`;
        if (elAlDia) elAlDia.textContent = `${fraternosAlDia} fraternos`;
        if (elMorosos) elMorosos.textContent = `${fraternosConSaldo} con saldo`;

        // Renderizar tabla de ingresos generales confirmados
        const tableBody = document.getElementById('controlPaymentsTableBody');
        if (tableBody) {
            let allPayments = [];
            members.forEach(m => {
                (m.pagos || []).forEach(p => {
                    allPayments.push({
                        ...p,
                        member_ci: m.ci,
                        member_nombre: `${m.nombres} ${m.apellidos}`,
                        bloque_nombre: m.bloque_nombre
                    });
                });
            });

            allPayments.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            let html = '';
            allPayments.forEach(p => {
                html += `
                <tr class="align-middle">
                    <td>
                        <span class="badge bg-dark text-brand border border-brand-subtle font-monospace">${p.nro_recibo || p.id}</span>
                    </td>
                    <td>
                        <div class="fw-bold text-dark">${p.member_nombre}</div>
                        <div class="small text-secondary">CI: ${p.member_ci} &bull; ${p.bloque_nombre}</div>
                    </td>
                    <td class="text-dark">${p.concepto}</td>
                    <td class="text-brand fw-bold">Bs. ${p.monto.toLocaleString('es-BO')}</td>
                    <td class="text-secondary small">${p.fecha}</td>
                    <td><span class="badge bg-surface-2 border border-subtle text-dark">${p.metodo}</span></td>
                    <td class="text-end">
                        <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="window.Pagos.viewDigitalReceipt('${p.id}', '${p.member_ci}')">
                            <i class="bi bi-eye me-1"></i> Recibo
                        </button>
                    </td>
                </tr>`;
            });

            if (allPayments.length === 0) {
                html = '<tr><td colspan="7" class="text-center text-muted py-4">No se han registrado pagos aún.</td></tr>';
            }
            tableBody.innerHTML = html;
        }

        // Renderizar tabla de vouchers pendientes por verificar
        const vouchersTableBody = document.getElementById('controlVouchersTableBody');
        const pendingVouchers = window.PortalState.getPendingVouchers();
        const badgePending = document.getElementById('badgePendingVouchersCount');
        if (badgePending) badgePending.textContent = pendingVouchers.length;

        if (vouchersTableBody) {
            let htmlVouchers = '';
            pendingVouchers.forEach(v => {
                htmlVouchers += `
                <tr class="align-middle">
                    <td>
                        <div class="fw-bold text-dark">${v.member_nombre}</div>
                        <div class="small text-secondary">CI: ${v.member_ci}</div>
                    </td>
                    <td><span class="badge bg-surface-2 text-dark border border-subtle">${v.bloque_nombre}</span></td>
                    <td class="text-dark">${v.concepto}</td>
                    <td class="text-success fw-bold">Bs. ${v.monto.toLocaleString('es-BO')}</td>
                    <td class="text-secondary small">${v.fecha}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info rounded-pill" onclick="window.Pagos.openViewVoucherModal('${v.member_ci}', '${v.id}', true)">
                            <i class="bi bi-image me-1"></i> Ver Imagen
                        </button>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success rounded-pill me-1" onclick="window.Pagos.confirmVoucherDirectly('${v.member_ci}', '${v.id}')">
                            <i class="bi bi-check2 me-1"></i> Confirmar
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="window.Pagos.rejectVoucherDirectly('${v.member_ci}', '${v.id}')">
                            <i class="bi bi-x me-1"></i> Rechazar
                        </button>
                    </td>
                </tr>`;
            });

            if (pendingVouchers.length === 0) {
                htmlVouchers = '<tr><td colspan="7" class="text-center text-muted py-4">No hay comprobantes pendientes de verificación.</td></tr>';
            }
            vouchersTableBody.innerHTML = htmlVouchers;
        }

        // Poblar lista desplegable de miembros para registro rápido de cobro
        this.populatePaymentMemberSelect();
    }

    populatePaymentMemberSelect() {
        const sel = document.getElementById('selectNewPaymentMember');
        if (!sel) return;
        const members = window.PortalState.getMembers();
        sel.innerHTML = '<option value="">-- Seleccionar Fraterno / CI --</option>' + 
            members.map(m => `<option value="${m.ci}">${m.nombres} ${m.apellidos} (CI: ${m.ci}) - ${m.bloque_nombre}</option>`).join('');
    }

    openRegisterPaymentModal(prefillCI = '') {
        const modalEl = document.getElementById('modalRegisterPayment');
        if (!modalEl || !window.bootstrap) return;

        this.populatePaymentMemberSelect();
        const sel = document.getElementById('selectNewPaymentMember');
        if (prefillCI && sel) sel.value = prefillCI;

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    }

    submitNewPayment() {
        const selMember = document.getElementById('selectNewPaymentMember');
        const selCuota = document.getElementById('selectNewPaymentCuota');
        const inputMonto = document.getElementById('inputNewPaymentMonto');
        const selMetodo = document.getElementById('selectNewPaymentMetodo');

        const ci = selMember ? selMember.value : '';
        const cuotaId = selCuota ? selCuota.value : '';
        const monto = inputMonto ? parseFloat(inputMonto.value) : 0;
        const metodo = selMetodo ? selMetodo.value : 'Efectivo';

        if (!ci) {
            window.PortalApp.showToast('Seleccione un fraterno', 'warning');
            return;
        }
        if (!cuotaId) {
            window.PortalApp.showToast('Seleccione el concepto de cuota', 'warning');
            return;
        }
        if (!monto || monto <= 0) {
            window.PortalApp.showToast('Ingrese un monto válido mayor a 0', 'warning');
            return;
        }

        const cuotasDef = window.PortalState.state.cuotas_definidas || [];
        const cuota = cuotasDef.find(c => c.id === cuotaId);
        const concepto = cuota ? cuota.title : 'Aporte Fraternal';

        const payment = window.PortalState.registerPayment(ci, {
            cuota_id: cuotaId,
            concepto: concepto,
            monto: monto,
            metodo: metodo,
            cajero: 'Secretaría de Control'
        });

        // Cerrar modal
        const modalEl = document.getElementById('modalRegisterPayment');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }

        window.PortalApp.showToast(`¡Pago de Bs. ${monto} registrado exitosamente! Recibo: ${payment.nro_recibo}`);
        this.viewDigitalReceipt(payment.id, ci);
    }

    viewDigitalReceipt(paymentId, memberCI = null) {
        let member = null;
        let payment = null;

        if (memberCI) {
            member = window.PortalState.getMemberByCI(memberCI);
            if (member) payment = (member.pagos || []).find(p => p.id === paymentId);
        } else {
            const session = window.PortalState.getSession();
            if (session && session.ci) {
                member = window.PortalState.getMemberByCI(session.ci);
                if (member) payment = (member.pagos || []).find(p => p.id === paymentId);
            }
            // Si aún no se encuentra, buscar en todos
            if (!payment) {
                const members = window.PortalState.getMembers();
                for (const m of members) {
                    const found = (m.pagos || []).find(p => p.id === paymentId);
                    if (found) {
                        member = m;
                        payment = found;
                        break;
                    }
                }
            }
        }

        if (!payment || !member) {
            window.PortalApp.showToast('Comprobante no encontrado', 'danger');
            return;
        }

        const theme = window.PortalState.getCurrentTheme();

        // Inyectar datos en modal de recibo oficial
        document.getElementById('reciboNroDoc').textContent = payment.nro_recibo || payment.id;
        document.getElementById('reciboFecha').textContent = payment.fecha;
        document.getElementById('reciboFraternoNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('reciboFraternoCI').textContent = `${member.ci} ${member.ci_exp}`;
        document.getElementById('reciboBloque').textContent = member.bloque_nombre;
        document.getElementById('reciboConcepto').textContent = payment.concepto;
        document.getElementById('reciboMonto').textContent = `Bs. ${payment.monto.toLocaleString('es-BO')}`;
        document.getElementById('reciboMetodo').textContent = payment.metodo;
        document.getElementById('reciboFraternidadHeader').textContent = theme.name;

        const modalEl = document.getElementById('modalDigitalReceipt');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    showBankQRModal(concepto, monto) {
        const theme = window.PortalState.getCurrentTheme();
        document.getElementById('bankQRConcepto').textContent = concepto;
        document.getElementById('bankQRMonto').textContent = `Bs. ${monto}`;
        document.getElementById('bankQRFraternidad').textContent = theme.name;

        const modalEl = document.getElementById('modalBankQR');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    // --- GESTIÓN DE VOUCHERS Y VERIFICACIÓN DE PAGOS ---
    handleVoucherFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.tempVoucherFileBase64 = e.target.result;
            const previewImg = document.getElementById('uploadVoucherPreviewImg');
            const previewContainer = document.getElementById('uploadVoucherPreviewContainer');
            if (previewImg) previewImg.src = this.tempVoucherFileBase64;
            if (previewContainer) previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    openUploadVoucherModal(cuotaId, cuotaTitle, maxMonto) {
        const session = window.PortalState.getSession();
        if (!session || !session.ci) {
            window.PortalApp.showToast('Debe iniciar sesión como fraterno', 'warning');
            return;
        }

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        document.getElementById('uploadVoucherCuotaId').value = cuotaId;
        document.getElementById('uploadVoucherCuotaTitle').value = cuotaTitle;
        document.getElementById('uploadVoucherMonto').value = maxMonto;
        document.getElementById('uploadVoucherFotoInput').value = '';

        const pendingVoucher = (member.vouchers_pendientes || []).find(v => v.cuota_id === cuotaId);
        const previewImg = document.getElementById('uploadVoucherPreviewImg');
        const previewContainer = document.getElementById('uploadVoucherPreviewContainer');

        if (pendingVoucher && pendingVoucher.foto_base64) {
            this.tempVoucherFileBase64 = pendingVoucher.foto_base64;
            if (previewImg) previewImg.src = pendingVoucher.foto_base64;
            if (previewContainer) previewContainer.classList.remove('d-none');
            if (pendingVoucher.monto) document.getElementById('uploadVoucherMonto').value = pendingVoucher.monto;
        } else {
            this.tempVoucherFileBase64 = null;
            if (previewContainer) previewContainer.classList.add('d-none');
        }

        const modalEl = document.getElementById('modalUploadVoucher');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    submitVoucherForm() {
        const session = window.PortalState.getSession();
        if (!session || !session.ci) return;

        const cuotaId = document.getElementById('uploadVoucherCuotaId').value;
        const cuotaTitle = document.getElementById('uploadVoucherCuotaTitle').value;
        const monto = parseFloat(document.getElementById('uploadVoucherMonto').value);

        if (!cuotaId || !monto || monto <= 0) {
            window.PortalApp.showToast('Ingrese un monto válido depositado', 'warning');
            return;
        }

        if (!this.tempVoucherFileBase64) {
            window.PortalApp.showToast('Por favor adjunte una imagen clara de su comprobante', 'warning');
            return;
        }

        window.PortalState.submitVoucher(session.ci, {
            cuota_id: cuotaId,
            concepto: cuotaTitle,
            monto: monto,
            foto_base64: this.tempVoucherFileBase64
        });

        const modalEl = document.getElementById('modalUploadVoucher');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }

        window.PortalApp.showToast('¡Comprobante enviado exitosamente! La directiva lo verificará en breve.');
        this.renderMemberPayments();
    }

    openViewVoucherModal(ci, voucherId, isDirectiva = false) {
        const member = window.PortalState.getMemberByCI(ci);
        if (!member) return;

        const voucher = (member.vouchers_pendientes || []).find(v => v.id === voucherId);
        if (!voucher) {
            window.PortalApp.showToast('Voucher no encontrado', 'danger');
            return;
        }

        this.activeVoucherCI = ci;
        this.activeVoucherId = voucherId;

        document.getElementById('viewVoucherImgSrc').src = voucher.foto_base64 || '';
        document.getElementById('viewVoucherFraternoNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('viewVoucherFraternoCI').textContent = member.ci;
        document.getElementById('viewVoucherCuota').textContent = voucher.concepto;
        document.getElementById('viewVoucherMonto').textContent = `Bs. ${voucher.monto.toLocaleString('es-BO')}`;

        const actionsEl = document.getElementById('viewVoucherDirectivaActions');
        if (actionsEl) {
            if (isDirectiva) actionsEl.classList.remove('d-none');
            else actionsEl.classList.add('d-none');
        }

        const modalEl = document.getElementById('modalViewVoucherImage');
        if (modalEl && window.bootstrap) {
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    confirmCurrentVoucher() {
        if (!this.activeVoucherCI || !this.activeVoucherId) return;
        this.confirmVoucherDirectly(this.activeVoucherCI, this.activeVoucherId);

        const modalEl = document.getElementById('modalViewVoucherImage');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
    }

    rejectCurrentVoucher() {
        if (!this.activeVoucherCI || !this.activeVoucherId) return;
        this.rejectVoucherDirectly(this.activeVoucherCI, this.activeVoucherId);

        const modalEl = document.getElementById('modalViewVoucherImage');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
    }

    confirmVoucherDirectly(ci, voucherId) {
        try {
            const payment = window.PortalState.confirmVoucher(ci, voucherId);
            window.PortalApp.showToast(`Pago de Bs. ${payment.monto} verificado y confirmado exitosamente.`);
            this.renderControlPayments();
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al confirmar comprobante', 'danger');
        }
    }

    rejectVoucherDirectly(ci, voucherId) {
        try {
            window.PortalState.rejectVoucher(ci, voucherId);
            window.PortalApp.showToast('Comprobante rechazado. Se habilitó al fraterno para volver a intentar.', 'info');
            this.renderControlPayments();
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al rechazar comprobante', 'danger');
        }
    }
}

window.Pagos = new PagosManager();
