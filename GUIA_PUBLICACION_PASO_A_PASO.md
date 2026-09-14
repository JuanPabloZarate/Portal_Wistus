# 🚀 Guía Oficial de Publicación y Conexión Cloud
## Portal Fraternal Tinkus Wistus 2026

Esta guía detalla el procedimiento exacto paso a paso para publicar el portal en **Vercel** y conectarlo a **Google Firebase Cloud Firestore**.

---

## 🔑 Accesos y Credenciales Requeridas

Para completar la publicación en producción necesitarás:

| Plataforma | Tipo de Cuenta | ¿Qué necesitas obtener? |
| :--- | :--- | :--- |
| **GitHub** | Gratuita ([github.com](https://github.com)) | Personal Access Token (PAT) con permiso epo |
| **Vercel** | Gratuita ([vercel.com](https://vercel.com)) | Iniciar sesión con tu cuenta de GitHub |
| **Google Firebase** | Gratuita ([console.firebase.google.com](https://console.firebase.google.com)) | 4 claves de configuración Web (piKey, projectId, uthDomain, ppId) |

---

## 📌 PASO 1: Subir el Código a la Rama Principal (main) en GitHub

1. Genera tu Personal Access Token (PAT) en GitHub:
   - Ve a **GitHub** > Tu perfil (esquina superior derecha) > **Settings**.
   - Al final del menú izquierdo, haz clic en **Developer Settings** > **Personal access tokens** > **Tokens (classic)**.
   - Clic en **Generate new token (classic)**.
   - En *Note* escribe: Portal Wistus Deploy.
   - En *Expiration* selecciona 30 days o No expiration.
   - Marca la casilla **epo** (Full control of private repositories).
   - Haz clic en **Generate token** al final de la página y copia el token generado (ghp_...).

2. Envía el código al repositorio:
   - En la carpeta de tu proyecto, haz doble clic sobre:
     📁 [push_to_github.bat](push_to_github.bat)
   - Pega tu token cuando la consola te lo pida y presiona **Enter**.
   - Verás el mensaje: ✅ ¡SUBIDA EXITOSA A GITHUB!.
   - Verifica que tus archivos aparezcan en: [https://github.com/JuanPabloZarate/Portal_Wistus](https://github.com/JuanPabloZarate/Portal_Wistus).

---

## 📌 PASO 2: Desplegar Gratis en Vercel con Dominio HTTPS

1. Ingresa a [https://vercel.com/signup](https://vercel.com/signup) y haz clic en **Continue with GitHub**.
2. Una vez dentro de tu panel de Vercel:
   - Haz clic en el botón azul **Add New...** > **Project**.
   - En la lista de repositorios de GitHub, busca **Portal_Wistus** y haz clic en **Import**.
   - En la pantalla de configuración:
     - **Project Name:** portal-wistus (o el que prefieras).
     - **Framework Preset:** Other.
     - **Root Directory:** ./ (dejar por defecto).
   - Haz clic en **Deploy**.
3. En menos de 30 segundos, Vercel compilará tu sitio y te entregará una URL pública y segura (ejemplo: https://portal-wistus.vercel.app).
4. *¡Cada vez que hagas un commit a main, Vercel actualizará tu sitio web en vivo automáticamente!*

---

## 📌 PASO 3: Crear y Conectar Google Firebase Cloud Firestore

1. Ingresa a [https://console.firebase.google.com/](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **Agregar proyecto** (o *Crear un proyecto*):
   - **Nombre del proyecto:** portal-tinkus-wistus (o el que gustes).
   - Desmarca Google Analytics (opcional) y haz clic en **Crear proyecto**.
3. **Crear la Base de Datos Firestore:**
   - En el menú lateral izquierdo, ve a **Compilación (Build)** > **Firestore Database**.
   - Haz clic en **Crear base de datos**.
   - Selecciona la ubicación más cercana (por ejemplo 
am5 (us-central) o southamerica-east1).
   - En *Reglas de seguridad*, selecciona **Comenzar en modo de prueba** (permite lectura y escritura inmediata) y haz clic en **Habilitar**.
4. **Registrar la Aplicación Web y Obtener Claves:**
   - En la vista principal del proyecto (icono de engranaje ⚙️ > *Configuración del proyecto*).
   - En la sección *Tus apps*, haz clic en el icono Web **</>**.
   - Escribe un apodo para la app: Portal Wistus Web y haz clic en **Registrar app**.
   - Firebase te mostrará un bloque de código como este:
     `javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "portal-tinkus-wistus.firebaseapp.com",
       projectId: "portal-tinkus-wistus",
       storageBucket: "portal-tinkus-wistus.appspot.com",
       messagingSenderId: "123456789...",
       appId: "1:123456789:web:abcdef..."
     };
     `
5. **Conectar las Claves al Portal:**
   - **Opción A (Desde la web desplegada en Vercel):**
     1. Abre tu sitio en Vercel.
     2. En la barra superior, haz clic en el botón con icono de nube **Firebase**.
     3. Pega tu piKey, projectId, uthDomain y ppId.
     4. Haz clic en **Guardar y Conectar**. ¡El badge cambiará a 🟢 Nube Firebase y auto-cargará los datos!
   - **Opción B (Directo en el archivo de configuración):**
     - Abre [js/firebase-config.js](js/firebase-config.js) y reemplaza los valores de defaultConfig con tus claves de Firebase, luego haz push a GitHub.
