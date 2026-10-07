# Original User Request

## 2026-10-02T20:06:04Z

Landing page institucional y de captación para la Fraternidad Tinkus Wistus (Entrada Universitaria La Paz 2026), adaptando con máxima fidelidad la sofisticada dirección de arte, layout editorial y componentes UX/UI del sitio de Monte (DOMA R&B: https://domarb.com.au/venue/monte/).

Working directory: c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal
Integrity mode: development

## Requirements

### R1. Estructura y Navegación Editorial Estilo Monte
Crear `landing.html` autónomo y responsivo que replique la experiencia de usuario y dirección de arte de Monte:
- Header transparente con efecto blur que se vuelve sólido al hacer scroll (`scrolled`).
- Menú drawer lateral/pantalla completa con animación suave para móvil y desktop.
- Barra de acciones superior con tipografía editorial, enlaces directos y llamada a la acción ("Unirse a la Fraternidad" / "Ingresar al Portal").
- Enlace bidireccional fluido hacia el portal fraterno actual (`index.html`).

### R2. Identidad Visual y Tipografía Editorial
- Paleta de color sofisticada basada en Monte: fondo piedra cálida (`#f5f0ea`), textos en negro carbón (`#111111`) y gris piedra (`#b9b1a4`), complementada con acentos institucionales de la Fraternidad Tinkus Wistus (púrpura `#7c3aed` y oro `#d97706`).
- Jerarquía tipográfica editorial de alta gama: fuentes serif elegantes para títulos principales (similares a Domaine Text / Playfair / Cormorant) y tipografía mono/sans limpia y espaciada para metadatos.

### R3. Hero Masthead Inmersivo y Sección de Metadatos
- **Hero Full-Screen (`h-svh`)**: Imagen fotográfica de gran impacto con overlay sutil, tipografía monumental centrada y badge oficial de Tinkus Wistus.
- **Sección de Cita & Metadatos (`<dl>`)**: Layout a 2 columnas con cita editorial sobre la pasión del Tinku a la izquierda, y lista de datos oficiales a la derecha (Horarios de Ensayos, Local de Ensayo/Dirección, Contacto de Directiva, Redes Sociales oficiales y Enlace al Portal).

### R4. Componentes Interactivos Insignia de Monte
- **Galería Carrusel (Swiper/Slider)**: Carrusel fluido de fotografías de alta resolución mostrando los bloques, energía, coreografía y vestimenta de la Fraternidad.
- **Bloque CTA con Tarjetas Holográficas 3D**: Réplica del componente interactivo de gift cards de Monte adaptado a la "Credencial Digital Fraterna / Carnet de Membresía Wistus 2026" con efecto visual tridimensional y botón de "Adquirir Membresía / Inscribirse".
- **Carrusel de Bloques Fraternos ("Nuestros Bloques")**: Sliders de los bloques principales (Bloque Machas, Bloque Imillas, Bloque Ñaupas, Bloque Sambos) con imágenes de fondo, sinopsis y enlaces de detalle.

### R5. Barra Inferior Fija ("Find a Table" / "Unirse") y Modales
- Barra fija inferior tipo Monte (`Find a Table` -> `Unirse a la Fraternidad / Ingresar`).
- Modal a pantalla completa con navegación directa a opciones clave (Ingresar al Portal Fraterno, Contactar a Directiva, Horarios de Ensayo, Pagar Cuotas).
- Drawer lateral emergente "Postular / Enquire Now" con formulario reactivo de inscripción para nuevos fraternos (Nombre, Apellidos, Teléfono, Bloque de Interés y Mensaje).
- Footer editorial con formulario de suscripción a avisos / boletín y enlaces legales.

## Acceptance Criteria

### Integración y Archivos
- [ ] El archivo `landing.html` existe en la raíz del proyecto y abre sin errores en navegadores modernos.
- [ ] La navegación entre `landing.html` y el portal `index.html` funciona de ida y vuelta.
- [ ] Todos los recursos (estilos CSS, imágenes y scripts JS) están correctamente enlazados y sin errores 404 ni excepciones en consola.

### Fidelidad Visual y UX/UI
- [ ] El diseño replica fielmente el ritmo visual, proporciones y estilo editorial de Monte (https://domarb.com.au/venue/monte/).
- [ ] El Hero ocupa el 100% de la altura de la ventana (`h-svh`), con navbar transparente que responde al scroll.
- [ ] La sección de metadatos muestra la información organizada en pares clave/valor con líneas divisorias elegantes.

### Interactividad y Responsive
- [ ] El carrusel de fotografías y el carrusel de bloques permiten deslizamiento táctil y por arrastre/flechas.
- [ ] El componente de Credencial Fraterna 3D reacciona interactivamente (hover / tilt / video o tarjeta).
- [ ] La barra fija inferior abre el modal de acceso y el drawer lateral de postulación/inscripción abre y cierra limpiamente.
- [ ] El diseño es 100% responsivo en móvil (375px+), tablet y desktop grande.

## Verification Mechanism
- Script automatizado de verificación estructural y funcional (`test_landing_page.py` o suite equivalente) que valide:
  1. Existencia y sintaxis limpia del DOM de `landing.html`.
  2. Presencia de todos los IDs y selectores clave (Hero, Navbar, Carruseles, Modales, Barra Fija).
  3. Enlaces válidos a `index.html` y activos estáticos.
  4. Ejecución sin errores de inicialización de scripts.


## 2026-10-07T00:41:46Z

This is a single self-contained fix; keep it small and focused.

Optimizar y modernizar la experiencia UX/UI de la Landing Page (`landing.html`) y de la pantalla de Ingreso/Login al Portal Fraterno (`index.html`), aplicando un diseño minimalista de alto impacto visual, enfocado de forma contundente en los Calls to Action (CTAs) principales y reduciendo la fricción cognitiva del usuario.

Working directory: `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal`
Integrity mode: development

## Requirements

### R1. Landing Page — Hero Minimalista de Alto Impacto con Dual CTA
- Rediseñar el Hero Masthead de `landing.html` para que mantenga su estética editorial y monumental, pero incorpore un bloque de Call to Action (CTA) nítido, minimalista y magnético.
- Dual Action estratégico:
  1. **CTA Primario (Fraternos activos):** Botón principal de acceso directo al Portal Fraterno (`index.html`) con micro-interacciones suaves.
  2. **CTA Secundario (Nuevos postulantes):** Botón refinado estilo glassmorphism/pill para postulación inmediata al Carnaval de Oruro 2027 (abre el drawer/modal de postulación).
- Limpieza visual: eliminar redundancias de texto para que el titular, la insignia y las acciones respiren con elegancia premium.

### R2. Pantalla de Ingreso / Login Fraterno — Experiencia Minimalista y Directa
- Rediseñar el contenedor `#view-login` en `index.html` eliminando saturación visual (múltiples badges repetitivos, textos redundantes y bordes ruidosos).
- Enfoque directo en el input de Cédula de Identidad (CI): tipografía mono limpia, teclado numérico optimizado en móviles, auto-focus fluido y feedback instantáneo.
- Botón CTA de ingreso preponderante, con feedback visual de carga/transición.
- Acceso a Mesa Directiva integrado de forma minimalista y sutil (enlace discreto inferior o toggle secundario).

### R3. Micro-interacciones, Accesibilidad y Rendimiento Móvil
- Garantizar contraste AA/AAA y legibilidad impecable en pantallas AMOLED oscuras y claras.
- Sin dependencias pesadas adicionales: Tailwind CSS en landing, Bootstrap 5 + CSS temático en portal.
- Mantener compatibilidad 100% con las suites de tests existentes.

## Acceptance Criteria

### Verificación Funcional y Visual
- [ ] La landing page presenta en su viewport inicial (desktop y móvil) los 2 CTAs claramente diferenciados sin scroll necesario.
- [ ] El botón de ingreso al portal redirige a `index.html` sin demoras ni parpadeos.
- [ ] La pantalla de login del portal carga de forma inmediata y enfoca directamente la acción en ingresar el CI.
- [ ] Los flujos existentes de autenticación (CI fraterno y credenciales de control) siguen funcionando al 100%.
- [ ] Las 164 pruebas automatizadas en `tests_verification.py` y `test_landing_page.py` se ejecutan y pasan con éxito.
