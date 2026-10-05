# Portal Fraternal Carnaval de Oruro 2027 - Fraternidad Tinkus Wistus

Sistema web moderno del portal fraternal del Carnaval de Oruro 2027, enfocado en la experiencia del fraterno y el panel de control directivo de la **Fraternidad Tinkus Wistus**.

---

## 🚀 Cómo Iniciar y Demostrar el MVP

El MVP es **100% autónomo y estático**. No requiere Node.js ni PHP para funcionar.

### Opción 1: Apertura Directa (Recomendada)
- Simplemente haz doble clic sobre [`index.html`](index.html).
- Se abrirá en cualquier navegador moderno (Chrome, Edge, Firefox) con persistencia reactiva en `LocalStorage`.

### Opción 2: Ejecutable de 1 Clic para Windows
- Haz doble clic sobre [`iniciar_portal.bat`](iniciar_portal.bat).
- Abre automáticamente el navegador y te da la opción de levantar un servidor local en `http://localhost:8000`.

### Opción 3: Servidor Python Integrado
```bash
python iniciar_portal.py
```
Abre automáticamente `http://localhost:8000/index.html`.

---

## 🚀 Funcionalidades Seleccionadas para el Fraterno

1. **Pagos (Cuotas & Aportes):** Consulta de estado de cuenta individual, saldos pendientes, aportes cancelados y emisión/descarga de recibos y comprobantes digitales.
2. **Calendario de Eventos:** Cronograma oficial de convocatorias, ensayos, recorridos, misa de promesa y Carnaval de Oruro 2027.
3. **Avisos de Directiva:** Comunicados e informativos expedidos por la Mesa Directiva de la Fraternidad.
4. **QR de Asistencia:** Credencial digital oficial PVC con código QR verificado para el control de asistencia a ensayos y el evento principal.

---

## 🎭 Roles y Accesos de Prueba

La barra superior (`SIMULAR ROL`) y la pantalla principal de login cuentan con botones de 1-clic para evaluar los perfiles:

### 1. Rol Fraterno (Acceso Directo por CI)
- **CI de Prueba:** `4839201` (Juan Pablo Quispe - Bloque Machas) / `6892341` (Maria Elena Flores - Bloque Imillas)
- **Experiencia:**
  - Ingresa con su número de cédula de identidad.
  - Visualiza su **Dashboard**, **Cuotas & Pagos**, **Calendario de Eventos**, **Avisos de la Directiva** y su **Credencial Digital QR Oficial**.

### 2. Rol Control / Directiva (Secretaría de Actas y Asistencias)
- **Usuario:** `control`
- **Contraseña:** `wistus2027` (o PIN `2027`)
- **Nombre:** Secretaría de Control y Asistencia
- **Experiencia:**
  - **Métricas Globales:** Total de fraternos, tasa promedio de asistencia, recaudación de cuotas y saldos.
  - **Terminal de Asistencias:** Escáner QR en vivo y Pase de lista manual por bloque.
  - **Libro de Cuotas y Cobros:** Registro instantáneo de aportes y emisión de recibos digitales oficiales.
  - **Padrón General:** Directorio completo de fraternos con filtros y kardex individual.

---

## 🎨 Identidad Institucional

- **Organización:** Fraternidad Tinkus Wistus
- **Danza:** Tinkus
- **Año:** Carnaval de Oruro 2027
- **Lema:** Los mejores Tinkus del país
- **Paleta Oficial:** Púrpura (`#7c3aed`), Lavanda (`#a78bfa`), Índigo (`#6366f1`) y Slate Dark Canvas (`#0a0b10`).

---

## 📁 Estructura del Proyecto

```
Goal - portal Wistus/
├── index.html                   # Interfaz de usuario SPA responsiva con todas las subpáginas
├── iniciar_portal.bat           # Lanzador rápido para Windows
├── iniciar_portal.py            # Servidor local Python sin dependencias
├── README.md                    # Documentación y guía de demostración
├── PUNTOS_DE_MEJORA.md          # Hoja de ruta estratégica de desarrollo futuro
├── css/
│   ├── style.css                # Estilos visuales, tema oscuro, gradientes y animaciones
│   └── credencial.css           # Simulación de tarjeta PVC holográfica e impresión
├── js/
│   ├── data.js                  # Padrón base, eventos Carnaval de Oruro 2027 y cuotas Tinkus Wistus
│   ├── state.js                 # Gestor reactivo de estado en LocalStorage
│   ├── auth.js                  # Autenticación para miembros y control
│   ├── asistencias.js           # Historial, escáner QR en vivo y pase de lista por bloque
│   ├── pagos.js                 # Control de cuotas, cobro rápido y recibos digitales
│   ├── miembros.js              # Padrón de fraternos y kardex individual
│   └── app.js                   # Enrutador de subpáginas, credencial digital y utilidades
└── assets/
    └── img/
        ├── wistus-badge.png     # Insignia oficial Fraternidad Tinkus Wistus
        ├── wistus-banner.jpg    # Banner principal Tinkus Wistus
        ├── wistus-logo.jpg      # Logo de perfil Tinkus Wistus
        ├── wistus-escudo.svg    # Escudo vectorial Tinkus Wistus
        ├── wistus-banner.svg    # Logotipo tipográfico Tinkus Wistus
        └── avatar-default.svg   # Avatar base para miembros
```
