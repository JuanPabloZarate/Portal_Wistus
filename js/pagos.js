/**
 * MÓDULO DE PAGOS, CUOTAS Y CONCILIACIÓN FRATERNAL BOOST
 * Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus
 * Gestiona aportes, saldos, emisión de recibos oficiales, generación dinámica de QR,
 * carga y validación de vouchers con zoom, observaciones de tesorería y conciliación de directorio.
 */

class PagosManager {
    constructor() {
        this.activeVoucherCI = null;
        this.activeVoucherId = null;
        this.tempVoucherFileBase64 = null;
        this.voucherZoomLevel = 1.0;
        this.controlPaymentsFilter = {
            search: '',
            bloque: 'all',
            cuota: 'all',
            metodo: 'all',
            fechaDesde: '',
            fechaHasta: ''
        };
        this.memberReceiptsFilter = {
            search: ''
        };
        this.activeQRConfig = {
            concepto: '',
            monto: 0,
            cuotaId: '',
            memberCI: ''
        };

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

        document.addEventListener('DOMContentLoaded', () => {
            this.bindEvents();
        });
    }

    bindEvents() {
        // Drag & Drop para modal de voucher
        const dropZone = document.getElementById('uploadVoucherDropZone');
        const fileInput = document.getElementById('uploadVoucherFotoInput');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('border-brand', 'bg-brand-subtle');
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('border-brand', 'bg-brand-subtle');
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-brand', 'bg-brand-subtle');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    this.handleVoucherFileSelect({ target: { files: e.dataTransfer.files } });
                }
            });
        }

        // Input reactivo de monto dinámico para QR
        const qrMontoInput = document.getElementById('bankQRMontoInput');
        if (qrMontoInput) {
            qrMontoInput.addEventListener('input', (e) => {
                const nuevoMonto = parseFloat(e.target.value) || 0;
                this.activeQRConfig.monto = nuevoMonto;
                this.regenerateDynamicQR();
            });
        }

        // Búsqueda en recibos de fraterno
        const searchReceiptsInput = document.getElementById('searchMemberReceiptsInput');
        if (searchReceiptsInput) {
            searchReceiptsInput.addEventListener('input', (e) => {
                this.memberReceiptsFilter.search = e.target.value.toLowerCase().trim();
                this.renderMemberReceiptsList();
            });
        }
    }

    // =========================================================================
    // 1. VISTA FRATERNO / MIEMBRO (PORTAL DE PAGOS PERSONAL)
    // =========================================================================
    renderMemberPayments() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        const cuotasDef = window.PortalState.getCuotas();
        const containerCuotas = document.getElementById('memberCuotasCards');

        let totalAportado = 0;
        let totalObligatorio = 0;

        // Calcular total obligatorio definido
        cuotasDef.forEach(c => {
            if (c.obligatorio !== false) {
                totalObligatorio += (parseFloat(c.monto) || 0);
            }
        });

        // Sumar pagos realizados
        const pagos = member.pagos || [];
        pagos.forEach(p => {
            totalAportado += parseFloat(p.monto) || 0;
        });

        const saldoPendiente = Math.max(0, totalObligatorio - totalAportado);
        const porcentajePago = totalObligatorio > 0 ? Math.min(100, Math.round((totalAportado / totalObligatorio) * 100)) : 100;

        // Actualizar indicadores principales (en Dashboard y en Pestaña Pagos)
        const elTotalAportado = document.getElementById('memberTotalAportado');
        const elPagosTotalAportado = document.getElementById('memberPagosTotalAportado');
        const elSaldoPendiente = document.getElementById('memberSaldoPendiente');
        const elPagosSaldoPendiente = document.getElementById('memberPagosSaldoPendiente');
        const elPctPagos = document.getElementById('memberPctPagos');
        const elBarraPagos = document.getElementById('memberBarraPagos');
        const elEstadoFinanciero = document.getElementById('memberEstadoFinancieroBadge');

        const totalAportadoStr = `Bs. ${totalAportado.toLocaleString('es-BO')}`;
        const saldoPendienteStr = `Bs. ${saldoPendiente.toLocaleString('es-BO')}`;

        if (elTotalAportado) elTotalAportado.textContent = totalAportadoStr;
        if (elPagosTotalAportado) elPagosTotalAportado.textContent = totalAportadoStr;
        if (elSaldoPendiente) elSaldoPendiente.textContent = saldoPendienteStr;
        if (elPagosSaldoPendiente) elPagosSaldoPendiente.textContent = saldoPendienteStr;
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
            const rejectedVouchers = member.vouchers_rechazados || [];

            cuotasDef.forEach(c => {
                const pagosDeEstaCuota = pagos.filter(p => p.cuota_id === c.id);
                const pagadoEnEsta = pagosDeEstaCuota.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
                const pendienteEnEsta = Math.max(0, c.monto - pagadoEnEsta);
                const porcentajeCuota = c.monto > 0 ? Math.min(100, Math.round((pagadoEnEsta / c.monto) * 100)) : 100;
                const voucherPendiente = pendingVouchers.find(v => v.cuota_id === c.id);
                const voucherRechazado = rejectedVouchers.find(v => v.cuota_id === c.id);

                let badge = '';
                if (pendienteEnEsta === 0) {
                    badge = '<span class="badge badge-socavon-gold px-3 py-1 rounded-pill"><i class="bi bi-check2-circle me-1"></i>Completado (Al día)</span>';
                } else if (voucherPendiente) {
                    badge = `<span class="badge bg-warning text-dark px-3 py-1 rounded-pill"><i class="bi bi-clock-history me-1"></i>En Verificación (Bs. ${voucherPendiente.monto})</span>`;
                } else if (pagadoEnEsta > 0) {
                    badge = `<span class="chip-warning px-3 py-1 rounded-pill"><i class="bi bi-pie-chart me-1"></i>Abonado Bs. ${pagadoEnEsta} (${porcentajeCuota}%)</span>`;
                } else {
                    badge = '<span class="badge bg-danger px-3 py-1 rounded-pill"><i class="bi bi-hourglass-split me-1"></i>Sin Pagar</span>';
                }

                let feedbackRechazo = '';
                if (voucherRechazado && pendienteEnEsta > 0 && !voucherPendiente) {
                    feedbackRechazo = `
                    <div class="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-25 py-2 px-3 rounded-3 small mb-3">
                        <div class="fw-bold text-danger mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i> Comprobante Observado por Tesorería:</div>
                        <div class="text-dark">${voucherRechazado.motivo || 'Verifica la imagen o el monto y vuelve a enviarlo.'}</div>
                    </div>`;
                }

                let progressBarHtml = '';
                if (pendienteEnEsta > 0 && pagadoEnEsta > 0) {
                    progressBarHtml = `
                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentajeCuota}%"></div>
                    </div>`;
                }

                let actionButtons = '';
                if (pendienteEnEsta > 0) {
                    if (voucherPendiente) {
                        actionButtons = `
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-outline-info btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.openViewVoucherModal('${member.ci}', '${voucherPendiente.id}', false)">
                                <i class="bi bi-eye me-1"></i> Ver Enviado
                            </button>
                            <button class="btn btn-outline-warning btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.openUploadVoucherModal('${c.id}', '${c.title.replace(/'/g, "\\'")}', ${pendienteEnEsta})">
                                <i class="bi bi-pencil me-1"></i> Reemplazar
                            </button>
                        </div>`;
                    } else {
                        actionButtons = `
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-brand-subtle btn-sm flex-grow-1 rounded-pill" onclick="window.Pagos.showBankQRModal('${c.title.replace(/'/g, "\\'")}', ${pendienteEnEsta}, '${c.id}')">
                                <i class="bi bi-qr-code me-1"></i> Generar QR
                            </button>
                            <button class="btn btn-portal-primary btn-sm flex-grow-1 rounded-pill" style="width: auto;" onclick="window.Pagos.openUploadVoucherModal('${c.id}', '${c.title.replace(/'/g, "\\'")}', ${pendienteEnEsta})">
                                <i class="bi bi-upload me-1"></i> Subir Voucher
                            </button>
                        </div>`;
                    }
                }

                const cardBorderClass = pendienteEnEsta === 0 ? 'border-gold border-2' : 'border-subtle';

                htmlCuotas += `
                <div class="col-md-6 mb-3">
                    <div class="card bg-surface-1 border ${cardBorderClass} p-3 rounded-4 h-100 hover-scale-sm shadow-sm">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-brand fw-bold small text-uppercase"><i class="bi bi-tag-fill me-1"></i>${c.categoria || 'Cuota'}</span>
                            ${badge}
                        </div>
                        <h6 class="fw-bold text-dark mb-2">${c.title}</h6>
                        <div class="d-flex justify-content-between align-items-baseline mb-2">
                            <span class="text-secondary small">Monto Total:</span>
                            <span class="fs-5 fw-bold text-dark">Bs. ${c.monto.toLocaleString('es-BO')}</span>
                        </div>
                        ${progressBarHtml}
                        <div class="d-flex justify-content-between align-items-baseline text-secondary small mb-3">
                            <span><i class="bi bi-calendar3 me-1"></i>Vence: ${c.vencimiento}</span>
                            <span class="${pendienteEnEsta > 0 ? 'text-danger fw-semibold' : 'text-success fw-semibold'}">
                                ${pendienteEnEsta > 0 ? `Resta: Bs. ${pendienteEnEsta.toLocaleString('es-BO')}` : '¡Cancelado Totalmente!'}
                            </span>
                        </div>
                        ${feedbackRechazo}
                        ${actionButtons}
                    </div>
                </div>`;
            });
            containerCuotas.innerHTML = htmlCuotas;
        }

        // Renderizar tabla de comprobantes / recibos
        this.renderMemberReceiptsList();
    }

    renderMemberReceiptsList() {
        const session = window.PortalState.getSession();
        if (!session || session.role !== 'miembro') return;

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        const containerRecibos = document.getElementById('memberReceiptsTableBody');
        if (!containerRecibos) return;

        let pagos = member.pagos || [];
        const q = (this.memberReceiptsFilter.search || '').toLowerCase();

        if (q) {
            pagos = pagos.filter(p => 
                (p.nro_recibo && p.nro_recibo.toLowerCase().includes(q)) ||
                (p.concepto && p.concepto.toLowerCase().includes(q)) ||
                (p.metodo && p.metodo.toLowerCase().includes(q))
            );
        }

        let htmlRecibos = '';
        pagos.forEach(p => {
            htmlRecibos += `
            <tr class="align-middle">
                <td>
                    <span class="badge bg-surface-2 text-brand border border-subtle font-monospace fw-bold">${p.nro_recibo || p.id}</span>
                </td>
                <td class="text-dark fw-semibold">${p.concepto}</td>
                <td class="text-brand fw-bold">Bs. ${p.monto.toLocaleString('es-BO')}</td>
                <td class="text-secondary small">
                    <div>${p.fecha}</div>
                    ${p.hora ? `<div class="text-muted" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i>${p.hora}</div>` : ''}
                </td>
                <td>
                    <span class="badge bg-surface-2 border border-subtle text-dark small">${p.metodo}</span>
                </td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="window.Pagos.viewDigitalReceipt('${p.id}', '${member.ci}')">
                        <i class="bi bi-receipt me-1"></i> Ver Recibo
                    </button>
                </td>
            </tr>`;
        });

        if (pagos.length === 0) {
            htmlRecibos = `<tr><td colspan="6" class="text-center text-muted py-4">
                <i class="bi bi-journal-x fs-3 d-block mb-1 text-secondary"></i>
                ${q ? 'No se encontraron recibos que coincidan con la búsqueda.' : 'Aún no registra pagos o comprobantes.'}
            </td></tr>`;
        }
        containerRecibos.innerHTML = htmlRecibos;
    }

    // =========================================================================
    // 2. GENERACIÓN DINÁMICA DE QR (BOLIVIA QR SIMPLE FORMAT)
    // =========================================================================
    showBankQRModal(concepto, monto, cuotaId = '') {
        const theme = window.PortalState.getCurrentTheme();
        const session = window.PortalState.getSession();

        this.activeQRConfig = {
            concepto: concepto || 'Aporte Fraternal Tinkus Wistus',
            monto: parseFloat(monto) || 0,
            cuotaId: cuotaId || 'cuota_1',
            memberCI: session ? session.ci : ''
        };

        const elConcepto = document.getElementById('bankQRConcepto');
        const elFrat = document.getElementById('bankQRFraternidad');
        const elMontoInput = document.getElementById('bankQRMontoInput');
        const elMontoLabel = document.getElementById('bankQRMonto');

        if (elConcepto) elConcepto.textContent = this.activeQRConfig.concepto;
        if (elFrat) elFrat.textContent = theme.name;
        if (elMontoInput) elMontoInput.value = this.activeQRConfig.monto;
        if (elMontoLabel) elMontoLabel.textContent = `Bs. ${this.activeQRConfig.monto.toLocaleString('es-BO')}`;

        this.regenerateDynamicQR();

        const modalEl = document.getElementById('modalBankQR');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    regenerateDynamicQR() {
        const qrContainer = document.getElementById('bankQRCodeContainer');
        const elMontoLabel = document.getElementById('bankQRMonto');
        if (elMontoLabel) {
            elMontoLabel.textContent = `Bs. ${this.activeQRConfig.monto.toLocaleString('es-BO')}`;
        }

        if (!qrContainer) return;
        qrContainer.innerHTML = '';

        const payload = JSON.stringify({
            banco: 'Banco Nacional de Bolivia (BNB)',
            cuenta: '150-1928374-2',
            titular: 'Fraternidad Tinkus Wistus',
            moneda: 'BOB',
            monto: this.activeQRConfig.monto,
            glosa: `WISTUS-${this.activeQRConfig.memberCI || 'PAGO'}-${this.activeQRConfig.cuotaId}`,
            fecha_gen: new Date().toISOString().substring(0, 10)
        });

        // Si qrcodejs está cargado
        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrContainer, {
                    text: payload,
                    width: 170,
                    height: 170,
                    colorDark: '#2e1065',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
                return;
            } catch (e) {
                console.warn('Error generando QRCode dinámico, usando SVG:', e);
            }
        }

        // Fallback gráfico elegante SVG
        qrContainer.innerHTML = `
        <svg viewBox="0 0 100 100" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#fff" rx="6" />
            <rect x="8" y="8" width="26" height="26" fill="#2e1065" rx="3" />
            <rect x="12" y="12" width="18" height="18" fill="#fff" rx="2" />
            <rect x="15" y="15" width="12" height="12" fill="#7c3aed" rx="1" />
            <rect x="66" y="8" width="26" height="26" fill="#2e1065" rx="3" />
            <rect x="70" y="12" width="18" height="18" fill="#fff" rx="2" />
            <rect x="73" y="15" width="12" height="12" fill="#7c3aed" rx="1" />
            <rect x="8" y="66" width="26" height="26" fill="#2e1065" rx="3" />
            <rect x="12" y="70" width="18" height="18" fill="#fff" rx="2" />
            <rect x="15" y="73" width="12" height="12" fill="#7c3aed" rx="1" />
            <rect x="38" y="12" width="8" height="8" fill="#7c3aed" />
            <rect x="48" y="24" width="8" height="8" fill="#2e1065" />
            <rect x="36" y="38" width="28" height="28" rx="4" fill="#7c3aed" />
            <text x="50" y="56" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff" font-family="sans-serif">WISTUS</text>
            <rect x="68" y="40" width="8" height="8" fill="#2e1065" />
            <rect x="80" y="54" width="8" height="8" fill="#7c3aed" />
            <rect x="40" y="72" width="8" height="8" fill="#2e1065" />
            <rect x="54" y="80" width="8" height="8" fill="#7c3aed" />
            <rect x="68" y="72" width="16" height="16" fill="#2e1065" rx="2" />
        </svg>`;
    }

    downloadQRImage() {
        const qrContainer = document.getElementById('bankQRCodeContainer');
        if (!qrContainer) return;

        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `QR_Wistus_${this.activeQRConfig.cuotaId}_Bs${this.activeQRConfig.monto}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            window.PortalApp.showToast('¡Código QR descargado correctamente!', 'success');
        } else {
            window.PortalApp.showToast('Descarga no disponible en este navegador.', 'info');
        }
    }

    proceedToUploadFromQR() {
        const modalEl = document.getElementById('modalBankQR');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }

        setTimeout(() => {
            this.openUploadVoucherModal(
                this.activeQRConfig.cuotaId,
                this.activeQRConfig.concepto,
                this.activeQRConfig.monto
            );
        }, 300);
    }

    // =========================================================================
    // 3. CARGA Y GESTIÓN DE VOUCHERS POR EL FRATERNO
    // =========================================================================
    handleVoucherFileSelect(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            window.PortalApp.showToast('Por favor selecciona una imagen válida (JPG, PNG, WebP)', 'warning');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            window.PortalApp.showToast('La imagen es demasiado pesada (máximo 5 MB)', 'warning');
            return;
        }

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

    clearVoucherPreview() {
        this.tempVoucherFileBase64 = null;
        const previewContainer = document.getElementById('uploadVoucherPreviewContainer');
        const fileInput = document.getElementById('uploadVoucherFotoInput');
        if (previewContainer) previewContainer.classList.add('d-none');
        if (fileInput) fileInput.value = '';
    }

    openUploadVoucherModal(cuotaId, cuotaTitle, maxMonto) {
        const session = window.PortalState.getSession();
        if (!session || !session.ci) {
            window.PortalApp.showToast('Debe iniciar sesión como fraterno', 'warning');
            return;
        }

        const member = window.PortalState.getMemberByCI(session.ci);
        if (!member) return;

        // Poblar selects de bancos
        this.populateBankSelects();

        const inCuotaId = document.getElementById('uploadVoucherCuotaId');
        const inCuotaTitle = document.getElementById('uploadVoucherCuotaTitle');
        const inMonto = document.getElementById('uploadVoucherMonto');
        const inNroTrans = document.getElementById('uploadVoucherNroTransaccion');
        const inNotas = document.getElementById('uploadVoucherNotas');
        const inFecha = document.getElementById('uploadVoucherFechaTransferencia');
        const inFileInput = document.getElementById('uploadVoucherFotoInput');

        if (inCuotaId) inCuotaId.value = cuotaId;
        if (inCuotaTitle) inCuotaTitle.value = cuotaTitle;
        if (inMonto) inMonto.value = maxMonto || 0;
        if (inNroTrans) inNroTrans.value = '';
        if (inNotas) inNotas.value = '';
        if (inFecha) inFecha.value = new Date().toISOString().substring(0, 10);
        if (inFileInput) inFileInput.value = '';

        const pendingVoucher = (member.vouchers_pendientes || []).find(v => v.cuota_id === cuotaId);
        const previewImg = document.getElementById('uploadVoucherPreviewImg');
        const previewContainer = document.getElementById('uploadVoucherPreviewContainer');

        if (pendingVoucher && pendingVoucher.foto_base64) {
            this.tempVoucherFileBase64 = pendingVoucher.foto_base64;
            if (previewImg) previewImg.src = pendingVoucher.foto_base64;
            if (previewContainer) previewContainer.classList.remove('d-none');
            if (pendingVoucher.monto && inMonto) inMonto.value = pendingVoucher.monto;
            if (pendingVoucher.nro_transaccion && inNroTrans) inNroTrans.value = pendingVoucher.nro_transaccion;
            if (pendingVoucher.notas_fraterno && inNotas) inNotas.value = pendingVoucher.notas_fraterno;
        } else {
            this.tempVoucherFileBase64 = null;
            if (previewContainer) previewContainer.classList.add('d-none');
        }

        const modalEl = document.getElementById('modalUploadVoucher');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    populateBankSelects() {
        const banks = window.BOLIVIAN_BANKS || (window.DEFAULT_PORTAL_CONFIG && window.DEFAULT_PORTAL_CONFIG.bancos_disponibles) || [];
        const selects = ['uploadVoucherBanco', 'selectNewPaymentBanco'];

        selects.forEach(selId => {
            const sel = document.getElementById(selId);
            if (sel && sel.options.length <= 1) {
                sel.innerHTML = banks.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
            }
        });
    }

    submitVoucherForm() {
        const session = window.PortalState.getSession();
        if (!session || !session.ci) return;

        const cuotaId = document.getElementById('uploadVoucherCuotaId')?.value;
        const cuotaTitle = document.getElementById('uploadVoucherCuotaTitle')?.value || 'Cuota Fraternal';
        const monto = parseFloat(document.getElementById('uploadVoucherMonto')?.value);
        const banco = document.getElementById('uploadVoucherBanco')?.value || 'Banco Nacional de Bolivia (BNB)';
        const nroTrans = document.getElementById('uploadVoucherNroTransaccion')?.value.trim() || '';
        const fechaTrans = document.getElementById('uploadVoucherFechaTransferencia')?.value || new Date().toISOString().substring(0, 10);
        const notas = document.getElementById('uploadVoucherNotas')?.value.trim() || '';

        if (!cuotaId || isNaN(monto) || monto <= 0) {
            window.PortalApp.showToast('Ingrese un monto válido mayor a 0 Bs.', 'warning');
            return;
        }

        if (!this.tempVoucherFileBase64) {
            window.PortalApp.showToast('Por favor adjunte una imagen clara de su comprobante o voucher.', 'warning');
            return;
        }

        try {
            window.PortalState.submitVoucher(session.ci, {
                cuota_id: cuotaId,
                concepto: cuotaTitle,
                monto: monto,
                foto_base64: this.tempVoucherFileBase64,
                banco_origen: banco,
                nro_transaccion: nroTrans,
                fecha_transferencia: fechaTrans,
                notas_fraterno: notas
            });

            const modalEl = document.getElementById('modalUploadVoucher');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
            }

            window.PortalApp.showToast('¡Comprobante enviado exitosamente! La directiva lo verificará en breve.', 'success');
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al enviar comprobante', 'danger');
        }
    }

    // =========================================================================
    // 4. VISTA CONTROL / DIRECTIVA (VERIFICACIÓN & LIBRO MAYOR)
    // =========================================================================
    renderControlPayments() {
        const summary = window.PortalState.getFinancialSummary();

        // Actualizar métricas financieras de control
        const elRecaudado = document.getElementById('controlFinRecaudado');
        const elProyectado = document.getElementById('controlFinProyectado');
        const elAlDia = document.getElementById('controlFinAlDia');
        const elMorosos = document.getElementById('controlFinMorosos');
        const badgePending = document.getElementById('badgePendingVouchersCount');

        if (elRecaudado) elRecaudado.textContent = `Bs. ${summary.totalRecaudado.toLocaleString('es-BO')}`;
        if (elProyectado) elProyectado.textContent = `Bs. ${summary.totalProyectado.toLocaleString('es-BO')}`;
        if (elAlDia) elAlDia.textContent = `${summary.fraternosAlDia} fraternos`;
        if (elMorosos) elMorosos.textContent = `${summary.fraternosConSaldo} con saldo`;
        if (badgePending) badgePending.textContent = summary.pendingVouchersCount;

        // Renderizar pestañas
        this.renderControlPaymentsTable();
        this.renderControlVouchersTable();
        this.renderControlCuotasTable();
        this.renderControlBloquesSummary(summary.porBloque);

        // Poblar selects dinámicos
        this.populatePaymentMemberSelect();
        this.populatePaymentCuotasSelect();
    }

    renderControlBloquesSummary(bloques) {
        const container = document.getElementById('controlFinBloquesContainer');
        if (!container || !Array.isArray(bloques)) return;

        let html = '';
        bloques.forEach(b => {
            html += `
            <div class="col-md-4 col-lg-2 mb-2">
                <div class="p-3 bg-surface-2 rounded-3 border border-subtle h-100">
                    <div class="small fw-bold text-dark text-truncate mb-1" title="${b.name}">${b.name}</div>
                    <div class="fs-6 fw-bold text-brand mb-1">Bs. ${b.recaudado.toLocaleString('es-BO')}</div>
                    <div class="progress mb-1" style="height: 4px;">
                        <div class="progress-bar bg-brand" style="width: ${b.porcentaje}%"></div>
                    </div>
                    <div class="d-flex justify-content-between text-muted" style="font-size: 0.7rem;">
                        <span>${b.al_dia} al día</span>
                        <span>${b.porcentaje}%</span>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    renderControlPaymentsTable() {
        const tableBody = document.getElementById('controlPaymentsTableBody');
        if (!tableBody) return;

        const members = window.PortalState.getMembers();
        let allPayments = [];
        members.forEach(m => {
            (m.pagos || []).forEach(p => {
                allPayments.push({
                    ...p,
                    member_ci: m.ci,
                    member_nombre: `${m.nombres} ${m.apellidos}`,
                    bloque_id: m.bloque_id || 'hombres',
                    bloque_nombre: m.bloque_nombre || 'Bloque Hombres',
                    filial_id: m.filial_id || 'matriz_lp',
                    filial_nombre: m.filial_nombre || 'Matriz (La Paz)',
                    telefono: m.telefono || ''
                });
            });
        });

        // Aplicar filtros
        const f = this.controlPaymentsFilter;
        if (f.search) {
            const q = f.search.toLowerCase();
            allPayments = allPayments.filter(p => 
                p.member_ci.includes(q) ||
                p.member_nombre.toLowerCase().includes(q) ||
                (p.nro_recibo && p.nro_recibo.toLowerCase().includes(q)) ||
                (p.nro_transaccion && p.nro_transaccion.toLowerCase().includes(q))
            );
        }
        if (f.bloque && f.bloque !== 'all') {
            allPayments = allPayments.filter(p => p.bloque_id === f.bloque);
        }
        if (f.cuota && f.cuota !== 'all') {
            allPayments = allPayments.filter(p => p.cuota_id === f.cuota);
        }
        if (f.metodo && f.metodo !== 'all') {
            allPayments = allPayments.filter(p => (p.metodo || '').toLowerCase().includes(f.metodo.toLowerCase()));
        }
        if (f.fechaDesde) {
            allPayments = allPayments.filter(p => p.fecha >= f.fechaDesde);
        }
        if (f.fechaHasta) {
            allPayments = allPayments.filter(p => p.fecha <= f.fechaHasta);
        }

        allPayments.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Actualizar contador y suma de filtrados
        const elFiltradosCount = document.getElementById('ctrlPaymentsFilterCount');
        const elFiltradosTotal = document.getElementById('ctrlPaymentsFilterTotal');
        const sumaFiltrada = allPayments.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);

        if (elFiltradosCount) elFiltradosCount.textContent = allPayments.length;
        if (elFiltradosTotal) elFiltradosTotal.textContent = `Bs. ${sumaFiltrada.toLocaleString('es-BO')}`;

        let html = '';
        allPayments.forEach(p => {
            html += `
            <tr class="align-middle">
                <td>
                    <span class="badge bg-surface-2 text-brand border border-subtle font-monospace fw-bold">${p.nro_recibo || p.id}</span>
                </td>
                <td>
                    <div class="fw-bold text-dark">${p.member_nombre}</div>
                    <div class="small text-secondary">CI: ${p.member_ci} &bull; <span class="badge bg-surface-2 text-dark border border-subtle">${p.bloque_nombre || 'Bloque Hombres'}</span> <span class="badge bg-surface-2 text-dark border border-subtle"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${p.filial_nombre || 'Matriz (La Paz)'}</span></div>
                </td>
                <td class="text-dark">
                    <div>${p.concepto}</div>
                    ${p.nro_transaccion ? `<span class="badge bg-light text-muted font-monospace" style="font-size:0.7rem;">Ref: ${p.nro_transaccion}</span>` : ''}
                </td>
                <td class="text-brand fw-bold">Bs. ${p.monto.toLocaleString('es-BO')}</td>
                <td class="text-secondary small">
                    <div>${p.fecha}</div>
                    ${p.hora ? `<span class="text-muted" style="font-size:0.75rem;">${p.hora}</span>` : ''}
                </td>
                <td><span class="badge bg-surface-2 border border-subtle text-dark">${p.metodo}</span></td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="window.Pagos.viewDigitalReceipt('${p.id}', '${p.member_ci}')">
                        <i class="bi bi-eye me-1"></i> Recibo
                    </button>
                </td>
            </tr>`;
        });

        if (allPayments.length === 0) {
            html = '<tr><td colspan="7" class="text-center text-muted py-4">No se encontraron pagos con los filtros seleccionados.</td></tr>';
        }
        tableBody.innerHTML = html;
    }

    renderControlVouchersTable() {
        const vouchersTableBody = document.getElementById('controlVouchersTableBody');
        const pendingVouchers = window.PortalState.getPendingVouchers();
        const badgePending = document.getElementById('badgePendingVouchersCount');
        if (badgePending) badgePending.textContent = pendingVouchers.length;

        if (!vouchersTableBody) return;

        let htmlVouchers = '';
        pendingVouchers.forEach(v => {
            htmlVouchers += `
            <tr class="align-middle">
                <td>
                    <div class="fw-bold text-dark">${v.member_nombre}</div>
                    <div class="small text-secondary">CI: ${v.member_ci} ${v.member_telefono ? `&bull; ${v.member_telefono}` : ''}</div>
                </td>
                <td>
                    <span class="badge bg-surface-2 text-dark border border-subtle mb-1 d-block">${v.bloque_nombre || 'Bloque Hombres'}</span>
                    <span class="badge bg-surface-2 text-dark border border-subtle"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${v.filial_nombre || 'Matriz (La Paz)'}</span>
                </td>
                <td>
                    <div class="fw-semibold text-dark">${v.concepto}</div>
                    <div class="small text-muted font-monospace">${v.banco_origen || 'Banco'} ${v.nro_transaccion ? `&bull; #${v.nro_transaccion}` : ''}</div>
                </td>
                <td class="text-success fw-bold fs-6">Bs. ${v.monto.toLocaleString('es-BO')}</td>
                <td class="text-secondary small">
                    <div>${v.fecha}</div>
                    ${v.hora ? `<span class="text-muted" style="font-size:0.75rem;">${v.hora}</span>` : ''}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info rounded-pill px-2" onclick="window.Pagos.openViewVoucherModal('${v.member_ci}', '${v.id}', true)">
                        <i class="bi bi-zoom-in me-1"></i> Ver Imagen
                    </button>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-success rounded-pill me-1 px-3" onclick="window.Pagos.confirmVoucherDirectly('${v.member_ci}', '${v.id}')" title="Aprobar y Emitir Recibo Oficial">
                        <i class="bi bi-check-lg me-1"></i> Aprobar
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="window.Pagos.promptRejectVoucher('${v.member_ci}', '${v.id}')" title="Rechazar con Observación">
                        <i class="bi bi-x-lg me-1"></i> Rechazar
                    </button>
                </td>
            </tr>`;
        });

        if (pendingVouchers.length === 0) {
            htmlVouchers = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-patch-check-fill text-success fs-3 d-block mb-1"></i>No hay comprobantes pendientes de verificación. ¡Todo al día!</td></tr>';
        }
        vouchersTableBody.innerHTML = htmlVouchers;
    }

    renderControlCuotasTable() {
        const tableBody = document.getElementById('controlCuotasTableBody');
        if (!tableBody) return;

        const cuotas = window.PortalState.getCuotas();
        const members = window.PortalState.getMembers();

        let html = '';
        cuotas.forEach((c, idx) => {
            // Calcular cuánto se ha recaudado de esta cuota
            let recaudadoEsta = 0;
            let pagantesEsta = 0;
            members.forEach(m => {
                const pagosCuota = (m.pagos || []).filter(p => p.cuota_id === c.id);
                const sum = pagosCuota.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
                if (sum > 0) {
                    recaudadoEsta += sum;
                    if (sum >= c.monto) pagantesEsta++;
                }
            });

            const proyectadoEsta = c.monto * members.length;
            const pct = proyectadoEsta > 0 ? Math.round((recaudadoEsta / proyectadoEsta) * 100) : 100;

            html += `
            <tr class="align-middle">
                <td><span class="badge bg-surface-2 text-brand font-monospace">${c.id}</span></td>
                <td>
                    <div class="fw-bold text-dark">${c.title}</div>
                    <span class="badge bg-surface-2 text-muted small">${c.categoria || 'General'}</span>
                </td>
                <td class="fw-bold text-dark">Bs. ${c.monto.toLocaleString('es-BO')}</td>
                <td class="text-secondary small"><i class="bi bi-calendar3 me-1"></i>${c.vencimiento}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px;">
                            <div class="progress-bar bg-brand" style="width: ${pct}%"></div>
                        </div>
                        <span class="small font-mono fw-semibold">${pct}%</span>
                    </div>
                    <div class="text-muted" style="font-size:0.72rem;">Bs. ${recaudadoEsta.toLocaleString('es-BO')} de ${proyectadoEsta.toLocaleString('es-BO')}</div>
                </td>
                <td>
                    ${c.obligatorio !== false ? '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Obligatorio</span>' : '<span class="badge bg-secondary">Opcional</span>'}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-warning rounded-pill me-1" onclick="window.Pagos.openCuotaEditorModal('${c.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="window.Pagos.deleteCuotaPrompt('${c.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        tableBody.innerHTML = html;
    }

    // =========================================================================
    // 5. REVISIÓN DETALLADA DE VOUCHERS CON LIGHTBOX / ZOOM (DIRECTIVA)
    // =========================================================================
    openViewVoucherModal(ci, voucherId, isDirectiva = false) {
        const member = window.PortalState.getMemberByCI(ci);
        if (!member) return;

        const voucher = (member.vouchers_pendientes || []).find(v => v.id === voucherId);
        if (!voucher) {
            window.PortalApp.showToast('Voucher no encontrado o ya fue procesado', 'warning');
            return;
        }

        this.activeVoucherCI = ci;
        this.activeVoucherId = voucherId;
        this.voucherZoomLevel = 1.0;

        const imgEl = document.getElementById('viewVoucherImgSrc');
        if (imgEl) {
            imgEl.src = voucher.foto_base64 || '';
            imgEl.style.transform = 'scale(1)';
        }

        document.getElementById('viewVoucherFraternoNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('viewVoucherFraternoCI').textContent = `${member.ci} ${member.ci_exp || 'LP'}`;
        document.getElementById('viewVoucherFraternoBloque').textContent = `${member.bloque_nombre || 'Bloque Hombres'} • ${member.filial_nombre || 'Matriz (La Paz)'}`;
        document.getElementById('viewVoucherCuota').textContent = voucher.concepto;
        document.getElementById('viewVoucherMonto').textContent = `Bs. ${voucher.monto.toLocaleString('es-BO')}`;
        
        const elBanco = document.getElementById('viewVoucherBanco');
        const elNroTrans = document.getElementById('viewVoucherNroTransaccion');
        const elNotas = document.getElementById('viewVoucherNotasFraterno');
        const inMontoAjustado = document.getElementById('viewVoucherMontoAjustadoInput');

        if (elBanco) elBanco.textContent = voucher.banco_origen || 'Banco BNB';
        if (elNroTrans) elNroTrans.textContent = voucher.nro_transaccion || 'No especificado';
        if (elNotas) elNotas.textContent = voucher.notas_fraterno || 'Sin observaciones del fraterno';
        if (inMontoAjustado) inMontoAjustado.value = voucher.monto;

        const actionsEl = document.getElementById('viewVoucherDirectivaActions');
        if (actionsEl) {
            if (isDirectiva) actionsEl.classList.remove('d-none');
            else actionsEl.classList.add('d-none');
        }

        const modalEl = document.getElementById('modalViewVoucherImage');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    zoomInVoucher() {
        this.voucherZoomLevel = Math.min(3.0, this.voucherZoomLevel + 0.25);
        const imgEl = document.getElementById('viewVoucherImgSrc');
        if (imgEl) imgEl.style.transform = `scale(${this.voucherZoomLevel})`;
    }

    zoomOutVoucher() {
        this.voucherZoomLevel = Math.max(0.5, this.voucherZoomLevel - 0.25);
        const imgEl = document.getElementById('viewVoucherImgSrc');
        if (imgEl) imgEl.style.transform = `scale(${this.voucherZoomLevel})`;
    }

    resetZoomVoucher() {
        this.voucherZoomLevel = 1.0;
        const imgEl = document.getElementById('viewVoucherImgSrc');
        if (imgEl) imgEl.style.transform = 'scale(1)';
    }

    confirmCurrentVoucher() {
        if (!this.activeVoucherCI || !this.activeVoucherId) return;
        const inMontoAjustado = document.getElementById('viewVoucherMontoAjustadoInput');
        const customMonto = inMontoAjustado ? parseFloat(inMontoAjustado.value) : null;

        this.confirmVoucherDirectly(this.activeVoucherCI, this.activeVoucherId, customMonto);

        const modalEl = document.getElementById('modalViewVoucherImage');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }
    }

    confirmVoucherDirectly(ci, voucherId, customMonto = null) {
        try {
            const payment = window.PortalState.confirmVoucher(ci, voucherId, customMonto);
            window.PortalApp.showToast(`¡Pago de Bs. ${payment.monto} verificado y confirmado exitosamente! Recibo: ${payment.nro_recibo}`, 'success');
            this.renderControlPayments();
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al confirmar comprobante', 'danger');
        }
    }

    promptRejectVoucher(ci, voucherId) {
        const motivo = prompt('Ingrese el motivo u observación del rechazo para notificar al fraterno:', 'Comprobante ilegible o monto no coincide con extracto');
        if (motivo !== null) {
            this.rejectVoucherDirectly(ci, voucherId, motivo.trim());
        }
    }

    rejectCurrentVoucher() {
        if (!this.activeVoucherCI || !this.activeVoucherId) return;
        const motivo = prompt('Ingrese el motivo de observación para el fraterno:', 'Comprobante borroso / ilegible');
        if (motivo !== null) {
            this.rejectVoucherDirectly(this.activeVoucherCI, this.activeVoucherId, motivo.trim());
            const modalEl = document.getElementById('modalViewVoucherImage');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
            }
        }
    }

    rejectVoucherDirectly(ci, voucherId, motivo = '') {
        try {
            window.PortalState.rejectVoucher(ci, voucherId, motivo);
            window.PortalApp.showToast('Comprobante observado. Se notificó al fraterno para regularizar.', 'info');
            this.renderControlPayments();
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al rechazar comprobante', 'danger');
        }
    }

    confirmAllVouchersInBatch() {
        const pending = window.PortalState.getPendingVouchers();
        if (pending.length === 0) {
            window.PortalApp.showToast('No hay comprobantes pendientes de verificación.', 'info');
            return;
        }

        if (confirm(`¿Desea aprobar y emitir recibos para los ${pending.length} comprobantes pendientes en lote?`)) {
            const totalConfirmados = window.PortalState.confirmAllPendingVouchers();
            window.PortalApp.showToast(`¡Se han verificado y confirmado ${totalConfirmados} pagos en lote!`, 'success');
            this.renderControlPayments();
        }
    }

    // =========================================================================
    // 6. RECIBOS DIGITALES OFICIALES Y EXPORTACIÓN
    // =========================================================================
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
        document.getElementById('reciboFecha').textContent = `${payment.fecha} ${payment.hora || ''}`;
        document.getElementById('reciboFraternoNombre').textContent = `${member.nombres} ${member.apellidos}`;
        document.getElementById('reciboFraternoCI').textContent = `${member.ci} ${member.ci_exp || 'LP'}`;
        document.getElementById('reciboBloque').textContent = `${member.bloque_nombre || 'Bloque Hombres'} • ${member.filial_nombre || 'Matriz (La Paz)'}`;
        document.getElementById('reciboConcepto').textContent = payment.concepto;
        document.getElementById('reciboMonto').textContent = `Bs. ${payment.monto.toLocaleString('es-BO')}`;
        document.getElementById('reciboMetodo').textContent = payment.metodo;
        document.getElementById('reciboCajero').textContent = payment.cajero || 'Tesorería Wistus';
        document.getElementById('reciboFraternidadHeader').textContent = theme.name;

        const montoLiteral = this.numberToSpanishWords(payment.monto);
        const elLiteral = document.getElementById('reciboMontoLiteral');
        if (elLiteral) elLiteral.textContent = `${montoLiteral} 00/100 BOLIVIANOS`;

        // Generar sello de verificación QR
        const qrContainer = document.getElementById('reciboQRStampContainer');
        if (qrContainer) {
            qrContainer.innerHTML = '';
            const verificationPayload = `CERTIFICADO OFICIAL WISTUS - CARNAVAL DE ORURO 2027\nRecibo: ${payment.nro_recibo || payment.id}\nCI: ${member.ci}\nFraterno: ${member.nombres} ${member.apellidos}\nMonto: Bs. ${payment.monto}\nFecha: ${payment.fecha}`;
            if (typeof QRCode !== 'undefined') {
                try {
                    new QRCode(qrContainer, {
                        text: verificationPayload,
                        width: 75,
                        height: 75,
                        colorDark: '#3b0764',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.M
                    });
                } catch (e) {
                    console.warn(e);
                }
            }
        }

        const modalEl = document.getElementById('modalDigitalReceipt');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
    }

    downloadReceiptImage() {
        const receiptCard = document.getElementById('reciboPrintableArea');
        if (!receiptCard || typeof html2canvas === 'undefined') {
            window.print();
            return;
        }

        html2canvas(receiptCard, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
            const link = document.createElement('a');
            const nroDoc = document.getElementById('reciboNroDoc')?.textContent || 'REC';
            link.download = `Recibo_Oficial_${nroDoc}_TinkusWistus.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            window.PortalApp.showToast('¡Recibo descargado correctamente!', 'success');
        }).catch(err => {
            console.error('Error al generar imagen de recibo:', err);
            window.print();
        });
    }

    exportPaymentsCSV() {
        const members = window.PortalState.getMembers();
        let rows = [
            ['Nro Recibo', 'CI', 'Fraterno', 'Bloque', 'Concepto', 'Monto (Bs)', 'Fecha', 'Hora', 'Metodo', 'Cajero', 'Ref Transaccion', 'Estado']
        ];

        members.forEach(m => {
            (m.pagos || []).forEach(p => {
                rows.push([
                    p.nro_recibo || p.id,
                    m.ci,
                    `"${m.nombres} ${m.apellidos}"`,
                    `"${m.bloque_nombre}"`,
                    `"${p.concepto}"`,
                    p.monto,
                    p.fecha,
                    p.hora || '',
                    `"${p.metodo}"`,
                    `"${p.cajero || ''}"`,
                    `"${p.nro_transaccion || ''}"`,
                    p.estado || 'pagado'
                ]);
            });
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Libro_Mayor_Pagos_Tinkus_Wistus_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.PortalApp.showToast('¡Libro Mayor exportado a CSV exitosamente!', 'success');
    }

    // =========================================================================
    // 7. REGISTRO MANUAL DE COBROS & GESTIÓN DE CUOTAS
    // =========================================================================
    populatePaymentMemberSelect() {
        const sel = document.getElementById('selectNewPaymentMember');
        if (!sel) return;
        const members = window.PortalState.getMembers();
        sel.innerHTML = '<option value="">-- Seleccionar Fraterno / CI --</option>' + 
            members.map(m => `<option value="${m.ci}">${m.nombres} ${m.apellidos} (CI: ${m.ci}) - ${m.bloque_nombre}</option>`).join('');
    }

    populatePaymentCuotasSelect() {
        const sel = document.getElementById('selectNewPaymentCuota');
        if (!sel) return;
        const cuotas = window.PortalState.getCuotas();
        sel.innerHTML = cuotas.map(c => `<option value="${c.id}" data-monto="${c.monto}">${c.title} (Bs. ${c.monto})</option>`).join('');

        const filterCuotaSel = document.getElementById('ctrlPaymentsFilterCuota');
        if (filterCuotaSel && filterCuotaSel.options.length <= 1) {
            filterCuotaSel.innerHTML = '<option value="all">-- Todas las Cuotas --</option>' +
                cuotas.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
        }
    }

    onSelectPaymentMemberChange() {
        const selMember = document.getElementById('selectNewPaymentMember');
        const selCuota = document.getElementById('selectNewPaymentCuota');
        const inputMonto = document.getElementById('inputNewPaymentMonto');
        const elSaldoHint = document.getElementById('newPaymentMemberSaldoHint');

        if (!selMember || !selMember.value) {
            if (elSaldoHint) elSaldoHint.innerHTML = '';
            return;
        }

        const member = window.PortalState.getMemberByCI(selMember.value);
        if (!member) return;

        const cuotaId = selCuota ? selCuota.value : '';
        const cuota = window.PortalState.getCuotaById(cuotaId);
        if (!cuota) return;

        const pagosCuota = (member.pagos || []).filter(p => p.cuota_id === cuotaId);
        const pagado = pagosCuota.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
        const restante = Math.max(0, cuota.monto - pagado);

        if (inputMonto) inputMonto.value = restante > 0 ? restante : cuota.monto;
        if (elSaldoHint) {
            elSaldoHint.innerHTML = `<span class="badge ${restante === 0 ? 'bg-success' : 'bg-warning text-dark'} small">
                ${restante === 0 ? 'Esta cuota ya está cancelada' : `Saldo pendiente de esta cuota: Bs. ${restante}`}
            </span>`;
        }
    }

    openRegisterPaymentModal(prefillCI = '') {
        const modalEl = document.getElementById('modalRegisterPayment');
        if (!modalEl || !window.bootstrap) return;

        this.populatePaymentMemberSelect();
        this.populatePaymentCuotasSelect();

        const sel = document.getElementById('selectNewPaymentMember');
        if (prefillCI && sel) {
            sel.value = prefillCI;
            this.onSelectPaymentMemberChange();
        }

        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    }

    submitNewPayment() {
        const selMember = document.getElementById('selectNewPaymentMember');
        const selCuota = document.getElementById('selectNewPaymentCuota');
        const inputMonto = document.getElementById('inputNewPaymentMonto');
        const selMetodo = document.getElementById('selectNewPaymentMetodo');
        const inputRef = document.getElementById('inputNewPaymentReferencia');

        const ci = selMember ? selMember.value : '';
        const cuotaId = selCuota ? selCuota.value : '';
        const monto = inputMonto ? parseFloat(inputMonto.value) : 0;
        const metodo = selMetodo ? selMetodo.value : 'Efectivo';
        const referencia = inputRef ? inputRef.value.trim() : '';

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

        const cuota = window.PortalState.getCuotaById(cuotaId);
        const concepto = cuota ? cuota.title : 'Aporte Fraternal';

        const payment = window.PortalState.registerPayment(ci, {
            cuota_id: cuotaId,
            concepto: concepto,
            monto: monto,
            metodo: metodo,
            nro_transaccion: referencia,
            cajero: 'Secretaría de Control'
        });

        const modalEl = document.getElementById('modalRegisterPayment');
        if (modalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        }

        window.PortalApp.showToast(`¡Pago de Bs. ${monto} registrado exitosamente! Recibo: ${payment.nro_recibo}`, 'success');
        this.renderControlPayments();
        this.viewDigitalReceipt(payment.id, ci);
    }

    // =========================================================================
    // 8. CONFIGURACIÓN DE CUOTAS DE LA FRATERNIDAD (DIRECTIVA)
    // =========================================================================
    openCuotaEditorModal(cuotaId = null) {
        const modalEl = document.getElementById('modalCuotaEditor');
        if (!modalEl || !window.bootstrap) return;

        const titleEl = document.getElementById('modalCuotaEditorTitle');
        const inId = document.getElementById('cuotaEditId');
        const inTitle = document.getElementById('cuotaEditTitle');
        const inMonto = document.getElementById('cuotaEditMonto');
        const inVencimiento = document.getElementById('cuotaEditVencimiento');
        const inCategoria = document.getElementById('cuotaEditCategoria');
        const inObligatorio = document.getElementById('cuotaEditObligatorio');

        if (cuotaId) {
            const cuota = window.PortalState.getCuotaById(cuotaId);
            if (!cuota) return;
            if (titleEl) titleEl.innerHTML = '<i class="bi bi-pencil-square text-brand me-2"></i>Editar Cuota Fraternal';
            if (inId) inId.value = cuota.id;
            if (inTitle) inTitle.value = cuota.title;
            if (inMonto) inMonto.value = cuota.monto;
            if (inVencimiento) inVencimiento.value = cuota.vencimiento;
            if (inCategoria) inCategoria.value = cuota.categoria || 'General';
            if (inObligatorio) inObligatorio.checked = cuota.obligatorio !== false;
        } else {
            if (titleEl) titleEl.innerHTML = '<i class="bi bi-plus-circle text-brand me-2"></i>Nueva Cuota Fraternal Oruro 2027';
            if (inId) inId.value = '';
            if (inTitle) inTitle.value = '';
            if (inMonto) inMonto.value = 100;
            if (inVencimiento) inVencimiento.value = new Date().toISOString().substring(0, 10);
            if (inCategoria) inCategoria.value = 'General';
            if (inObligatorio) inObligatorio.checked = true;
        }

        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    }

    saveCuotaEditor(event) {
        if (event) event.preventDefault();

        const id = document.getElementById('cuotaEditId')?.value;
        const title = document.getElementById('cuotaEditTitle')?.value.trim();
        const monto = parseFloat(document.getElementById('cuotaEditMonto')?.value);
        const vencimiento = document.getElementById('cuotaEditVencimiento')?.value;
        const categoria = document.getElementById('cuotaEditCategoria')?.value;
        const obligatorio = document.getElementById('cuotaEditObligatorio')?.checked;

        if (!title || isNaN(monto) || monto <= 0) {
            window.PortalApp.showToast('Complete el título y monto válido mayor a 0', 'warning');
            return;
        }

        try {
            if (id) {
                window.PortalState.updateCuota(id, { title, monto, vencimiento, categoria, obligatorio });
                window.PortalApp.showToast('¡Cuota actualizada exitosamente!', 'success');
            } else {
                window.PortalState.addCuota({ title, monto, vencimiento, categoria, obligatorio });
                window.PortalApp.showToast('¡Nueva cuota creada en el catálogo!', 'success');
            }

            const modalEl = document.getElementById('modalCuotaEditor');
            if (modalEl && window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
            }

            this.renderControlPayments();
            this.renderMemberPayments();
        } catch (e) {
            window.PortalApp.showToast(e.message || 'Error al guardar cuota', 'danger');
        }
    }

    deleteCuotaPrompt(cuotaId) {
        const cuota = window.PortalState.getCuotaById(cuotaId);
        if (!cuota) return;

        if (confirm(`¿Está seguro de eliminar la cuota "${cuota.title}"? Los pagos históricos registrados no se alterarán.`)) {
            window.PortalState.deleteCuota(cuotaId);
            window.PortalApp.showToast('Cuota eliminada del catálogo.', 'warning');
            this.renderControlPayments();
            this.renderMemberPayments();
        }
    }

    // =========================================================================
    // 9. UTILIDADES (CONVERSIÓN A LETRAS EN ESPAÑOL)
    // =========================================================================
    numberToSpanishWords(num) {
        const n = Math.floor(Math.abs(num));
        if (n === 0) return 'CERO';

        const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        function convertGroup(val) {
            let res = '';
            const h = Math.floor(val / 100);
            const t = Math.floor((val % 100) / 10);
            const u = val % 10;

            if (val === 100) return 'CIEN';
            if (h > 0) res += hundreds[h] + ' ';

            if (t === 1) {
                res += teens[u] + ' ';
            } else if (t === 2 && u > 0) {
                res += 'VEINTI' + units[u] + ' ';
            } else {
                if (t > 0) res += tens[t] + (u > 0 ? ' Y ' : ' ');
                if (u > 0 && t !== 1) res += units[u] + ' ';
            }
            return res.trim();
        }

        if (n < 1000) return convertGroup(n);
        if (n < 1000000) {
            const miles = Math.floor(n / 1000);
            const resto = n % 1000;
            const milesText = miles === 1 ? 'MIL' : convertGroup(miles) + ' MIL';
            return `${milesText} ${resto > 0 ? convertGroup(resto) : ''}`.trim();
        }
        return String(n);
    }
}

window.Pagos = new PagosManager();
