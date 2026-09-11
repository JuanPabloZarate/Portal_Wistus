# 🚀 Documento de Puntos de Mejora y Hoja de Ruta
## Portal Fraternal Entrada Universitaria La Paz 2026 - Fraternidad Tinkus Wistus

Este documento detalla la propuesta técnica y operativa de **puntos de mejora** para evolucionar el **MVP estático** actual hacia un sistema web robusto, seguro y escalable listo para producción.

---

## 📌 Índice de Contenidos
1. [Publicación y Control de Versiones en GitHub](#1-publicación-y-control-de-versiones-en-github)
2. [Despliegue Continuo e Infraestructura en Vercel](#2-despliegue-continuo-e-infraestructura-en-vercel)
3. [Flujo de Trabajo para Subir, Verificar y Cambiar Estados de Pago](#3-flujo-de-trabajo-para-subir-verificar-y-cambiar-estados-de-pago)
4. [Creación y Validación Criptográfica de Códigos QR](#4-creación-y-validación-criptográfica-de-códigos-qr)
5. [Calendario de Fraternidad e Integración con Agendas](#5-calendario-de-fraternidad-e-integración-con-agendas)
6. [Panel Administrativo de la Directiva](#6-panel-administrativo-de-la-directiva)
   - [Listado y Filtros Avanzados de Fraternos](#61-listado-y-filtros-avanzados-de-fraternos)
   - [Acciones Ejecutables sobre los Fraternos](#62-acciones-ejecutables-sobre-los-fraternos)

---

## 1. 🐙 Publicación y Control de Versiones en GitHub

Para transicionar el código local a un entorno colaborativo y profesional en GitHub, se deben implementar las siguientes mejores prácticas:

### 1.1 Estructura del Repositorio y `.gitignore`
* **Limpieza de archivos locales:** Excluir scripts ejecutables de pruebas locales (`.bat`, servidores de prueba temporales) y archivos multimedia pesados no optimizados.
* **Creación de `.gitignore` estandarizado:**
  ```gitignore
  # Entornos y compilados
  node_modules/
  .env
  .env.local
  .DS_Store
  Thumbs.db

  # Logs y temporales
  *.log
  npm-debug.log*

  # Archivos de IDE y sistema
  .vscode/
  .idea/
  ```

### 1.2 Estrategia de Ramificación (GitFlow Simplificado)
* `main`: Rama de producción estable. Solo recibe código verificado a través de Pull Requests.
* `develop`: Rama de integración donde se consolidan las nuevas funcionalidades antes de lanzar una versión.
* `feature/nombre-funcionalidad`: Ramas de trabajo secundarias para el desarrollo de características (ej. `feature/verificacion-pagos`, `feature/qr-dinamico`).

### 1.3 Seguridad y Reglas de Protección
* **Branch Protection Rules:** Requerir al menos 1 aprobación (code review) antes de hacer merge en `main`.
* **Manejo de Secretos:** Configurar *GitHub Actions Secrets* para claves API (backend, pasarelas de pago, tokens de JWT) evitando la exposición de claves en el repositorio público o privado.

### 1.4 Integración Continua (CI con GitHub Actions)
* Crear un workflow en `.github/workflows/ci.yml` que ejecute automáticamente:
  * Validación de sintaxis HTML/CSS y análisis estático de JavaScript (`ESLint`).
  * Verificación de formato y enlaces rotos antes de autorizar un Pull Request.

---

## 2. ⚡ Despliegue Continuo e Infraestructura en Vercel

Vercel ofrece la plataforma ideal para alojar aplicaciones modernas con rendimiento de CDN global y soporte para Serverless Functions.

### 2.1 Conexión y Despliegue Automático (CD)
* **Vinculación con Repositorio GitHub:** Configurar el proyecto en Vercel conectado a la rama `main` para despliegues automáticos en producción.
* **Preview Deployments:** Cada Pull Request generará automáticamente una URL única de vista previa para que la directiva o los desarrolladores prueben los cambios antes de publicarlos.

### 2.2 Configuración de Enrutamiento (`vercel.json`)
* Asegurar que el sistema de rutas estáticas o SPA funcione sin errores 404 al recargar páginas:
  ```json
  {
    "cleanUrls": true,
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "/assets/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      }
    ]
  }
  ```

### 2.3 Evolución de Persistencia: De LocalStorage a Serverless / BaaS
* **Fase Actual:** Almacenamiento en `LocalStorage` (ideal para demos y prototipos sin servidor).
* **Fase de Producción en Vercel:**
  * Crear **Vercel Serverless Functions** (`/api/pagos`, `/api/asistencias`, `/api/fraternos`) usando Node.js o Python.
  * Conectar con una base de datos en la nube como **Supabase**, **Firebase** o **PostgreSQL (Vercel Postgres)** para contar con persistencia real multiusuario.

### 2.4 Dominio Personalizado y SSL
* Asignar un dominio institucional oficial (ej. `portal.tinkuswistus.com`).
* Activación de certificado SSL/TLS automático y HTTP/2 para máxima velocidad y seguridad.

---

## 3. 💳 Flujo de Trabajo para Subir, Verificar y Cambiar Estados de Pago

Actualmente los cobros se registran de forma directa por la directiva. Se propone un **flujo descentralizado con verificación de dos pasos (Segregación de Roles)**.

```
[Fraterno]                        [Sistema]                     [Tesorería / Directiva]
   │                                  │                                   │
   ├─► 1. Sube Comprobante (Foto/PDF)─┼─► Estado: PENDIENTE               │
   │      y registra datos del pago   │   Notifica a Tesorería ──────────►│
   │                                  │                                   │
   │                                  │   │◄─ 2. Revisa comprobante      │
   │                                  │   │   y valida con banco          │
   │                                  │   │                               │
   │◄─ 4. Recibe notificación ────────┼───┴─ 3. Aprueba u Observa ────────┤
   │      y Recibo Digital            │      (Cambia a APROBADO/RECHAZADO)│
```

### 3.1 Pasos del Flujo de Pago

#### Paso 1: Carga de Comprobante por el Fraterno
* El fraterno selecciona la cuota a pagar (ej. *1ra Cuota Entrada Universitaria La Paz 2026*).
* Adjunta una fotografía o documento PDF de la transferencia bancaria o recibo de depósito.
* Ingresa el **Número de Operación / Referencia** y la fecha del depósito.
* El sistema guarda la solicitud con estado **`PENDIENTE`**.

#### Paso 2: Cola de Verificación (Panel de Tesorería)
* Se habilita una vista exclusiva para el equipo de Tesorería con la lista de pagos pendientes.
* Incluye vista previa del comprobante adjunto, datos del fraterno y monto declarado.
* **Control Anti-Duplicados:** El sistema alerta si el número de transacción ya fue registrado previamente por otro fraterno.

#### Paso 3: Validación por Segundo Usuario Autorizado (Tesorería)
* Un usuario con rol de **Tesorero / Verificador** (diferente al fraterno que subió el comprobante) evalúa la transacción.
* Acciones disponibles:
  * **Aprobar Pago:** Asigna estado **`APROBADO`**, actualiza el saldo del fraterno y genera automáticamente el **Recibo Digital Oficial** con sello de agua.
  * **Observar / Rechazar Pago:** Asigna estado **`RECHAZADO`** u **`OBSERVADO`**, especificando el motivo (ej. *"Comprobante ilegible"*, *"Monto insuficiente"*, *"Número de referencia no encontrado en extracto bancario"*).

### 3.2 Definición Formal de Estados de Pago
| Estado | Color | Descripción |
| :--- | :--- | :--- |
| **`PENDIENTE`** | 🟡 Amarillo | Comprobante subido por el fraterno, a la espera de revisión por Tesorería. |
| **`EN_REVISIÓN`** | 🔵 Azul | El tesorero está verificando el depósito con el extracto bancario. |
| **`APROBADO`** | 🟢 Verde | Pago validado correctamente. Saldo actualizado y recibo emitido. |
| **`RECHAZADO`** | 🔴 Rojo | Comprobante no válido o rechazado. Requiere corrección del fraterno. |
| **`EXONERADO`** | 🟣 Violeta | Pago dispensado o sujeto a beca aprobada por la directiva. |

### 3.3 Auditoría y Trazabilidad
* Cada cambio de estado registrará de forma imputable:
  * ID y Nombre del Usuario Verificador.
  * Timestamp exacto (fecha y hora).
  * Comentario/Observación ingresada.
  * Registro de auditoría (Audit Log) no modificable.

---

## 4. 🔲 Creación y Validación Criptográfica de Códigos QR

El código QR es la credencial digital central para el control de acceso y pagos. Se deben implementar dos tipos de QR según su propósito:

```
┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐
│    QR CREDENCIAL DIGITAL FRATERNO      │   │         QR DE PAGO BANCARIO            │
│  (Token Dinámico / HMAC Criptográfico) │   │        (Estándar QR Simple Bolivia)    │
│                                        │   │                                        │
│             ┌───────────┐              │   │             ┌───────────┐              │
│             │ ▄▄▄▄▄ ▄▄▄ │              │   │             │ ▄▄▄▄▄ ▄▄▄ │              │
│             │ █   █ █▄█ │              │   │             │ █   █ █▄█ │              │
│             │ █▄▄▄█ ▄ █ │              │   │             │ █▄▄▄█ ▄ █ │              │
│             └───────────┘              │   │             └───────────┘              │
│                                        │   │                                        │
│  • Expiración: 60 segundos             │   │  • Monto exacto configurado            │
│  • Evita Capturas de Pantalla          │   │  • Escaneable desde banca móvil        │
│  • Firma Criptográfica Hash            │   │  • Acredita la cuenta de la Fraternidad│
└────────────────────────────────────────┘   └────────────────────────────────────────┘
```

### 4.1 QR de Credencial Digital y Asistencia (Anti-Suplantación)
* **Problema actual:** Un QR estático basado solo en el CI puede ser copiado mediante captura de pantalla y compartido con terceros.
* **Solución Propuesta (QR Dinámico Signed Token):**
  * Generar un token cifrado JWT/HMAC que incluya: `CI + Timestamp + Nonce (Número único)`.
  * **Expiración corta:** El QR se regenera automáticamente cada 30 o 60 segundos en la pantalla del celular del fraterno.
  * **Verificación en el Escáner de la Directiva:** El escáner decodifica el token en tiempo real (incluso offline si se precargan las claves públicas) y valida la autenticidad del fraterno y su estado de habilitación.

### 4.2 QR de Pago Bancario (QR Simple Interoperable)
* Generación dinámica del QR de Cobro de la Fraternidad (compatible con el sistema bancario boliviano).
* Permite que el fraterno escanee el QR directo desde su aplicación de banca móvil con el monto exacto de la cuota ya precargado.

### 4.3 Mejoras en la Terminal de Escáner (Modo Directiva)
* **Feedback Visual e Auditivo:** Verde con tono agudo para fraterno `HABILITADO / AL DÍA`, rojo con tono grave para `MOROSO / SUSPENDIDO`.
* **Modo Offline con Sincronización Posterior:** Si no hay cobertura de internet en el ensayo o recorrido, las asistencias se guardan localmente en el dispositivo del control y se sincronizan al recuperar señal.

---

## 5. 📅 Calendario de Fraternidad e Integración con Agendas

El calendario debe transformarse en una herramienta activa de comunicación y gestión de eventos.

### 5.1 Categorización y Priorización de Eventos
* 🔴 **Eventos Obligatorios / Puntiables:** Ensayos Generales, Misa de Promesa, Recorrido Oficial, Entrada Universitaria La Paz. (Afectan la puntuación para la ubicación en la fila/bloque).
* 🟡 **Eventos de Bloque:** Ensayos específicos por bloque (Machas, Imillas, Morenos, etc.).
* 🔵 **Eventos Sociales y Culturales:** Veladas, recepciones, presentaciones de traje, reuniones informativas.

### 5.2 Integración con Agendas Externas (Sincronización iCal / Google Calendar)
* Botón **"Agregar a mi Calendario"**: Permite exportar eventos individuales o la agenda completa en formato `.ics` (compatible con Google Calendar, Apple Calendar y Outlook).
* **Feed iCal en Vivo:** Proporcionar una URL de suscripción para que el calendario del fraterno se actualice automáticamente en su celular cuando la directiva reprograme un ensayo.

### 5.3 Notificaciones y Recordatorios Automatizados
* Configuración de alertas automáticas 24 horas y 2 horas antes de cada evento.
* Integración con alertas web (Web Push Notifications) y envíos de recordatorio por la API de WhatsApp de la Fraternidad.

---

## 6. 👑 Panel Administrativo de la Directiva

El módulo directivo es el centro de mando de la fraternidad. Requiere una expansión sustancial en capacidades de filtrado y control de usuarios.

### 6.1 Listado y Filtros Avanzados de Fraternos

La tabla de control debe incorporar un motor de filtros combinados multi-criterio:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FILTROS: [ Bloque: Todos ▼ ] [ Estado Pago: Deudores ▼ ] [ Asistencia: < 70% ▼ ]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Buscador: [ Buscar por Nombre, CI, Teléfono...                       ] [ 🔍 Buscar ]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Criterios de Filtrado y Búsqueda:
1. **Filtro por Bloque / Danza:** Filtrar fraternos por sección (ej. Bloque Machas, Bloque Imillas, Bloque Central, Tropas).
2. **Filtro por Estado Financiero:**
   * *Al día:* Fraternos con el 100% de cuotas a la fecha.
   * *Deudores / Morosos:* Fraternos con saldo pendiente o cuotas vencidas.
   * *Con Comprobantes Pendientes:* Fraternos en espera de verificación de pago.
3. **Filtro por Porcentaje de Asistencia:**
   * Habilitados (ej. $\ge 80\%$ de asistencia).
   * En riesgo (ej. $50\% - 79\%$).
   * Inhabilitados para bailar (ej. $< 50\%$).
4. **Vista Kardex 360° por Fraterno:**
   * Al hacer clic en un fraterno, se despliega una ficha integral con:
     * Datos personales y de contacto de emergencia.
     * Historial cronológico de pagos y comprobantes adjuntos.
     * Registro detallado de asistencias, atrasos y faltas justificadas.
     * Historial de sanciones u observaciones emitidas por la directiva.
5. **Exportación de Reportes Oficiales:**
   * Generar reportes en **Excel / CSV / PDF** formateados según los requisitos de acreditación de la **Asociación de Conjuntos Folklóricos de la Entrada Universitaria La Paz (ACFO)**.

---

### 6.2 Acciones Ejecutables sobre los Fraternos

Desde el listado directivo, los administradores autorizados podrán realizar las siguientes acciones individuales o masivas sobre el padrón de miembros:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ACCIONES DISPONIBLES EN PANEL DIRECTIVA                                                │
├──────────────────────────────────────┬─────────────────────────────────────────────────┤
│ 🛡️ Gestión de Habilitación           │ • Habilitar / Inhabilitar para la Entrada       │
│                                      │ • Cambiar Estado (Activo, Suspendido, Retirado) │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 🎭 Gestión de Bloque y Posición      │ • Reasignar de Bloque o Tropa                   │
│                                      │ • Asignar rol (Guía, Sub-Guía, Fraterno Base)   │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 💰 Gestión Financiera                │ • Registrar Pago Manual / Otorgar Prórroga      │
│                                      │ • Aplicar Beca, Descuento o Exoneración        │
│                                      │ • Registrar Multa / Penalización               │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 🔲 Gestión de Credencial             │ • Reemitir Credencial / Regenerar Código QR     │
│                                      │ • Bloquear Credencial por Pérdida/Extravío      │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 📱 Comunicación Directa              │ • Enviar Notificación Individual / WhatsApp     │
│                                      │ • Emitir Citación Oficial de Directiva          │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

#### Detalle de Acciones Directivas:

1. **Gestión de Estado y Habilitación:**
   * **Habilitar / Inhabilitar para la Entrada:** Marcar expresamente si el fraterno cumple los requisitos mínimos de cuotas y asistencias para participar en la Promesa y Entrada Universitaria La Paz 2026.
   * **Cambiar Estado del Miembro:** Modificar entre `ACTIVO`, `SUSPENDIDO`, `LICENCIA` o `INACTIVO`.

2. **Reasignación de Bloque, Tropa y Posición:**
   * Transferir fraternos entre distintos bloques según la organización de la danza.
   * Asignar jerarquías dentro del bloque: *Pasante, Guía General, Guía de Bloque, Sub-guía, Fraterno de Tropa*.

3. **Gestión Financiera Excepcional:**
   * **Cobro Manual Directo:** Permitir a Tesorería cobros en efectivo con emisión inmediata de recibo digital.
   * **Planes de Pago y Prórrogas:** Registrar compromisos de pago con fechas límite personalizadas.
   * **Descuentos y Becas:** Aplicar exoneraciones parciales o totales (ej. para pasantes, músicos o colaboradores) respaldadas con resolución de directiva.
   * **Aplicación de Multas:** Cargar multas automáticas o manuales por inasistencias a ensayos obligatorios o atrasos.

4. **Gestión de Credencial y Seguridad:**
   * **Reemisión de QR / Credencial:** Invalidar códigos QR anteriores en caso de extravío de teléfono o credencial física, emitiendo una nueva firma digital.
   * **Bloqueo Temporal:** Desactivar la credencial en caso de proceso disciplinario.

5. **Comunicación Directa y Notificaciones:**
   * Enviar avisos individualizados o por bloques enteros con 1-clic a través de WhatsApp API o correo electrónico (ej. *"Recordatorio de saldo pendiente antes del ensayo del domingo"*).

---

## 📋 Resumen de Priorización de Implementación

```
  FASE 1: Inmediata (1-2 semanas)
  ├── 1. Repositorio en GitHub (.gitignore, ramas, CI básico)
  └── 2. Despliegue en Vercel con CDN y SSL

  FASE 2: Core Operativo (2-4 semanas)
  ├── 3. Flujo de subida y verificación de comprobantes de pago (Tesorería)
  └── 4. Implementación de QR Dinámico para control de asistencia

  FASE 3: Gestión Directiva & Agendas (4-6 semanas)
  ├── 5. Calendario interactivo con suscripción iCal y recordatorios
  └── 6. Panel directivo con búsqueda, filtros avanzados y acciones de fraterno
```

---
*Documento preparado para la Mesa Directiva de la Fraternidad - Portal Fraternal Entrada Universitaria La Paz 2026.*
