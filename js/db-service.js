/**
 * js/db-service.js
 * Capa de Abstracción de Base de Datos y Sincronización en Tiempo Real
 * Conecta Firebase Firestore con el StateManager local y gestiona el flujo en la nube.
 */

const DBService = {
    isCloudActive: false,
    listeners: [],
    statusListeners: [],

    /**
     * Suscripción a cambios en el estado de conexión de la base de datos
     */
    onStatusChange(callback) {
        if (typeof callback === 'function') {
            this.statusListeners.push(callback);
            callback(this.getStatus());
        }
    },

    notifyStatus() {
        const status = this.getStatus();
        this.statusListeners.forEach(cb => {
            try { cb(status); } catch (e) { console.error(e); }
        });
    },

    getStatus() {
        return {
            isCloudActive: this.isCloudActive,
            isOnline: navigator.onLine,
            provider: this.isCloudActive ? 'Firebase Cloud Firestore' : 'Almacenamiento Local (LocalStorage)'
        };
    },

    /**
     * Inicializa el servicio de base de datos
     */
    async init() {
        // Escuchar cambios de conectividad del navegador
        window.addEventListener('online', () => this.notifyStatus());
        window.addEventListener('offline', () => this.notifyStatus());

        const firebaseReady = await window.WistusFirebase.init();
        if (firebaseReady && window.WistusFirebase.db) {
            try {
                this.isCloudActive = true;
                this.notifyStatus();
                console.log("☁️ DBService: Conectado a Firestore Cloud.");
                
                // Iniciar sincronización en tiempo real y verificación inicial
                await this.initRealtimeSync();
            } catch (err) {
                console.warn("DBService: Error al acceder a Firestore, usando fallback local:", err);
                this.isCloudActive = false;
                this.notifyStatus();
            }
        } else {
            this.isCloudActive = false;
            this.notifyStatus();
            console.log("📦 DBService: Operando con StateManager Local.");
        }
    },

    /**
     * Configura escuchadores en tiempo real (onSnapshot) para colecciones en Firestore
     */
    async initRealtimeSync() {
        const db = window.WistusFirebase.db;
        if (!db) return;

        try {
            // 1. Sincronización en tiempo real de Fraternos
            const unsubFraternos = db.collection('fraternos').onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const fraternos = [];
                    snapshot.forEach(doc => fraternos.push({ ...doc.data(), id: doc.id }));
                    StateManager.setPadron(fraternos, false);
                    window.dispatchEvent(new CustomEvent('wistus_data_synced', { detail: { collection: 'fraternos' } }));
                }
            }, err => console.warn("Error en realtime fraternos:", err));
            this.listeners.push(unsubFraternos);

            // 2. Sincronización en tiempo real de Asistencias
            const unsubAsistencias = db.collection('asistencias').onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const asistencias = [];
                    snapshot.forEach(doc => asistencias.push({ ...doc.data(), id: doc.id }));
                    StateManager.setAsistencias(asistencias, false);
                    window.dispatchEvent(new CustomEvent('wistus_data_synced', { detail: { collection: 'asistencias' } }));
                }
            }, err => console.warn("Error en realtime asistencias:", err));
            this.listeners.push(unsubAsistencias);

            // 3. Sincronización en tiempo real de Pagos
            const unsubPagos = db.collection('pagos').onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const pagos = [];
                    snapshot.forEach(doc => pagos.push({ ...doc.data(), id: doc.id }));
                    StateManager.setPagos(pagos, false);
                    window.dispatchEvent(new CustomEvent('wistus_data_synced', { detail: { collection: 'pagos' } }));
                }
            }, err => console.warn("Error en realtime pagos:", err));
            this.listeners.push(unsubPagos);

            // 4. Sincronización en tiempo real de Eventos
            const unsubEventos = db.collection('eventos').onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const eventos = [];
                    snapshot.forEach(doc => eventos.push({ ...doc.data(), id: doc.id }));
                    StateManager.setEventos(eventos, false);
                    window.dispatchEvent(new CustomEvent('wistus_data_synced', { detail: { collection: 'eventos' } }));
                }
            }, err => console.warn("Error en realtime eventos:", err));
            this.listeners.push(unsubEventos);

            // 5. Sincronización en tiempo real de Avisos
            const unsubAvisos = db.collection('avisos').onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const avisos = [];
                    snapshot.forEach(doc => avisos.push({ ...doc.data(), id: doc.id }));
                    StateManager.setAvisos(avisos, false);
                    window.dispatchEvent(new CustomEvent('wistus_data_synced', { detail: { collection: 'avisos' } }));
                }
            }, err => console.warn("Error en realtime avisos:", err));
            this.listeners.push(unsubAvisos);

        } catch (err) {
            console.warn("DBService: No se pudieron activar los listeners en tiempo real:", err);
        }
    },

    /**
     * Métodos de Persistencia Unificada (Cloud + Local)
     */
    async saveFraterno(fraterno, syncLocal = false) {
        if (syncLocal && window.StateManager) {
            StateManager.addOrUpdateFraterno(fraterno);
        }
        if (this.isCloudActive && window.WistusFirebase && window.WistusFirebase.db) {
            try {
                await window.WistusFirebase.db.collection('fraternos').doc(String(fraterno.ci)).set(fraterno, { merge: true });
            } catch (e) {
                console.warn("Error guardando fraterno en Firestore:", e);
            }
        }
    },

    async saveAsistencia(registro, syncLocal = false) {
        if (syncLocal && window.StateManager) {
            StateManager.addAsistencia(registro);
        }
        if (this.isCloudActive && window.WistusFirebase && window.WistusFirebase.db) {
            try {
                const id = String(registro.id || (registro.ci + '_' + (registro.eventoId || registro.evento_id) + '_' + Date.now()));
                await window.WistusFirebase.db.collection('asistencias').doc(id).set(registro, { merge: true });
            } catch (e) {
                console.warn("Error guardando asistencia en Firestore:", e);
            }
        }
    },

    async savePago(pago, syncLocal = false) {
        if (syncLocal && window.StateManager) {
            StateManager.addPago(pago);
        }
        if (this.isCloudActive && window.WistusFirebase && window.WistusFirebase.db) {
            try {
                const id = String(pago.id || (pago.ci + '_' + Date.now()));
                await window.WistusFirebase.db.collection('pagos').doc(id).set(pago, { merge: true });
            } catch (e) {
                console.warn("Error guardando pago en Firestore:", e);
            }
        }
    },

    async saveEvento(evento, syncLocal = false) {
        if (syncLocal && window.StateManager) {
            if (typeof StateManager.addEvento === 'function') {
                StateManager.addEvento(evento);
            } else if (typeof StateManager.addEvent === 'function') {
                StateManager.addEvent(evento);
            }
        }
        if (this.isCloudActive && window.WistusFirebase && window.WistusFirebase.db) {
            try {
                const id = String(evento.id || Date.now());
                await window.WistusFirebase.db.collection('eventos').doc(id).set(evento, { merge: true });
            } catch (e) {
                console.warn("Error guardando evento en Firestore:", e);
            }
        }
    },

    async saveAviso(aviso, syncLocal = false) {
        if (syncLocal && window.StateManager) {
            StateManager.addAviso(aviso);
        }
        if (this.isCloudActive && window.WistusFirebase && window.WistusFirebase.db) {
            try {
                const id = String(aviso.id || Date.now());
                await window.WistusFirebase.db.collection('avisos').doc(id).set(aviso, { merge: true });
            } catch (e) {
                console.warn("Error guardando aviso en Firestore:", e);
            }
        }
    }
};

window.DBService = DBService;
