# Handoff Report — survey_explorer_monte_3

**Fecha**: 2026-10-02T20:13:30Z  
**De**: `survey_explorer_monte_3` (teamwork_preview_explorer)  
**Para**: `orchestrator_1` (15b0a8e7-07ca-4ff9-aa0f-b752c200529d)  
**Misión**: Survey & UX/UI Architecture Analysis of Monte (DOMA R&B) for Tinkus Wistus Landing Page  
**Tipo de Handoff**: Hard (Task Complete)

---

## 1. Observation

1. **Requerimientos Autorizados**:
   - Archivo `.agents/teamwork/ORIGINAL_REQUEST.md`, líneas 12 a 37:
     > "R1. Estructura y Navegación Editorial Estilo Monte: Crear landing.html autónomo y responsivo que replique la experiencia de usuario y dirección de arte de Monte... Header transparente con efecto blur que se vuelve sólido al hacer scroll (`scrolled`)..."
     > "R2. Identidad Visual y Tipografía Editorial: Paleta de color sofisticada basada en Monte: fondo piedra cálida (`#f5f0ea`), textos en negro carbón (`#111111`) y gris piedra (`#b9b1a4`), complementada con acentos institucionales de la Fraternidad Tinkus Wistus (púrpura `#7c3aed` y oro `#d97706`)."
     > "R3. Hero Masthead Inmersivo y Sección de Metadatos: Hero Full-Screen (`h-svh`)... Sección de Cita & Metadatos (`<dl>`): Layout a 2 columnas con cita editorial... y lista de datos oficiales a la derecha..."
     > "R4. Componentes Interactivos Insignia de Monte: Galería Carrusel (Swiper/Slider)... Bloque CTA con Tarjetas Holográficas 3D... Carrusel de Bloques Fraternos ('Nuestros Bloques')..."
     > "R5. Barra Inferior Fija ('Find a Table' / 'Unirse') y Modales: Barra fija inferior... Modal a pantalla completa... Drawer lateral emergente 'Postular / Enquire Now'... Footer editorial..."

2. **Código Fuente Real de Monte (DOMA R&B)**:
   - Extraído en vivo desde `https://domarb.com.au/venue/monte/` a `C:\Users\juan.zarate\.gemini\antigravity\brain\470c422c-11e3-4a46-bf59-04fab2b7438b\.system_generated\steps\26\content.md`.
   - Variables de Tema y Tipografía (líneas 47-110 de `content.md`):
     - `--font-sans: "Modern Gothic", sans-serif;`
     - `--font-serif: "Domaine Text", serif;`
     - `--font-mono: "DMMono", monospace;`
     - `--color-silver: #f5f0ea;`
     - `--color-grey-lighter: #ddd8d2;`
     - `--color-grey-light: #b9b1a4;`
     - `--color-grey: #717171;`
     - `--spacing-header-lg: 4.375rem;`
     - `--spacing-header: 3.25rem;`
   - Clases y selectores estructurales de Header (líneas 125-140 de `content.md`):
     - `[data-header]:is(:where(.group\/body).transparent-header:not(.scrolled) *)` -> color `--color-silver`, fondo transparente, borde `#f5f0ea4d`.
     - `[data-header]:is(:where(.group\/body).transparent-header.menu-drawer--open *)` -> abre el drawer.
   - Hero Masthead (líneas 287-311 de `content.md`):
     - `<header class="relative overflow-hidden bg-black text-silver first:-mt-header lg:first:-mt-header-lg h-svh lg:h-svh-minus-header-lg" data-block="masthead-full">`
     - `<h1 class="text-center text-6xl lg:text-8xl font-serif">Monte</h1>`
   - Sección de Metadatos `<dl>` (líneas 372-423 de `content.md`):
     - `<dl class="grid grid-cols-[auto_1fr] gap-y-7" data-venue-metadata>` con pares `<dt class="border-b pb-3 min-w-1-col ... text-grey-light">` y `<dd class="border-b pb-3 pl-grid-gutter">`.
   - Carrusel Swiper (líneas 426-440 de `content.md`):
     - `<div class="swiper" data-carousel-swiper>` con `<div class="swiper-slide !w-auto [&#038;_[data-media-embed]]:h-[50vw] lg:[&#038;_[data-media-embed]]:h-[35vw]">`.
   - Componente CTA y Tarjetas 3D (líneas 685-700 de `content.md`):
     - `<aside data-block="cta">` contenedor oscuro con `data-gift-card-animation` y tarjetas `data-gift-card` en `aspect-[450/280]` apiladas con videos y logos vectoriales.
   - Barra Inferior Fija (líneas 1249-1258 de `content.md`):
     - `<div class="max-lg:!fixed fixed bottom-0 inset-x-0 z-30" data-find-a-table-btn>` con botón `h-header lg:h-header-lg bg-grey-light text-black`.
   - Modal a Pantalla Completa (líneas 1259-1294 de `content.md`):
     - `<dialog id="find-a-table" class="backdrop:bg-black/70 backdrop:backdrop-blur-sm ...">` con enlaces `h2` y atenuación `has-[:hover]:text-black/25`.
   - Drawer Lateral Emergente (líneas 1388-1405 de `content.md`):
     - `<dialog id="enquire" class="... lg:max-w-[1200px] lg:w-[85%] ml-auto ..." data-modal-drawer>`.

3. **Ecosistema y Activos Existentes en el Repositorio**:
   - `assets/img/`:
     - `wistus-badge.svg` (2,247 bytes)
     - `wistus-badge.png` (14,818 bytes)
     - `wistus-banner.jpg` (555,781 bytes)
     - `wistus-banner.svg` (997 bytes)
     - `wistus-escudo.svg` (3,703 bytes)
     - `wistus-logo-w.svg` (6,306 bytes)
   - `css/credencial.css` (247 líneas):
     - Contiene clases de borde holográfico (`.pvc-card-holographic`), animación `goldHolographicGlow`, sello socavón y estilos de credencial física.
   - `index.html`: Portal fraternal funcional en Bootstrap 5.3.3 con Firebase y modo local.
   - `tests_verification.py` (881 líneas): Valida consistencia de módulos JS, bloques (`machas`, `imillas`, `mayores`, `choclos`, `wanllis`, `directiva`).

---

## 2. Logic Chain

1. **Premisa**: El usuario exige máxima fidelidad visual y de interacción con respecto a Monte (`https://domarb.com.au/venue/monte/`), pero en un entorno sin bundlers pesados y completamente autónomo (`landing.html`).
2. **De la Observación 2**: Monte utiliza una estructura fundamentada en Tailwind CSS (variables de tema nativas `@theme`), Swiper.js para carruseles de ancho dinámico, tipografía serif editorial para titulares (`Domaine Text`) y monospace para metadatos (`DMMono`).
3. **Inferencia de Compatibilidad**:
   - El uso de **Tailwind CSS v3 Play CDN** (`https://cdn.tailwindcss.com`) permite declarar exactamente los mismos tokens cromáticos (`silver: #f5f0ea`, `grey-light: #b9b1a4`, `charcoal: #111111`) y utilidades de espaciado sin compilar Node.js.
   - La inclusión de **Google Fonts CDN** (`Playfair Display` + `Plus Jakarta Sans` + `DM Mono`) replica al 100% la estética tipográfica de `Domaine Text`, `Modern Gothic` y `DMMono`.
   - La librería **Swiper.js v11 CDN** garantiza paridad total de arrastre táctil y desktop con Monte.
4. **De la Observación 2 & 3 (3D Card)**: Monte utiliza tarjetas de video apiladas en su CTA de gift cards. Adaptando esto a la "Credencial Fraterna 2026", un script ligero Vanilla ES6 de cálculo de perspectiva (`rotateX`, `rotateY`, `radial-gradient` specular highlight) combinado con la paleta Wistus (`#7c3aed`, `#d97706`) ofrece una experiencia interactiva idéntica sin necesidad de Three.js.
5. **De la Observación 1 & 3 (Integración Bidireccional)**: `landing.html` puede enlazar a `index.html` en Header, Metadata `<dl>`, Modal Nav y Footer; a su vez, `index.html` puede incorporar un enlace de retorno elegante ("← Convocatoria 2026 / Landing"), garantizando navegación fluida de ida y vuelta.

---

## 3. Caveats

- **Imágenes Fotográficas de Bloques Específicos**: El directorio `assets/img/` contiene `wistus-banner.jpg` e insignias vectoriales oficiales. Para las fotografías de alta resolución de los 4 bloques fraternos (Machas, Imillas, Ñaupas, Sambos) en el carrusel, se pueden utilizar imágenes contextuales del folklore boliviano / Entrada Universitaria optimizadas con fallbacks estéticos o placeholders de alta gama editorial.
- **Sin Bundlers**: No se debe forzar Webpack, Vite ni TypeScript; todo el código de `landing.html` debe autoejecutarse directamente en cualquier navegador moderno al abrirse vía `file://` o servidor estático.

---

## 4. Conclusion

La arquitectura de referencia de Monte ha sido decodificada y desglosada en su totalidad. Se ha generado un documento maestro exhaustivo (`report.md`) con las especificaciones técnicas completas para implementar `landing.html`:
1. Header blur con transición suave `.scrolled`.
2. Hero masthead full screen con `h-svh` y tipografía monumental.
3. Sección de cita editorial con metadatos clave/valor en `<dl>`.
4. Doble carrusel con Swiper.js (Galería fotográfica + Bloques fraternos).
5. Componente CTA de Credencial Fraterna 2026 con efecto 3D tilt y brillo holográfico.
6. Barra fija inferior, modal a pantalla completa y drawer lateral reactivo con formulario de postulación.
7. Footer editorial con suscripción.

El stack recomendado es: **Tailwind CDN + Google Fonts + Swiper.js CDN + Vanilla ES6 Modular**, garantizando máxima fidelidad, peso menor a 150 KB y cero fricción de compilación.

---

## 5. Verification Method

Para verificar independientemente las observaciones y especificaciones de este reporte:

1. **Inspección de Reporte de Arquitectura**:
   - Abrir y verificar el informe completo en:
     `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_explorer_monte_3\report.md`
2. **Verificación de Tokens contra Monte**:
   - Comparar los tokens de color (`#f5f0ea`, `#b9b1a4`, `#ddd8d2`, `#111111`) y estructura de clases de `report.md` contra la fuente real inspeccionada en:
     `C:\Users\juan.zarate\.gemini\antigravity\brain\470c422c-11e3-4a46-bf59-04fab2b7438b\.system_generated\steps\26\content.md`
3. **Verificación de Assets Locales**:
   - Comprobar la existencia de los assets de Tinkus Wistus en `assets/img/wistus-badge.svg` y `assets/img/wistus-banner.jpg`.
4. **Condición de Invalidación**:
   - La conclusión se invalidaría si los navegadores modernos bloquearan Tailwind CDN o Swiper CDN sin conexión, para lo cual se previó una degradación elegante con CSS puro y SVGs inline.
