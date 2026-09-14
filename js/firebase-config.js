/**
 * js/firebase-config.js
 * Configuración y arranque de Firebase / Cloud Firestore para Portal Tinkus Wistus
 * Soporta modo Offline (IndexedDB Persistence) y configuración dinámica.
 */

const WistusFirebase = {
    // Configuración base por defecto (Reemplazable desde la UI o cargada desde LocalStorage)
    defaultConfig: {
        apiKey: "AIzaSyDummyKeyForPortalWistus2026-DemoOnly",
        authDomain: "portal-tinkus-wistus.firebaseapp.com",
        projectId: "portal-tinkus-wistus",
        storageBucket: "portal-tinkus-wistus.appspot.com",
        messagingSenderId: "102938475610",
        appId: "1:102938475610:web:abcdef1234567890"
    },

    app: null,
    db: null,
    isOnline: false,
    isInitialized: false,

    /**
     * Obtiene la configuración guardada o la predeterminada
     */
    getConfig() {
        try {
            const custom = localStorage.getItem('wistus_custom_firebase_config');
            if (custom) {
                return JSON.parse(custom);
            }
        } catch (e) {
            console.warn("No se pudo leer la configuración personalizada de Firebase:", e);
        }
        return this.defaultConfig;
    },

    /**
     * Guarda una configuración personalizada y reinicia
     */
    saveCustomConfig(configObj) {
        localStorage.setItem('wistus_custom_firebase_config', JSON.stringify(configObj));
        window.location.reload();
    },

    /**
     * Restaura la configuración por defecto
     */
    resetConfig() {
        localStorage.removeItem('wistus_custom_firebase_config');
        window.location.reload();
    },

    /**
     * Inicializa Firebase y Firestore con caché offline
     */
    async init() {
        if (typeof firebase === 'undefined') {
            console.warn("⚠️ Firebase SDK no está cargado. Se operará en Modo Local (LocalStorage).");
            this.isOnline = false;
            this.isInitialized = true;
            return false;
        }

        try {
            const config = this.getConfig();
            
            // Comprobar si ya existe una app de Firebase inicializada
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(config);
            } else {
                this.app = firebase.app();
            }

            this.db = firebase.firestore();

            // Activar persistencia sin conexión (IndexedDB) para ensayos y eventos
            try {
                await this.db.enablePersistence({ synchronizeTabs: true });
                console.log("💾 Persistencia offline de Firestore activada con éxito.");
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn("Persistencia falló: Múltiples pestañas abiertas simultáneamente.");
                } else if (err.code === 'unimplemented') {
                    console.warn("El navegador actual no soporta persistencia IndexedDB.");
                }
            }

            this.isOnline = true;
            this.isInitialized = true;
            console.log("🔥 Firebase Cloud Firestore inicializado correctamente.");
            return true;
        } catch (err) {
            console.warn("⚠️ No se pudo conectar a Firebase Cloud (operando en Modo Local):", err.message);
            this.isOnline = false;
            this.isInitialized = true;
            return false;
        }
    }
};

window.WistusFirebase = WistusFirebase;
