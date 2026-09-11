/**
 * GESTOR DE AUTENTICACIÓN Y CONTROL DE ROLES
 * Maneja el ingreso por CI para miembros base y por credenciales para rol control.
 */

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindAuthEvents();
            this.checkExistingSession();
        });
    }

    bindAuthEvents() {
        // Formulario de Fraterno (Por CI)
        const formFraterno = document.getElementById('formLoginFraterno');
        if (formFraterno) {
            formFraterno.addEventListener('submit', (e) => {
                e.preventDefault();
                const ci = document.getElementById('inputCI').value.trim();
                this.loginAsMember(ci);
            });
        }

        // Formulario de Control (Usuario y Clave)
        const formControl = document.getElementById('formLoginControl');
        if (formControl) {
            formControl.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = document.getElementById('inputControlUser').value.trim();
                const pass = document.getElementById('inputControlPass').value.trim();
                this.loginAsControl(user, pass);
            });
        }

        // Botones de Demo Rápido (1-Clic)
        const btnDemoCI = document.getElementById('btnDemoCIBase');
        if (btnDemoCI) {
            btnDemoCI.addEventListener('click', () => {
                document.getElementById('inputCI').value = '4839201';
                this.loginAsMember('4839201');
            });
        }

        const btnDemoCIMigrated = document.getElementById('btnDemoCIMigrated');
        if (btnDemoCIMigrated) {
            btnDemoCIMigrated.addEventListener('click', () => {
                document.getElementById('inputCI').value = '6892341';
                this.loginAsMember('6892341');
            });
        }

        const btnDemoControl = document.getElementById('btnDemoControl');
        if (btnDemoControl) {
            btnDemoControl.addEventListener('click', () => {
                this.loginAsControl('control', 'wistus2026');
            });
        }

        // Botón Cerrar Sesión
        document.querySelectorAll('.btn-logout-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    checkExistingSession() {
        const session = window.PortalState.getSession();
        if (session && session.role) {
            window.PortalApp.navigateToDashboard(session.role);
        } else {
            window.PortalApp.showView('login');
        }
    }

    loginAsMember(ci) {
        const alertEl = document.getElementById('alertFraternoLogin');
        const submitBtn = document.querySelector('#formLoginFraterno button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'INGRESAR AHORA';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>VERIFICANDO PADRÓN...';
        }

        setTimeout(() => {
            const member = window.PortalState.getMemberByCI(ci);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
            }

            if (member) {
                if (member.estado_fraterno === 'inactivo') {
                    this.showAlert(alertEl, 'El miembro se encuentra inactivo. Acérquese a Secretaría.');
                    return;
                }

                // Guardar sesión
                window.PortalState.setSession({
                    role: 'miembro',
                    ci: member.ci,
                    nombres: member.nombres,
                    apellidos: member.apellidos,
                    nombre_completo: `${member.nombres} ${member.apellidos}`,
                    bloque_id: member.bloque_id,
                    bloque_nombre: member.bloque_nombre,
                    has_user_account: !!member.has_user_account,
                    foto: member.foto
                });

                this.hideAlert(alertEl);
                window.PortalApp.navigateToDashboard('miembro');
            } else {
                this.showAlert(alertEl, 'CI no registrado en el Padrón 2026. Verifique el número o contacte a la directiva.');
            }
        }, 350);
    }

    loginAsControl(username, password) {
        const alertEl = document.getElementById('alertControlLogin');
        const submitBtn = document.querySelector('#formLoginControl button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'ACCEDER AL PANEL DE CONTROL';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>VALIDANDO CREDENCIALES...';
        }

        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
            }

            const state = window.PortalState.state;
            const ctrl = state.control_user;

            // Comprobar credenciales de control o usuario admin
            let isValid = false;
            let adminName = 'Directiva y Control';

            if (username.toLowerCase() === ctrl.username.toLowerCase() && (password === ctrl.password || password === ctrl.pin)) {
                isValid = true;
                adminName = ctrl.nombre;
            } else {
                // Verificar si es un miembro con permisos admin
                const adminMember = state.miembros.find(m => 
                    m.user_account && 
                    m.user_account.username.toLowerCase() === username.toLowerCase() && 
                    m.user_account.password_hash === password &&
                    m.user_account.is_admin
                );
                if (adminMember) {
                    isValid = true;
                    adminName = `${adminMember.nombres} ${adminMember.apellidos}`;
                }
            }

            if (isValid) {
                window.PortalState.setSession({
                    role: 'control',
                    username: username,
                    nombre_completo: adminName,
                    is_admin: true
                });

                this.hideAlert(alertEl);
                window.PortalApp.navigateToDashboard('control');
            } else {
                this.showAlert(alertEl, 'Usuario o contraseña de control incorrectos. Verifique sus credenciales.');
            }
        }, 350);
    }

    logout() {
        window.PortalState.clearSession();
        window.PortalApp.showView('login');
    }

    showAlert(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('d-none');
        el.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => {
            el.classList.remove('animate__shakeX');
        }, 800);
    }

    hideAlert(el) {
        if (!el) return;
        el.classList.add('d-none');
        el.textContent = '';
    }
}

window.Auth = new AuthManager();
