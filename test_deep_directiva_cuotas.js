// Deep Behavioral and Adversarial Test Suite for Mesa Directiva Quotas Management
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

// Setup mock browser environment
const domMock = {
    localStorage: {
        _data: {},
        getItem(k) { return this._data[k] || null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    },
    console: console,
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    JSON: JSON,
    RegExp: RegExp,
    Error: Error,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    document: {
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    window: {}
};
domMock.window = domMock;

// Load js/data.js and js/state.js into vm context
const dataJsContent = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf-8');
const stateJsContent = fs.readFileSync(path.join(__dirname, 'js', 'state.js'), 'utf-8');
const context = vm.createContext(domMock);
vm.runInContext(dataJsContent, context);
vm.runInContext(stateJsContent, context);

const PortalState = context.window.PortalState;
assert(PortalState, 'PortalState must be initialized');

console.log('--- RUNNING DEEP BEHAVIORAL SUITE ---');

// 1. Initial State & Identification of Fraternos & Cuotas
const members = PortalState.getMembers();
assert(members.length > 0, 'Must have initial members');
const initialCatalog = PortalState.getCuotas();
assert(initialCatalog.length > 0, 'Must have initial catalog cuotas');

const testMember = members[0];
const initialCuotas = PortalState.getMemberCuotas(testMember.ci);
assert.strictEqual(initialCuotas.length, initialCatalog.length, 'By default member inherits all catalog cuotas');
assert(initialCuotas.every(c => c.asignada === true), 'All default cuotas are assigned');

const initialStatus = PortalState.getMemberFinancialStatus(testMember.ci);
assert(initialStatus, 'Financial status must be defined');
assert(typeof initialStatus.totalExigido === 'number');
assert(typeof initialStatus.saldoPendiente === 'number');
console.log('✓ 1. Initial identification and inheritance verified');

// 2. Editing Fraterno and Assigned Quotas (Individual Customization & Exoneration)
const customCuotasConfig = [
    { id: initialCatalog[0].id, cuota_id: initialCatalog[0].id, title: initialCatalog[0].title, monto: 150, asignada: true },
    { id: initialCatalog[1].id, cuota_id: initialCatalog[1].id, title: initialCatalog[1].title, monto: initialCatalog[1].monto, asignada: false, motivo_exencion: 'Beca deportiva' }
];
PortalState.setMemberCuotasAsignadas(testMember.ci, customCuotasConfig);

const assignedOnly = PortalState.getMemberCuotas(testMember.ci, false);
assert(assignedOnly.some(c => c.id === initialCatalog[0].id && c.monto === 150), 'Custom monto applied');
assert(!assignedOnly.some(c => c.id === initialCatalog[1].id), 'Exonerated cuota excluded when includeUnassigned=false');

const withUnassigned = PortalState.getMemberCuotas(testMember.ci, true);
const exonerated = withUnassigned.find(c => c.id === initialCatalog[1].id);
assert(exonerated && exonerated.asignada === false, 'Exonerated cuota present when includeUnassigned=true');
assert.strictEqual(exonerated.motivo_exencion, 'Beca deportiva');
console.log('✓ 2. Editing fraterno and individualized quotas verified');

// 3. Batch Modification by Multi-Selection
const targetCIs = [members[1].ci, members[2].ci];
const targetCuotaId = initialCatalog[0].id;

// 3a. Batch adjust monto
PortalState.batchUpdateCuotas(targetCIs, 'adjust_monto', { cuotaId: targetCuotaId, monto: 220 });
targetCIs.forEach(ci => {
    const cuotas = PortalState.getMemberCuotas(ci, true);
    const c = cuotas.find(x => x.id === targetCuotaId);
    assert(c, 'Quota must exist');
    assert.strictEqual(c.monto, 220, 'Adjusted monto must be 220');
    assert.strictEqual(c.asignada, true, 'Quota must be assigned');
});

// 3b. Batch exonerate
PortalState.batchUpdateCuotas(targetCIs, 'unassign_cuota', { cuotaId: targetCuotaId, motivo: 'Descuento Filial' });
targetCIs.forEach(ci => {
    const cuotas = PortalState.getMemberCuotas(ci, true);
    const c = cuotas.find(x => x.id === targetCuotaId);
    assert.strictEqual(c.asignada, false, 'Quota must be unassigned/exonerated');
    assert.strictEqual(c.motivo_exencion, 'Descuento Filial');
});

// 3c. Batch re-assign
PortalState.batchUpdateCuotas(targetCIs, 'assign_cuota', { cuotaId: targetCuotaId });
targetCIs.forEach(ci => {
    const cuotas = PortalState.getMemberCuotas(ci, true);
    const c = cuotas.find(x => x.id === targetCuotaId);
    assert.strictEqual(c.asignada, true, 'Quota must be re-assigned');
});

// 3d. Adversarial: Batch with invalid inputs
assert.throws(() => PortalState.batchUpdateCuotas([], 'assign_cuota', { cuotaId: targetCuotaId }), /Debe seleccionar al menos un fraterno/);
assert.throws(() => PortalState.batchUpdateCuotas(targetCIs, 'adjust_monto', { cuotaId: targetCuotaId, monto: -10 }), /mayor o igual a 0/);
assert.throws(() => PortalState.batchUpdateCuotas(targetCIs, 'assign_cuota', { cuotaId: 'cuota_inexistente' }), /cuota válida del catálogo/);
console.log('✓ 3. Batch modification and adversarial checks passed');

// 4. Renaming Quotas with Cascading Propagation
const cuotaToRename = initialCatalog[0];
const originalTitle = cuotaToRename.title;
const newTitle = 'Traje Oficial Carnaval Oruro 2027';

// Register payment with original title
const memberForPayment = members[3];
PortalState.registerPayment(memberForPayment.ci, {
    cuota_id: cuotaToRename.id,
    monto: 100,
    concepto: originalTitle
});
const lastPayment = memberForPayment.pagos[0];
assert.strictEqual(lastPayment.concepto, originalTitle);

// Rename cuota
PortalState.renameCuota(cuotaToRename.id, newTitle);

// Verify catalog updated
const updatedCat = PortalState.getCuotaById(cuotaToRename.id);
assert.strictEqual(updatedCat.title, newTitle);

// Verify payment cascaded
const paymentAfter = memberForPayment.pagos.find(p => p.id === lastPayment.id);
assert.strictEqual(paymentAfter.concepto, newTitle, 'Payment concept must cascade updated title');

// Verify assigned cuota cascaded
const memCuotasAfter = PortalState.getMemberCuotas(testMember.ci, true);
const renamedCuota = memCuotasAfter.find(c => c.id === cuotaToRename.id);
assert.strictEqual(renamedCuota.title, newTitle, 'Member assigned cuota title must cascade');

// Adversarial: empty title
assert.throws(() => PortalState.renameCuota(cuotaToRename.id, '   '), /no puede estar vacío/);
console.log('✓ 4. Renaming quotas and reactive cascading verified');

// 5. Cobro Único Assignment (Single, Selected, Filtered Cohort)
// 5a. Single member assignment
const resSingle = PortalState.assignCobroUnico(members[0].ci, {
    title: 'Polera Confraternización 2027',
    monto: 85,
    categoria: 'Indumentaria Extra'
});
assert.strictEqual(resSingle.countAssigned, 1);
const cuotasWithSingle = PortalState.getMemberCuotas(members[0].ci);
const foundCU = cuotasWithSingle.find(c => c.title === 'Polera Confraternización 2027');
assert(foundCU, 'Cobro unico must be present');
assert.strictEqual(foundCU.monto, 85);
assert.strictEqual(foundCU.is_cobro_unico, true);

// 5b. Multiple selected members assignment
const resMulti = PortalState.assignCobroUnico([members[1].ci, members[2].ci], {
    title: 'Aporte Alquiler Banda de Bronce',
    monto: 120
});
assert.strictEqual(resMulti.countAssigned, 2);

// 5c. Filtered cohort assignment
const resFilter = PortalState.assignCobroUnico({ filial_id: 'all', rol: 'all' }, {
    title: 'Aporte Extraordinario Velada',
    monto: 50
});
assert.strictEqual(resFilter.countAssigned, members.length);

// 5d. Adversarial cobro unico inputs
assert.throws(() => PortalState.assignCobroUnico(members[0].ci, { title: '', monto: 50 }), /título o concepto/);
assert.throws(() => PortalState.assignCobroUnico(members[0].ci, { title: 'Test', monto: 0 }), /mayor a 0/);
assert.throws(() => PortalState.assignCobroUnico([], { title: 'Test', monto: 50 }), /No se seleccionaron fraternos/);
console.log('✓ 5. Cobro único assignment across single, selected, and mass targets verified');

// 6. Complete Exoneration (Zero Balance / Al Día status)
const exoneratedMember = members[4];
const allCatalog = PortalState.getCuotas();
const fullExoneration = allCatalog.map(c => ({
    id: c.id,
    cuota_id: c.id,
    title: c.title,
    monto: 0,
    asignada: false,
    motivo_exencion: 'Fundador Honorario Exento'
}));
PortalState.setMemberCuotasAsignadas(exoneratedMember.ci, fullExoneration);

const exStatus = PortalState.getMemberFinancialStatus(exoneratedMember.ci);
assert.strictEqual(exStatus.totalExigido, 0, 'Exonerated total exigido must be 0');
assert.strictEqual(exStatus.saldoPendiente, 0, 'Exonerated saldo pendiente must be 0');
assert.strictEqual(exStatus.alDia, true, 'Exonerated member with 0 debt must be Al Día');

const finSummary = PortalState.getFinancialSummary();
// Confirm exonerated member is NOT counted as moroso
assert(finSummary.fraternosConSaldo < members.length, 'Exonerated member is not counted in con saldo');
console.log('✓ 6. Full exoneration and financial summary calculation verified');

// 7. Payment Verification & Voucher Lifecycle
const voucherMember = members[5];
if (!voucherMember.vouchers_pendientes) voucherMember.vouchers_pendientes = [];
const vId = 'vch_test_' + Date.now();
voucherMember.vouchers_pendientes.push({
    id: vId,
    member_ci: voucherMember.ci,
    member_nombre: `${voucherMember.nombres} ${voucherMember.apellidos}`,
    cuota_id: initialCatalog[0].id,
    concepto: initialCatalog[0].title,
    monto: 200,
    fecha: '2026-10-07',
    banco_origen: 'Banco BNB',
    nro_transaccion: 'TR-998877'
});

const pendingList = PortalState.getPendingVouchers();
assert(pendingList.some(v => v.id === vId), 'Pending voucher must appear in list');

// Confirm voucher
const confirmedPayment = PortalState.confirmVoucher(voucherMember.ci, vId, 200, 'Verificado por Tesorería');
assert(confirmedPayment, 'Payment must be generated');
assert.strictEqual(confirmedPayment.monto, 200);
assert(!voucherMember.vouchers_pendientes.some(v => v.id === vId), 'Voucher must be removed from pending');
assert(voucherMember.pagos.some(p => p.id === confirmedPayment.id), 'Payment must be registered');

// Test reject voucher
const vIdReject = 'vch_rej_' + Date.now();
voucherMember.vouchers_pendientes.push({
    id: vIdReject,
    member_ci: voucherMember.ci,
    member_nombre: `${voucherMember.nombres} ${voucherMember.apellidos}`,
    cuota_id: initialCatalog[0].id,
    concepto: initialCatalog[0].title,
    monto: 50,
    fecha: '2026-10-07'
});
PortalState.rejectVoucher(voucherMember.ci, vIdReject, 'Monto no coincide');
assert(!voucherMember.vouchers_pendientes.some(v => v.id === vIdReject), 'Rejected voucher removed from pending');
assert(voucherMember.vouchers_rechazados.some(vr => vr.id === vIdReject), 'Voucher stored in rechazados');
console.log('✓ 7. Payment verification (approval & rejection) lifecycle verified');

console.log('\n[ALL DEEP BEHAVIORAL AND ADVERSARIAL TESTS PASSED 100%]');
