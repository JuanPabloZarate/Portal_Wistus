# INFORME DE ESPECIFICACIÓN Y MINADO DE REQUERIMIENTOS: LANDING PAGE MONTE-STYLE TINKUS WISTUS 2026

**Fecha de análisis:** 2026-10-02  
**Autor:** `survey_spec_miner_1` (teamwork_preview_spec_miner)  
**Proyecto:** Fraternidad Tinkus Wistus — Entrada Universitaria La Paz 2026  
**Documento fuente autoritativo:** `ORIGINAL_REQUEST.md`  
**Referencia arquitectónica y UX/UI:** Sitio oficial Monte (DOMA R&B — `https://domarb.com.au/venue/monte/`)  
**Portal existente:** `index.html` (Portal de Gestión, Padrón y Mesa Directiva Wistus)

---

## 1. RESUMEN EJECUTIVO Y ALCANCE

El objetivo del proyecto es construir una landing page institucional y de captación de alto impacto visual y editorial (`landing.html`) para la **Fraternidad Tinkus Wistus (Entrada Universitaria La Paz 2026)**, clonando y adaptando fielmente la sofisticada dirección de arte, proporciones tipográficas, ritmo visual y componentes interactivos del sitio de referencia **Monte (DOMA R&B)**.

La landing page funcionará como la vitrina pública editorial de la fraternidad, proporcionando una experiencia inmersiva para nuevos postulantes, fraternos y público general, enlazada bidireccionalmente con el sistema de gestión interno ya existente en `index.html`.

---

## 2. MATRIZ DETALLADA DE REQUERIMIENTOS AUTORITATIVOS

### R1. Estructura y Navegación Editorial Estilo Monte
- **Archivo principal:** Creación del archivo `landing.html` autónomo, autosuficiente y totalmente responsivo en la raíz del proyecto.
- **Header dinámico (`data-header`):**
  - Estado inicial transparente (`transparent-header`) con desenfoque de fondo (`backdrop-blur-sm` / `blur(8px)`).
  - Transición fluida a estado sólido con fondo piedra cálida (`scrolled`) al desplazar la ventana verticalmente más de 50px (`window.scrollY > 50`).
  - Línea de borde inferior sutil con opacidad variable (`border-b border-[#f5f0ea]/30` en transparente, `border-[#b9b1a4]/50` al hacer scroll).
- **Menú Drawer Lateral / Pantalla Completa (`data-menu-drawer`):**
  - Botón de alternancia (hamburger toggle `data-menu-drawer-toggle`) para móvil y desktop con animación de barras que rotan 45° cruzadas para formar una "X" (`group-[&.menu-drawer--open]:rotate-45`).
  - Drawer desplegable desde la parte superior o lateral derecho con fondo `#f5f0ea` (`bg-silver`) y tipografía monumental serif (`h3` / `h2`).
  - Overlay oscuro con backdrop blur para cierre al hacer clic fuera (`data-menu-drawer-close`).
- **Barra de Acciones Superior:**
  - Tipografía editorial sans/mono refinada con tracking amplio (`tracking-widest`, uppercase).
  - Enlaces de navegación rápida: Historia, Bloques Fraternos, Ensayos, Credencial Digital, Contacto.
  - Llamada a la acción destacada (CTA Button): Botón píldora estilizado `btn-sm` para *"Unirse a la Fraternidad"* y enlace directo *"Ingresar al Portal"*.
- **Conexión Bidireccional con el Portal Fraterno:**
  - Enlace directo desde el Header, Modal y Barra Inferior hacia `index.html`.
  - Enlace recíproco desde `index.html` (vista de login / barra superior) para regresar a `landing.html`.

### R2. Identidad Visual, Tokens y Tipografía Editorial
- **Paleta de Color Arquitectónica:**
  - Fondo base: Piedra cálida / Silver cálido `#f5f0ea` (`--color-silver`).
  - Texto principal y contrastes: Negro carbón `#111111` / `#000000` (`--color-black`).
  - Gris piedra / Borde divisor: `#b9b1a4` (`--color-grey-light` / `--color-primary`).
  - Gris piedra claro: `#ddd8d2` (`--color-grey-lighter`).
  - Gris neutro de metadatos: `#717171` (`--color-grey`).
- **Acentos Institucionales Fraternidad Tinkus Wistus:**
  - Púrpura Imperial Wistus: `#7c3aed` (con variantes `#6d28d9` y `#5b21b6`).
  - Oro Fiesta / Solsticio Wistus: `#d97706` (con variantes `#f59e0b` y `#fbbf24`).
- **Jerarquía Tipográfica Editorial:**
  - *Serif monumental:* Fuentes serif de contraste alto y gran elegancia para títulos de sección y citas (Google Fonts: `Playfair Display`, `Cormorant Garamond` o `Cinzel`).
  - *Sans editorial:* Sans-serif geométrica y limpia para cuerpo de texto y navegación (`Plus Jakarta Sans` o `Inter`).
  - *Monoespaciada de metadatos:* Fuente monospace espaciada con tracking amplio para fechas, horarios, etiquetas y CIs (`DM Mono`, `Space Mono` o `JetBrains Mono`).

### R3. Hero Masthead Inmersivo y Sección de Metadatos
- **Hero Full-Screen (`h-svh` / `100svh`):**
  - Ocupa exactamente el 100% de la altura del viewport (`100svh` con fallback a `100vh`).
  - Fotografía principal de alta resolución de la fraternidad con cobertura completa (`object-cover`) y overlay oscuro sutil (`rgba(0,0,0,0.3)` a `0.45`).
  - Tipografía monumental centrada: Título colosal *"TINKUS WISTUS"* en serif (`text-6xl lg:text-8xl`), subtítulo editorial *"Entrada Folklórica Universitaria La Paz 2026"* y lema *"Fuerza, Pasión y Tradición Ancestral"*.
  - Insignia heráldica oficial de Tinkus Wistus (`assets/img/wistus-badge.svg` / `wistus-escudo.svg`) integrada elegantemente sobre o bajo el título.
- **Sección Editorial a 2 Columnas (Cita & Metadatos `<dl>`):**
  - Contenedor con espaciado editorial generoso (`py-block`), borde superior `#b9b1a4` y layout grid de 12 columnas.
  - *Columna Izquierda (lg:col-span-6):* Cita editorial reflexiva y apasionada sobre el significado del Tinku en la juventud universitaria boliviana (`prose`, fuente serif grande `rt-paragraph-large` / `h3`).
  - *Columna Derecha (lg:col-span-4 lg:col-start-9):* Lista de definición `<dl>` estructurada en pares `dt`/`dd` con líneas divisorias inferiores (`border-b border-[#b9b1a4]/50`):
    - **Horarios:** Sábados y Domingos 15:30 – 19:30.
    - **Lugar de Ensayo:** Cancha Zapata / Monoblock Central UMSA, Av. Villazón, La Paz.
    - **Contacto Directiva:** Teléfono / WhatsApp oficial (+591 76543210) y correo electrónico (`contacto@tinkuswistus.bo`).
    - **Redes Sociales:** Enlaces externos a Instagram, Facebook, TikTok y YouTube.
    - **Portal Fraterno:** Enlace directo de alta visibilidad hacia `index.html`.

### R4. Componentes Interactivos Insignia de Monte
- **Galería Carrusel Fotográfico (`data-block="carousel"`):**
  - Integración de carrusel continuo fluido (Swiper.js) sin saltos.
  - Diapositivas con anchos automáticos (`!w-auto`), alturas responsivas (`h-[50vw] lg:h-[35vw]`) y bordes suavemente redondeados (`rounded-xl`).
  - Fotografías de alta calidad que ilustran la vestimenta, pasos de baile, saltos ceremoniales y ambiente fraterno.
  - Navegación táctil por deslizamiento (touch swipe), arrastre de ratón (mouse drag) y soporte de teclado.
- **Bloque CTA con Tarjetas Holográficas 3D (`data-block="cta"`):**
  - Replicación estructural del componente de gift cards de Monte adaptado a la **"Credencial Digital Fraterna / Carnet de Membresía Wistus 2026"**.
  - Contenedor oscuro carbón (`bg-black text-silver rounded-2xl p-8 lg:p-16`).
  - Efecto de perspectiva tridimensional e inclinación interactiva al mover el ratón (3D tilt physics / `transform: perspective(1000px) rotateX() rotateY()`).
  - Tarjeta con estética PVC holográfica: degradado iridiscente con brillo dorado (`#fbbf24`), textura metálica, chip de seguridad digital, código QR funcional y tipografía de membresía oficial.
  - Bloque de texto descriptivo a la izquierda con botón de acción: *"Adquirir Membresía / Inscribirse Ahora"* que despliega el drawer de postulación.
- **Carrusel de Bloques Fraternos ("Nuestros Bloques"):**
  - Réplica del carrusel editorial de venues de Monte (`data-block="listing-carousel"`).
  - Tarjetas verticales con proporción editorial `aspect-[520/607]`, imagen representativa y velo de color en hover (`group-hover:opacity-100`).
  - Presentación de los cuatro bloques principales:
    1. **Bloque Machas:** Guerreros de vanguardia, fuerza indomable y saltos enérgicos.
    2. **Bloque Imillas:** Elegancia, coquetería, gracia y sincronía coreográfica.
    3. **Bloque Ñaupas:** Guardianes de la tradición, veteranía y cadencia ritual.
    4. **Bloque Sambos:** Potencia, agilidad acrobática y despliegue físico monumental.
  - Cada tarjeta incluye: Título en `h2`, línea divisoria sutil, sinopsis descriptiva, enlace *"Conocer bloque"* y botón secundario *"Postular a este bloque"*.

### R5. Barra Inferior Fija ("Find a Table" / "Unirse") y Modales
- **Barra Inferior Fija (`data-find-a-table-btn`):**
  - Barra anclada al borde inferior de la pantalla (`fixed bottom-0 inset-x-0 z-30`), con altura `h-header` (52px en móvil, 70px en desktop).
  - Fondo gris piedra cálido (`bg-grey-light` / `#b9b1a4`) con texto en negro carbón, que se eleva ligeramente en hover (`group-hover:-translate-y-1`).
  - Texto monumental: *"UNIRSE A LA FRATERNIDAD / INGRESAR AL PORTAL"*.
  - Disparador (`data-modal-open="#modal-access"`) que abre el modal interactivo de pantalla completa.
- **Modal de Pantalla Completa (`dialog#modal-access`):**
  - Implementación con elemento nativo HTML5 `<dialog>` con backdrop translúcido oscuro y desenfoque (`backdrop:bg-black/70 backdrop:backdrop-blur-sm`).
  - Menú monumental centrado en tipografía serif `h2` con microinteracción de oscurecimiento selectivo (`has-[:hover]:text-black/30`):
    - *Ingresar al Portal Fraterno (`index.html`)*
    - *Postular a un Bloque (Abre Drawer)*
    - *Horarios y Lugares de Ensayo*
    - *Información de Cuotas y Membresías 2026*
    - *Contactar a la Mesa Directiva*
  - Botón fijo inferior de *"Cerrar"* con degradado suave.
- **Drawer Lateral de Postulación / Inscripción (`dialog#enquire`):**
  - Drawer deslizante desde el lateral derecho (`data-modal-drawer`), ocupando el 100% de altura y hasta 720px de ancho en pantallas grandes.
  - Cabecera con título editorial *"Postula a la Fraternidad"* y botón *"Cerrar"*.
  - Formulario reactivo de captación con diseño editorial Monte (`gform-theme`):
    - Campo *Nombres* (requerido).
    - Campo *Apellidos* (requerido).
    - Campo *Teléfono / WhatsApp* (requerido, formato numérico con prefijo Bolivia).
    - Selector *Bloque de Interés* (Machas, Imillas, Ñaupas, Sambos).
    - Campo *Mensaje o Experiencia Previa* (área de texto).
    - Botón de envío estilizado en cápsula: *"Enviar Postulación"*.
    - Validación en tiempo real y mensaje interactivo de confirmación / éxito sin recarga de página.
- **Footer Editorial:**
  - Layout en cuadrícula a 12 columnas.
  - Enlaces de navegación rápida (Historia, Bloques, Credenciales, Ensayos, Portal, Contacto).
  - Formulario de suscripción a boletines y comunicados fraternos con input subrayado minimalista y botón *"Suscribirme"*.
  - Línea de créditos, copyright 2026 Fraternidad Tinkus Wistus y enlaces legales (Política de Privacidad, Estatutos).

---

## 3. ESPECIFICACIÓN DE TOKENS DE DISEÑO Y CLASES CSS

| Token | Variable / Clase | Valor Hex / CSS | Propósito |
|---|---|---|---|
| Background Base | `--color-silver` / `bg-silver` | `#f5f0ea` | Fondo cálido editorial tipo piedra de Monte |
| Foreground Black | `--color-black` / `text-black` | `#111111` / `#000000` | Color de texto principal, titulares y contraste |
| Primary Stone | `--color-grey-light` / `bg-grey-light` | `#b9b1a4` | Bordes, separadores `<dl>`, botones primarios |
| Secondary Stone | `--color-grey-lighter` | `#ddd8d2` | Fondos de tarjetas de carga e imágenes |
| Muted Gray | `--color-grey` / `text-grey` | `#717171` | Textos secundarios, pie de foto y copyright |
| Institucional Wistus Púrpura | `--color-wistus-purple` | `#7c3aed` | Acento heráldico de la fraternidad |
| Institucional Wistus Púrpura Oscuro | `--color-wistus-dark` | `#5b21b6` | Sombras, bordes activos y estados hover |
| Institucional Wistus Oro | `--color-wistus-gold` | `#d97706` | Acento festivo, insignias y destellos |
| Institucional Wistus Oro Claro | `--color-wistus-gold-light`| `#fbbf24` | Efecto holográfico de la credencial 3D |
| Header Height Mobile | `--spacing-header` | `3.25rem` (52px) | Altura de la barra superior e inferior fija |
| Header Height Desktop | `--spacing-header-lg` | `4.375rem` (70px) | Altura en pantallas desktop (`>= 1024px`) |
| Block Padding Y | `.py-block` | `3rem` a `8.6vw` | Espaciado vertical rítmico entre secciones |
| Gutter Grid | `--spacing-grid-gutter` | `20px` a `24px` | Separación de columnas del sistema editorial |

### Jerarquía Tipográfica
- **Monumental Serif (`h1`, `lg:text-8xl`, `font-serif`):** `font-family: 'Playfair Display', 'Domaine Text', serif;` — Tamaños: 3.5rem (móvil) a 6rem (desktop).
- **Subtítulos y Secciones Serif (`h2`, `h3`):** 2rem a 3rem, interlineado ajustado (`leading-tight`).
- **Párrafo Grande Editorial (`rt-paragraph-large`):** Serif 1.5rem a 1.875rem, tracking ligero, ideal para la cita reflexiva.
- **Metadatos Mono (`text-mono`):** `font-family: 'DM Mono', monospace;` — Tamaño: 0.75rem, uppercase, `letter-spacing: 0.1em`.
- **Botón Editorial (`.btn`, `.btn-secondary`):** Bordes píldora redondeados completos (`border-radius: 9999px`), padding generoso, transición suave en color, fondo y borde.

---

## 4. INVENTARIO COMPLETO DE CARACTERÍSTICAS DESCUBIERTAS

```
## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Estructura & Archivos | Archivo landing.html autónomo | Archivo HTML independiente ubicado en la raíz que funciona como landing page editorial | Petición HTTP / Apertura en navegador | Renderizado de página completa sin dependencias rotas | Fallback visual limpio si faltan fuentes externas | ORIGINAL_REQUEST.md § R1 |
| 2 | Navegación | Header reactivo al scroll | Barra de navegación superior transparente en top de página que adquiere fondo sólido y borde al hacer scroll | Evento window.scroll (scrollY > 50) | Clase CSS .scrolled añadida a header; transición suave de 0.5s | Si JS no está disponible, fondo permanece legible con estilo por defecto | ORIGINAL_REQUEST.md § R1 & Monte HTML l.108-112 |
| 3 | Navegación | Drawer de menú lateral/móvil | Menú desplegable a pantalla completa con navegación editorial | Clic en botón data-menu-drawer-toggle | Clase menu-drawer--open en body; slide down/in del drawer | Cierre garantizado con botón data-menu-drawer-close o tecla Esc | ORIGINAL_REQUEST.md § R1 & Monte HTML l.212-284 |
| 4 | Navegación | Enlace bidireccional a index.html | Enlace fluido de ida y vuelta entre landing.html y el portal fraterno actual index.html | Clic de usuario en enlaces con href="index.html" | Navegación al portal fraterno | Fallback con enlace directo relativo si falla enrutamiento | ORIGINAL_REQUEST.md § R1 |
| 5 | Identidad Visual | Paleta editorial Monte + Wistus | Sistema de colores integrado: fondo piedra cálida (#f5f0ea), negro (#111111), gris (#b9b1a4), púrpura (#7c3aed), oro (#d97706) | Variables CSS en :root | Aplicación consistente de tonos en fondos, textos y acentos | Valores de respaldo hex nativos en cada selector | ORIGINAL_REQUEST.md § R2 & Monte CSS l.48 |
| 6 | Tipografía | Jerarquía editorial multifuente | Combinación armónica de fuentes Serif (títulos), Sans (cuerpo) y Monospace (metadatos) | Importación de Google Fonts (Playfair/Inter/DM Mono) | Tipografía nítida con renderizado antialiased | Fallback a serif, sans-serif y monospace del sistema | ORIGINAL_REQUEST.md § R2 & Monte CSS l.48 |
| 7 | Hero Masthead | Hero Full-Screen (100svh) | Masthead que ocupa el 100% de la altura de la ventana con imagen monumental y overlay oscuro | Viewport dimensions (h-svh) | Contenedor centrado con título, subtítulo e insignia heráldica | Altura asegurada con min-h-screen para navegadores sin svh | ORIGINAL_REQUEST.md § R3 & Monte HTML l.287-311 |
| 8 | Hero Masthead | Insignia Wistus integrada | Badge o escudo oficial de la fraternidad con halos luminosos | assets/img/wistus-badge.svg o PNG | Imagen vectorial nítida con proporción aspect-square | Altura y ancho fijos para evitar CLS (Cumulative Layout Shift) | ORIGINAL_REQUEST.md § R3 & assets/img/ |
| 9 | Metadatos | Cita editorial a dos columnas | Bloque editorial con cita reflexiva de gran escala a la izquierda y datos a la derecha | Texto de manifiesto Wistus 2026 | Grid 12 columnas: col-span-6 texto, col-span-4 metadatos | Colapso a una columna en pantallas móviles (< 1024px) | ORIGINAL_REQUEST.md § R3 & Monte HTML l.372-423 |
| 10 | Metadatos | Lista de datos oficiales (<dl>) | Lista estructurada en pares clave/valor con líneas divisorias elegantes | Horarios, dirección, directiva, redes y enlace a portal | Pares <dt>/<dd> con borde inferior border-b | Ajuste automático de cuadrícula sin desbordamiento | ORIGINAL_REQUEST.md § R3 & Monte HTML l.397-416 |
| 11 | Carrusel | Galería fotográfica Swiper | Carrusel fluido de fotografías que muestra la energía, pasos y vestimentas | Deslizamiento táctil, arrastre o flechas | Transición horizontal suave de diapositivas con anchos automáticos | Deslizamiento nativo CSS overflow-x si Swiper JS no carga | ORIGINAL_REQUEST.md § R4 & Monte HTML l.426-620 |
| 12 | 3D CTA Block | Credencial Digital Fraterna 3D | Componente interactivo que replica las gift cards de Monte adaptado al carnet Wistus 2026 | Movimiento del cursor del ratón (mousemove) | Inclinación 3D (tilt) con perspectiva, reflejo de brillo y sombra dinámica | En dispositivos móviles o sin ratón, muestra tarjeta estática optimizada | ORIGINAL_REQUEST.md § R4 & Monte HTML l.685-892 |
| 13 | 3D CTA Block | Botón de postulación en tarjeta | Llamada a la acción para adquirir carnet o membresía | Clic en botón "Adquirir Membresía / Inscribirse" | Apertura instantánea del drawer de inscripción | Enfoque automático al primer campo del formulario | ORIGINAL_REQUEST.md § R4 & Monte HTML l.884-888 |
| 14 | Carrusel Bloques | Sliders "Nuestros Bloques" | Carrusel de los 4 bloques principales (Machas, Imillas, Ñaupas, Sambos) | Interacción de navegación en slider | Tarjetas aspect-[520/607] con hover overlay, sinopsis y botón de detalle | Disposición en rejilla scrollable en pantallas reducidas | ORIGINAL_REQUEST.md § R4 & Monte HTML l.895-1245 |
| 15 | Barra Fija | Barra inferior fija tipo "Find a Table" | Botón anclado al pie de la pantalla en todo momento con texto "Unirse / Ingresar" | Clic en la barra inferior (data-find-a-table-btn) | Despliegue del modal a pantalla completa | Compensación de margen en el footer para evitar solapamiento visual | ORIGINAL_REQUEST.md § R5 & Monte HTML l.1249-1258 |
| 16 | Modal | Modal de acceso a pantalla completa | Dialog nativo con accesos directos a opciones clave en tipografía monumental | data-modal-open="#modal-access" | Cuadro de diálogo modal abierto con fondo desenfocado | Cierre inmediato con tecla Escape o botón de cierre | ORIGINAL_REQUEST.md § R5 & Monte HTML l.1259-1294 |
| 17 | Drawer | Drawer lateral de inscripción | Panel lateral emergente con formulario reactivo de inscripción | Clic en "Postular" o enlaces de inscripción | Transición de deslizamiento desde el borde derecho (slide-in) | Prevención de scroll del fondo mediante data-lenis-prevent | ORIGINAL_REQUEST.md § R5 & Monte HTML l.1388-1483 |
| 18 | Formulario | Formulario reactivo de postulación | Formulario con campos de nombre, apellidos, teléfono, bloque y mensaje | Entrada de texto y selección de bloque por el usuario | Validación de campos y mensaje de éxito tras envío | Alerta visual clara y accesible si faltan datos requeridos | ORIGINAL_REQUEST.md § R5 & Monte HTML l.1419-1458 |
| 19 | Footer | Footer editorial con suscripción | Pie de página editorial con newsletter, enlaces rápidos y derechos reservados | Envío de correo electrónico para suscripción | Confirmación en línea de suscripción registrada | Validación de sintaxis de correo electrónico con mensaje de error | ORIGINAL_REQUEST.md § R5 & Monte HTML l.1295-1387 |
```

---

## 5. TABLA DE CASOS LÍMITE Y COMPORTAMIENTO OBSERVADO

```
## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Hero Masthead | Carga en navegadores móviles antiguos que no soportan unidades 'svh' | La altura debe contar con fallback 'height: 100vh; min-height: 100svh;' para evitar desbordamientos o barras blancas |
| 2 | Header Reactivo | Recarga de página con scroll previo (scrollY > 50) | El script debe evaluar la posición de scroll inmediatamente en DOMContentLoaded para aplicar la clase .scrolled sin parpadeos |
| 3 | Drawer Lateral | Apertura repetida o doble clic rápido en botón toggle | El manejador de eventos debe alternar la clase atómicamente evitando estados desincronizados |
| 4 | Drawer & Modal | Apertura simultánea de modal de acceso y drawer de postulación | La apertura del drawer desde el modal debe cerrar limpiamente el modal previo para no superponer diálogos nativos |
| 5 | Carrusel Fotográfico | Pantallas táctiles pequeñas (375px) vs pantallas 4K (2560px) | Swiper configurado con slidesPerView: 'auto' y márgenes porcentuales garantiza proporciones consistentes en cualquier resolución |
| 6 | Tarjeta Holográfica 3D | Dispositivos sin soporte de hover (táctiles / móviles) | Desactivar la física de tilt mediante media query '(hover: none)' y mostrar la tarjeta en perspectiva neutral fija con brillo sutil |
| 7 | Formulario de Captación | Teléfono con código de país o caracteres espaciados (ej: '+591 76543210') | El campo debe permitir caracteres numéricos, espacios y el símbolo '+', validando longitud mínima de 7 dígitos |
| 8 | Enlace de Navegación | Clic en "Ingresar al Portal" cuando el usuario ya tiene sesión activa en index.html | La navegación a index.html preserva el estado en localStorage/sessionStorage permitiendo ingreso inmediato sin re-autenticación forzada |
| 9 | Tecla Escape | Presión de 'Escape' con modal o drawer abierto | El listener nativo del elemento <dialog> cancela el diálogo y restituye el scroll de la página de fondo |
| 10 | Barra Inferior Fija | Scroll hasta el final del contenido de la página (Footer) | El footer cuenta con 'mb-header lg:mb-header-lg' para que la barra fija inferior no tape el copyright ni los enlaces legales |
```

---

## 6. ESPECIFICACIÓN DE INTERACCIONES Y SCRIPTS JAVASCRIPT

1. **Scroll Listener & Navbar State:**
   - Observador de scroll optimizado mediante `requestAnimationFrame` o `passive: true`.
   - Umbral de activación: `scrollY > 50px`.
   - Modificación de clases: Añadir/remover `scrolled` y actualizar colores de texto y borde.
2. **Sistema de Modales y Drawers (`<dialog>` nativo):**
   - Atributos: `data-modal-open`, `data-modal-close`, `data-modal`, `data-modal-drawer`.
   - Métodos: `dialog.showModal()` y `dialog.close()` con animación CSS fade y slide.
   - Bloqueo de scroll de fondo al abrir: `document.body.classList.add('overflow-hidden')`.
3. **Efecto 3D Tilt Holográfico en Credencial:**
   - Evento `mousemove` en el contenedor `data-gift-card-animation`.
   - Cálculo de coordenadas relativas al centro:
     ```javascript
     const rect = card.getBoundingClientRect();
     const x = (e.clientX - rect.left) / rect.width - 0.5;
     const y = (e.clientY - rect.top) / rect.height - 0.5;
     card.style.transform = `perspective(1000px) rotateY(${x * 25}deg) rotateX(${-y * 25}deg) translateY(-5px)`;
     ```
   - Evento `mouseleave`: Reseteo suave a rotación neutra (`rotateY(0deg) rotateX(0deg)`).
4. **Carruseles Swiper:**
   - Inicialización para galería: `slidesPerView: 'auto'`, `centeredSlides: false`, `spaceBetween: 20`, `grabCursor: true`, `loop: true`.
   - Inicialización para bloques: `slidesPerView: 1.2` en móvil, `2.5` en tablet, `4` en desktop, `spaceBetween: 24`, flechas de navegación y bullets opcionales.

---

## 7. ESPECIFICACIÓN DEL SCRIPT DE VERIFICACIÓN AUTOMATIZADA

Para dar cumplimiento estricto a la sección **Verification Mechanism** de `ORIGINAL_REQUEST.md`, se define la especificación del script de prueba `test_landing_page.py`:

1. **Test 01 — Existencia e integridad de archivos:**
   - Verifica existencia de `landing.html` en la raíz del proyecto.
   - Verifica que el archivo no esté vacío (tamaño > 2,000 bytes).
2. **Test 02 — Sintaxis y estructura DOM:**
   - Parseo HTML sin errores de sintaxis (usando `html.parser` o regex estricto).
   - Presencia de `<!DOCTYPE html>`, `<html lang="es">`, `<meta name="viewport">`.
3. **Test 03 — Selectores e IDs requeridos (Inventario DOM):**
   - Header con `data-header` y toggle `data-menu-drawer-toggle`.
   - Hero con `h-svh` o clase de altura completa y título monumental Wistus.
   - Sección de metadatos con etiqueta `<dl>` y elementos `<dt>` / `<dd>`.
   - Carrusel fotográfico con clase o atributo `swiper`.
   - Bloque CTA con tarjeta holográfica 3D (`data-gift-card` o similar).
   - Carrusel de bloques ("Nuestros Bloques") con los 4 bloques fraternos.
   - Barra fija inferior (`data-find-a-table-btn` o botón fijo de unirse).
   - Modal de opciones de acceso (`dialog`).
   - Drawer de postulación (`dialog#enquire` o similar con formulario).
   - Footer con formulario de suscripción.
4. **Test 04 — Enlaces de navegación y consistencia estática:**
   - Verificación de enlaces válidos y funcionales hacia `index.html`.
   - Verificación de rutas de recursos estáticos existentes (`assets/img/`, CSS, JS) sin 404 ni enlaces rotos.
5. **Test 05 — Scripts y dependencias:**
   - Presencia de scripts para el control de scroll, modales, carrusel y tilt 3D.
   - Cero dependencias rotas en tiempo de ejecución.

---

Este informe constituye la especificación canónica y exhaustiva para las fases subsiguientes de planificación e implementación.
