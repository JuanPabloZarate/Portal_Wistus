# 🚀 Guía Oficial de Publicación Paso a Paso: Vercel & Firebase
## Portal Fraternidad Tinkus Wistus - Entrada Universitaria La Paz 2026

---

## 📋 ¿Qué accesos o datos se necesitan de ti?

Para tener el sistema 100% publicado y conectado en la nube, solo requieres 2 cosas:

1. **GitHub Personal Access Token (PAT):** Para subir el código a tu repositorio `https://github.com/JuanPabloZarate/Portal_Wistus`.
2. **Credenciales Web de Firebase:** El fragmento `firebaseConfig` que te entrega Google al crear tu proyecto gratuito.

---

## PASO 1: Subir el Código a GitHub (1 Clic)

El código local ya está listo en la rama `main` con las reglas de Vercel y Firebase.

### Para subirlo:
1. Haz doble clic sobre el archivo **`push_to_github.bat`** que está en esta carpeta.
2. Ingresa tu **Personal Access Token de GitHub** cuando te lo solicite y presiona Enter.
3. El script subirá automáticamente todo a `https://github.com/JuanPabloZarate/Portal_Wistus`.

*(Alternativa: Puedes pegarme tu token aquí en el chat y yo ejecuto el push por ti).*

---

## PASO 2: Crear la Base de Datos en Firebase (2 Minutos)

1. Ingresa a la consola de Google Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google y haz clic en **"Crear un proyecto"** (o "Agregar proyecto").
   - Nombre: `portal-tinkus-wistus` (o el que prefieras).
   - Puedes deshabilitar Google Analytics para agilizar.
3. En el menú lateral izquierdo, ve a **Compilación (Build)** > **Firestore Database**:
   - Haz clic en **"Crear base de datos"**.
   - Selecciona la ubicación más cercana (ej. `nam5 (us-central)` o `southamerica-east1`).
   - Selecciona **"Iniciar en modo de prueba"** (permite lectura/escritura inicial inmediata) y dale a **Habilitar**.
4. Ahora registra la aplicación web:
   - Haz clic en el icono de engranaje ⚙️ (arriba a la izquierda) > **Configuración del proyecto**.
   - En la sección **Tus apps**, haz clic en el icono web **`</>`**.
   - Nombre de la app: `Portal Wistus Web` y haz clic en **Registrar app**.
5. Verás un bloque de código como este:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "portal-tinkus-wistus.firebaseapp.com",
     projectId: "portal-tinkus-wistus",
     storageBucket: "portal-tinkus-wistus.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```
6. **Copia ese objeto y pégalo aquí en el chat** para que lo deje insertado directamente en `js/firebase-config.js` y listo para producción.

---

## PASO 3: Publicar en Vercel (1 Minuto)

1. Ve a [https://vercel.com/](https://vercel.com/) e inicia sesión con tu cuenta de **GitHub**.
2. En tu panel principal (Dashboard), haz clic en el botón **"Add New..."** > **"Project"**.
3. En la lista de repositorios, busca **`Portal_Wistus`** (de tu usuario `JuanPabloZarate`) y haz clic en **"Import"**.
4. En la pantalla de configuración:
   - **Framework Preset:** `Other` (Detectado automáticamente).
   - **Root Directory:** `./` (Por defecto).
   - No necesitas cambiar ninguna variable de entorno ni comando de build.
5. Haz clic en el botón azul **"Deploy"**.
6. En ~20 segundos, Vercel te mostrará fuegos artificiales 🎉 y te entregará tu URL pública oficial (ej. `https://portal-wistus.vercel.app`).

---

## 🔄 ¿Cómo se actualiza en el futuro?
A partir de este momento, cada vez que hagas cambios y se haga un `git push` a la rama `main`, **Vercel actualizará la página web automáticamente en segundos sin que tengas que hacer nada manual**.
