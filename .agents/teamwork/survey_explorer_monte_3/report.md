# Arquitectura UX/UI y Sistema de Diseño Monte para Tinkus Wistus 2026

**Agente**: `survey_explorer_monte_3`  
**Fecha**: 2026-10-02  
**Referencia Primaria**: DOMA R&B Monte (`https://domarb.com.au/venue/monte/`)  
**Documento de Requisitos**: `.agents/teamwork/ORIGINAL_REQUEST.md`  
**Destino de Implementación**: `landing.html` autónomo en raíz del proyecto  

---

## 1. Resumen Ejecutivo y Linaje Estético

El proyecto busca dotar a la **Fraternidad Folklórica y Cultural Tinkus Wistus** (Entrada Universitaria La Paz 2026) de una presencia digital de clase mundial, transformando el paradigma tradicional de las páginas folklóricas hacia un **diseño editorial contemporáneo de alta costura**, inspirado directamente en el sitio insignia de **Monte (DOMA R&B Venue)**.

A través de la inspección técnica directa del código fuente y hojas de estilo de DOMA R&B Monte, este informe documenta la arquitectura de interfaz, el sistema tipográfico, la paleta cromática, los ritmos de espaciado y la mecánica de interacción de cada uno de sus componentes clave, traduciéndolos fielmente a una implementación ligera y autónoma en `landing.html` sin empaquetadores pesados.

---

## 2. Análisis Empírico del Sistema de Diseño de Monte (DOMA R&B)

A partir de la inspección directa del sitio en vivo (`https://domarb.com.au/venue/monte/`), se extrajeron los tokens exactos de diseño:

### 2.1 Paleta Cromática y Materialidad
Monte utiliza una base neutra pétrea cálida y sofisticada:
- **Base Pétrea Cálida (Silver)**: `#f5f0ea` (`--color-silver`) — color de fondo estructural del sitio y cuerpo principal.
- **Gris Piedra Neutro (Grey Light)**: `#b9b1a4` (`--color-grey-light`) — color de bordes, líneas divisorias, etiquetas secundarias y acentos sutiles.
- **Gris Piedra Claro (Grey Lighter)**: `#ddd8d2` (`--color-grey-lighter`) — fondos de contenedores de imagen y estados inactivos.
- **Negro Carbón (Black)**: `#111111` / `#000000` (`--color-black`) — textos principales, títulos monumentales y fondos de alto contraste (bloque CTA).
- **Gris Medio (Grey)**: `#717171` (`--color-grey`) — textos de pie de página, copyright y notas técnicas.

#### Adaptación e Integración de Identidad Tinkus Wistus:
Para conservar la sobriedad editorial de Monte mientras se celebra la identidad fraterna, incorporamos acentos de joya andina:
- **Púrpura Imperial Wistus**: `#7c3aed` (con variantes `#6d28d9` y `#5b21b6`).
- **Oro Ceremonial / Ámbar**: `#d97706` (con variantes `#f59e0b` y `#fbbf24`).
- **Carbón Profundo / Obsidiana**: `#0e0e11` para bloques oscuros de contraste.

### 2.2 Jerarquía Tipográfica y Ritmo Editorial
Monte emplea una trinidad tipográfica muy definida:
1. **Titulares y Citas Monumentales (Serif)**:
   - *Monte Original*: `Domaine Text` / `Domaine Display`.
   - *Stack Web Autónomo Recomendado*: `Playfair Display` o `Cormorant Garamond` (Google Fonts), con serif de alta gama, terminales elegantes y alto contraste de trazo.
   - *Escala*: `h1` en Hero (`text-6xl` a `text-8xl`/`text-9xl`), `h2` en secciones (`text-3xl` a `text-5xl`), `rt-paragraph-large` en citas editoriales (`text-xl` a `text-3xl`).
2. **Cuerpo de Texto y Enlaces (Modern Sans)**:
   - *Monte Original*: `Modern Gothic`.
   - *Stack Web Autónomo Recomendado*: `Plus Jakarta Sans` o `Inter`.
   - *Escala*: `text-base` (16px), `text-sm` (14px), peso regular (400) y medio (500), `line-height: 1.6`.
3. **Metadatos, Badges y Etiquetas de Tabla (Monospace / Spaced Sans)**:
   - *Monte Original*: `DMMono`.
   - *Stack Web Autónomo Recomendado*: `DM Mono` o `Space Mono`.
   - *Escala*: `text-xs` (12px), `tracking-[0.1em]` a `tracking-[0.15em]`, mayúsculas sostenidas (`uppercase`), peso 400.

### 2.3 Sistema de Grilla y Espaciado
- **Contenedor Principal**: `max-w-7xl` (o `105rem` / `1400px` para ultra-wide), centrado con `padding-inline` de `20px` (móvil) a `40px` (desktop).
- **Grilla**: 6 columnas en móvil (`grid-cols-6`), 12 columnas en desktop (`lg:grid-cols-12`) con gutter de `20px` a `32px`.
- **Ritmo de Bloque (`py-block`)**:
  - Móvil: `padding-block: 3rem` (48px).
  - Desktop: `padding-block: 6rem` a `8rem` (96px - 128px).
- **Líneas Divisorias (`border-t border-[#b9b1a4]/40`)**: Líneas horizontales ultradelgadas de 1px que preceden cada bloque temático, creando una clara separación de revista editorial.

---

## 3. Desglose Componente por Componente: Blueprints de Arquitectura

### 3.1 Header con Efecto Blur y Transición al Scroll
- **Estructura HTML**:
  ```html
  <header id="site-header" class="fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-in-out border-b border-[#f5f0ea]/20 text-[#f5f0ea] bg-transparent">
    <div class="container mx-auto px-5 lg:px-10 h-[3.25rem] lg:h-[4.375rem] flex items-center justify-between">
      <!-- Marca / Logo -->
      <a href="landing.html" class="flex items-center gap-3">
        <img src="assets/img/wistus-badge.svg" alt="Wistus" class="h-8 lg:h-10 w-auto">
        <span class="font-serif tracking-widest text-lg lg:text-xl uppercase font-semibold">Tinkus Wistus</span>
      </a>
      <!-- Enlaces Desktop -->
      <nav class="hidden lg:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
        <a href="#historia" class="hover:opacity-60 transition-opacity">Historia</a>
        <a href="#metadatos" class="hover:opacity-60 transition-opacity">Ensayos</a>
        <a href="#galeria" class="hover:opacity-60 transition-opacity">Galería</a>
        <a href="#bloques" class="hover:opacity-60 transition-opacity">Bloques</a>
        <a href="#credencial" class="hover:opacity-60 transition-opacity">Credencial 2026</a>
      </nav>
      <!-- CTAs & Mobile Toggle -->
      <div class="flex items-center gap-4">
        <a href="index.html" class="hidden sm:inline-flex items-center gap-2 border border-current px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
          <span>Portal Fraterno</span> &rarr;
        </a>
        <button id="btn-drawer-open" class="btn-primary text-xs font-mono uppercase tracking-wider bg-[#b9b1a4] text-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all">
          Unirse
        </button>
        <button id="btn-mobile-menu" class="lg:hidden p-2 flex flex-col justify-center gap-1.5 w-8 h-8" aria-label="Abrir Menú">
          <span class="block w-6 h-[1.5px] bg-current transition-transform duration-300"></span>
          <span class="block w-6 h-[1.5px] bg-current transition-transform duration-300"></span>
        </button>
      </div>
    </div>
  </header>
  ```
- **Mecánica de Scroll**:
  - Un listener optimizado con `requestAnimationFrame` evalúa `window.scrollY > 40`.
  - Cuando se hace scroll: añade clase `.scrolled` al header.
  - Estilos de `.scrolled`: `bg-[#f5f0ea]/90 backdrop-blur-md text-[#111111] border-[#b9b1a4]/40 shadow-sm`.
  - Transición fluida de 500ms en fondo, color de texto y borde.

---

### 3.2 Hero Masthead Full-Screen (`h-svh` / 100vh)
- **Estructura HTML**:
  ```html
  <section id="hero" class="relative overflow-hidden bg-black text-[#f5f0ea] h-svh min-h-[600px] flex items-center justify-center">
    <!-- Contenedor de Fotografía de Fondo Inmersiva -->
    <div class="absolute inset-0 z-0">
      <img src="assets/img/wistus-banner.jpg" alt="Tinkus Wistus en la Entrada Universitaria" class="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]">
      <!-- Overlay Sutil Gradiente Editorial -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40"></div>
    </div>
    
    <!-- Contenido Monumental Centrado -->
    <div class="relative z-10 container mx-auto px-5 text-center flex flex-col items-center max-w-4xl">
      <div class="inline-flex items-center gap-2 border border-[#f5f0ea]/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-2xs sm:text-xs font-mono uppercase tracking-widest text-[#f5f0ea]/90 mb-6">
        <span class="w-2 h-2 rounded-full bg-[#d97706] animate-pulse"></span>
        Entrada Universitaria La Paz &bull; Gestión 2026
      </div>
      <h1 class="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight mb-6">
        Tinkus Wistus
      </h1>
      <p class="font-sans text-base sm:text-lg md:text-xl font-light text-[#f5f0ea]/80 max-w-2xl mx-auto mb-10 leading-relaxed">
        Fuerza, devoción y la máxima expresión del folklore universitario boliviano en más de tres décadas de trayectoria ininterrumpida.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="#metadatos" class="btn px-7 py-3 rounded-full bg-[#f5f0ea] text-[#111111] font-serif text-base hover:bg-black hover:text-[#f5f0ea] border border-[#f5f0ea] transition-all">
          Descubrir Fraternidad
        </a>
        <button onclick="document.getElementById('enquire-drawer').showModal()" class="btn-secondary px-7 py-3 rounded-full border border-[#f5f0ea]/60 text-[#f5f0ea] font-serif text-base hover:bg-[#f5f0ea] hover:text-[#111112] transition-all">
          Postular 2026
        </button>
      </div>
    </div>
    
    <!-- Indicador de Scroll -->
    <a href="#intro" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono uppercase tracking-widest text-[#f5f0ea]/60 flex flex-col items-center gap-2 hover:text-[#f5f0ea] transition-colors">
      <span>Scroll</span>
      <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
    </a>
  </section>
  ```
- **Claves Técnicas**:
  - `h-svh` previene saltos de tamaño cuando la barra de direcciones de navegadores móviles (Safari/Chrome) se colapsa.
  - Fallback a `100vh` para navegadores antiguos.
  - Tipografía proporcional que se adapta limpiamente desde pantallas de 375px hasta monitores 4K.

---

### 3.3 Sección de Cita Editorial y Metadatos Oficiales (`<dl>`)
Replicando exactamente el layout a 2 columnas con cita y lista de datos oficiales de Monte:
- **Estructura HTML**:
  ```html
  <section id="metadatos" class="py-16 lg:py-28 bg-[#f5f0ea] text-[#111111]">
    <div class="container mx-auto px-5 lg:px-10">
      <div class="border-t border-[#b9b1a4]/40 pt-12 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12">
        <!-- Columna Izquierda (6 cols): Cita Editorial -->
        <div class="lg:col-span-6 flex flex-col justify-between">
          <div class="space-y-6">
            <span class="text-xs font-mono uppercase tracking-widest text-[#717171]">Manifiesto Fraterno</span>
            <blockquote class="font-serif text-2xl sm:text-3xl lg:text-4xl leading-snug font-normal text-[#111111]">
              “Wistus no es simplemente una danza; es un latido colectivo que hace vibrar el asfalto paceño. Llevamos el ritmo del Tinku en la sangre, transformando cada ensayo en hermandad y cada paso en devoción.”
            </blockquote>
          </div>
          <div class="pt-8 text-sm text-[#717171]">
            <p class="font-medium text-[#111111]">Gran Poder &bull; Entrada Universitaria UMSA</p>
            <p>La Paz, Bolivia &bull; Gestión Cultural 2026</p>
          </div>
        </div>

        <!-- Columna Derecha (5-6 cols, col-start-8 a 12): Lista de Metadatos <dl> -->
        <div class="lg:col-span-5 lg:col-start-8">
          <dl class="grid grid-cols-[auto_1fr] gap-y-6 text-sm">
            <dt class="border-b border-[#b9b1a4]/40 pb-3 min-w-[120px] lg:min-w-[140px] text-xs font-mono uppercase tracking-widest text-[#717171]">
              Horarios
            </dt>
            <dd class="border-b border-[#b9b1a4]/40 pb-3 pl-4 text-[#111111]">
              Sábados y Domingos: 15:00 – 19:00<br>
              Miércoles (Ensayo General): 19:30 – 21:30
            </dd>

            <dt class="border-b border-[#b9b1a4]/40 pb-3 text-xs font-mono uppercase tracking-widest text-[#717171]">
              Lugar / Sede
            </dt>
            <dd class="border-b border-[#b9b1a4]/40 pb-3 pl-4 text-[#111111]">
              Cancha San Andrés / Atrio Monoblok UMSA<br>
              Av. Villazón, La Paz, Bolivia
            </dd>

            <dt class="border-b border-[#b9b1a4]/40 pb-3 text-xs font-mono uppercase tracking-widest text-[#717171]">
              Directiva
            </dt>
            <dd class="border-b border-[#b9b1a4]/40 pb-3 pl-4 text-[#111111]">
              <a href="tel:+59170123456" class="hover:underline font-mono">+591 70123456</a> / 
              <a href="tel:+59178901234" class="hover:underline font-mono">+591 78901234</a><br>
              <a href="mailto:directiva@tinkuswistus.bo" class="hover:underline">directiva@tinkuswistus.bo</a>
            </dd>

            <dt class="border-b border-[#b9b1a4]/40 pb-3 text-xs font-mono uppercase tracking-widest text-[#717171]">
              Comunidad
            </dt>
            <dd class="border-b border-[#b9b1a4]/40 pb-3 pl-4 flex flex-wrap gap-x-4 gap-y-1">
              <a href="https://instagram.com" target="_blank" class="hover:underline">Instagram</a>
              <a href="https://facebook.com" target="_blank" class="hover:underline">Facebook</a>
              <a href="https://tiktok.com" target="_blank" class="hover:underline">TikTok</a>
              <a href="https://youtube.com" target="_blank" class="hover:underline">YouTube</a>
            </dd>

            <dt class="border-b border-[#b9b1a4]/40 pb-3 text-xs font-mono uppercase tracking-widest text-[#717171]">
              Portal
            </dt>
            <dd class="border-b border-[#b9b1a4]/40 pb-3 pl-4">
              <a href="index.html" class="inline-flex items-center gap-1.5 font-semibold text-[#7c3aed] hover:text-[#5b21b6] transition-colors">
                <span>Acceso Fraternos Registrados</span> &rarr;
              </a>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </section>
  ```

---

### 3.4 Galería Carrusel con Proporciones Dinámicas (Swiper)
En Monte, las imágenes en el slider no tienen un ancho rígido idéntico, sino que fluyen con altura uniforme (`h-[50vw] lg:h-[35vw]`) y anchos basados en su aspect ratio (16:9 panorámicas, 4:5 retratos, 3:2 acción).
- **Configuración de Swiper**:
  ```javascript
  const gallerySwiper = new Swiper('#gallery-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    centeredSlides: false,
    grabCursor: true,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    breakpoints: {
      1024: {
        spaceBetween: 28
      }
    }
  });
  ```
- **Estructura del Slide**:
  ```html
  <div class="swiper-slide !w-auto">
    <div class="h-[50vw] max-h-[460px] lg:h-[32vw] lg:max-h-[500px] aspect-[4/5] rounded-xl overflow-hidden bg-[#ddd8d2] shadow-sm">
      <img src="..." alt="Fotografía Wistus" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out">
    </div>
  </div>
  ```

---

### 3.5 Bloque CTA y Tarjeta Holográfica 3D Interactiva ("Credencial Fraterna 2026")
Monte tiene una sección CTA en fondo negro con una animación de gift cards tridimensionales apiladas con video y reflejo de marca. Adaptamos esta pieza maestra para la **"Credencial Fraterna Digital 2026"**:

- **Arquitectura Visual**:
  - Contenedor oscuro carbón: `bg-[#0e0e11] text-[#f5f0ea] rounded-2xl lg:rounded-3xl p-8 lg:p-16 overflow-hidden relative border border-[#ffffff]/10`.
  - Columna Izquierda: Redacción editorial de captación y membresía, con el botón "Postular / Inscribirme Ahora".
  - Columna Derecha: Tarjeta de PVC 3D interactiva que responde en tiempo real al movimiento del cursor (Desktop) y al tacto/inclinación (Móvil).

- **Efecto Holográfico y Tilt 3D (Implementación Pura CSS & JS sin Three.js)**:
  - `perspective: 1000px; transform-style: preserve-3d;`
  - Escucha eventos `mousemove` sobre la tarjeta:
    ```javascript
    function initCardTilt(cardEl) {
      cardEl.addEventListener('mousemove', (e) => {
        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 14;
        
        cardEl.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        
        // Destello holográfico que se desplaza con la luz
        const glareEl = cardEl.querySelector('.card-glare');
        if (glareEl) {
          const px = (x / rect.width) * 100;
          const py = (y / rect.height) * 100;
          glareEl.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.45) 0%, rgba(217,119,6,0.2) 30%, rgba(124,58,237,0.2) 60%, transparent 80%)`;
          glareEl.style.opacity = '1';
        }
      });

      cardEl.addEventListener('mouseleave', () => {
        cardEl.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        const glareEl = cardEl.querySelector('.card-glare');
        if (glareEl) glareEl.style.opacity = '0';
      });
    }
    ```
  - **Detalles Gráficos de la Credencial en la Tarjeta**:
    - Relación de aspecto PVC ISO 7810: `aspect-[1.586]` (85.6mm &times; 53.98mm).
    - Escudo oficial de Wistus con acabado oro metálico.
    - Microchip chip inteligente SVG dorado.
    - Sello holográfico irisado: "CREDENCIAL OFICIAL GESTIÓN 2026 &bull; TINKUS WISTUS".
    - Código QR vectorial de validación fraterna.
    - Tipografía en relieve simulado con `text-shadow`.

---

### 3.6 Carrusel de Bloques Fraternos ("Nuestros Bloques")
Replicando el carrusel de venues ("More Venues") de Monte:
- **Bloques Incluidos**:
  1. **Bloque Machas**: Los guerreros de vanguardia. Potencia física, saltos de altura y bravura.
  2. **Bloque Imillas**: Danza femenina tradicional. Colorido, pollera bordada y cadencia andina.
  3. **Bloque Ñaupas / Mayores**: Los fundadores y experimentados. Elegancia, historia y jerarquía.
  4. **Bloque Sambos / Wanllis**: Fuerza juvenil, coreografía rápida, pasos ágiles y vigor.
- **Formato del Card**:
  - Relación de aspecto `aspect-[520/607]`, bordes redondeados (`rounded-xl`), overlay que cambia con hover.
  - Título en Serif `h2` con línea divisoria fina (`border-b border-[#b9b1a4]/40`).
  - Sinopsis de 2 líneas y botón `btn-secondary` ("Postular a este Bloque").

---

### 3.7 Barra Inferior Fija ("Find a Table" / "Unirse a la Fraternidad")
- **Monte Original**: Una barra inferior pegada al borde inferior (`fixed bottom-0 inset-x-0 z-30`), con altura de `3.25rem` a `4.375rem`, fondo `bg-[#b9b1a4]`, texto negro que se eleva sutilmente en hover (`group-hover:-translate-y-1 transition duration-300`).
- **Nuestra Adaptación**:
  ```html
  <div class="fixed bottom-0 inset-x-0 z-30 shadow-lg border-t border-[#b9b1a4]/60">
    <button id="btn-bottom-bar" class="w-full bg-[#b9b1a4] text-[#111111] h-[3.25rem] lg:h-[4.25rem] flex items-center justify-center font-serif text-lg lg:text-xl font-medium tracking-wide group transition-all duration-300 hover:bg-[#111111] hover:text-[#f5f0ea]">
      <span class="inline-flex items-center gap-2 transform group-hover:-translate-y-0.5 transition-transform duration-300">
        <span>Unirse a la Fraternidad &bull; Ingresar al Portal</span>
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </span>
    </button>
  </div>
  ```
- **Comportamiento**: Al hacer clic en esta barra fija, se despliega el modal a pantalla completa con navegación directa a todas las opciones clave.

---

### 3.8 Modal de Navegación a Pantalla Completa
- **Monte Original**: `<dialog id="find-a-table" class="backdrop:bg-black/70 backdrop:backdrop-blur-sm ...">` con enlaces enormes centrados en Serif `h2` y efecto atenuador en los no seleccionados (`has-[:hover]:text-black/25`).
- **Nuestra Adaptación**:
  - Enlaces destacados:
    1. **Ingresar al Portal Fraterno** (enlace directo a `index.html`).
    2. **Postular / Ficha de Inscripción 2026** (abre el lateral drawer).
    3. **Cronograma y Puntos de Ensayo** (scroll suave o modal de horarios).
    4. **Aportes y Cuotas de Gestión** (información de membresía).
    5. **Contactar con la Directiva** (WhatsApp directo).
  - Barra de cierre en la parte inferior con botón "Cerrar" en tipografía editorial.

---

### 3.9 Drawer Lateral Emergente ("Enquire Now" / "Ficha de Postulación")
- **Monte Original**: Diálogo lateral derecho (`dialog#enquire`) de ancho adaptativo (`lg:w-[540px] xl:w-[600px] ml-auto h-dvh bg-white text-black`), que se abre con animación suave y formulario con campos tipo píldora.
- **Campos del Formulario Wistus 2026**:
  1. Nombre y Apellidos (Requerido)
  2. Número de Celular / WhatsApp (Requerido, validado con formato de Bolivia: 8 dígitos)
  3. Correo Electrónico (Requerido)
  4. Bloque de Interés (Selector desplegable: Machas, Imillas, Ñaupas, Sambos, Banda/Música)
  5. ¿Tienes experiencia previa en Tinku? (Radio / Select: Sí / No)
  6. Mensaje o consultas adicionales
  7. Botón de Enviar Postulación con feedback reactivo (pantalla de agradecimiento o toast).

---

### 3.10 Footer Editorial y Boletín
- Layout en 2 columnas:
  - **Columna 1**: Directorio de enlaces en Serif `h4` (Fraternidad, Ensayos, Bloques, Credenciales, Portal Fraterno, Contacto, Transparencia).
  - **Columna 2**: Formulario de suscripción a avisos oficiales / convocatorias (campo minimalista con solo borde inferior).
  - **Fila Inferior**: Copyright (`© 2026 Fraternidad Folklórica y Cultural Tinkus Wistus`), enlaces legales de privacidad y enlace de retorno al portal.

---

## 4. Recomendación de Stack Técnico Frontend (Sin Empaquetadores Pesados)

Para cumplir con el requerimiento de una solución limpia, rápida, confiable y que no dependa de Webpack, Vite ni instalaciones npm pesadas, se recomienda la siguiente arquitectura:

| Capa | Solución Recomendada | Justificación Técnica |
|---|---|---|
| **Motor CSS** | **Tailwind CSS v3 CDN** (`cdn.tailwindcss.com`) + Estilos CSS Custom en bloque `<style>` | Permite replicar con precisión quirúrgica todas las clases utilitarias de Monte (`py-block`, `grid-cols-12`, `h-svh`, etc.) y configurar el tema exacto mediante script de config en milisegundos. |
| **Tipografía** | **Google Fonts CDN** (`Playfair Display`, `Plus Jakarta Sans`, `DM Mono`) | Coincide 1:1 con la trinidad tipográfica de Monte (Serif editorial, Sans moderno, Mono espaciado) con renderizado instantáneo y caché global. |
| **Carruseles** | **Swiper.js v11 CDN** (CSS y JS desde `cdn.jsdelivr.net`) | Mismo motor utilizado por Monte en producción. Soporte táctil inigualable, `slidesPerView: 'auto'`, loop infinito y rendimiento acelerado por GPU. |
| **Iconografía** | **Lucide Icons** (CDN o SVGs inline puros) | Iconos lineales modernos, ultraligeros, sin colisión de estilos y con soporte accesible. Los iconos críticos se incluirán como SVG inline para asegurar funcionamiento 100% offline. |
| **Lógica JS** | **JavaScript Vanilla Moderno (ES6+)** en módulo estructurado | Cero dependencias adicionales, ejecución directa en cualquier navegador, peso mínimo (<15 KB), sin riesgo de incompatibilidades ni transpilaciones. |

### Configuración del Tema Tailwind CDN en `landing.html`:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          silver: '#f5f0ea',
          'grey-light': '#b9b1a4',
          'grey-lighter': '#ddd8d2',
          'charcoal': '#111111',
          'wistus-purple': '#7c3aed',
          'wistus-gold': '#d97706',
          'wistus-amber': '#fbbf24',
        },
        fontFamily: {
          serif: ['"Playfair Display"', 'Georgia', 'serif'],
          sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
          mono: ['"DM Mono"', 'monospace'],
        },
        height: {
          header: '3.25rem',
          'header-lg': '4.375rem',
        }
      }
    }
  }
</script>
```

---

## 5. Matriz de Responsividad (375px a 2560px)

| Viewport | Ancho | Navbar | Hero | Metadatos `<dl>` | Bloque CTA / 3D Card | Barra Inferior | Drawer Lateral |
|---|---|---|---|---|---|---|---|
| **Móvil Chico** | 375px - 480px | Compacto, logo + hamburger + Unirse | `h-svh`, título `text-5xl`, centrado | 1 columna, `<dl>` vertical | Columna vertical, tarjeta escala 88% | Fija abajo, texto compacto | Ocupa 100% ancho de pantalla |
| **Tablet** | 768px - 1023px | Enlaces clave o menú, logo expandido | `h-svh`, título `text-7xl` | 2 columnas (cita + tabla) | 2 columnas o apilado fluido | Fija abajo | Ocupa 480px a la derecha |
| **Desktop** | 1024px - 1439px | Completo con links directos y botón portal | `h-svh`, título `text-8xl` | 12 columnas (6 col cita, 5 col metadatos) | 12 columnas (6 col texto, 6 col 3D card) | Fija abajo | Ocupa 540px a la derecha |
| **Ultra-Wide** | 1440px+ | Max-w 1400px, centrado | Centrado max-w, márgenes generosos | 12 columnas espacioso | Espacioso, tarjeta 3D a gran escala | Fija abajo | Ocupa 600px a la derecha |

---

## 6. Enlace Bidireccional Fluido con el Portal Actual (`index.html`)

El usuario requiere una integración fluida de ida y vuelta entre la landing institucional (`landing.html`) y el portal fraterno (`index.html`):

1. **De `landing.html` a `index.html`**:
   - Enlace permanente en Header ("Portal Fraterno &rarr;").
   - Opción destacada en el Modal de Navegación Inferior ("Ingresar al Portal Fraterno").
   - Fila dedicada en la sección de Metadatos (`<dl>`).
   - Enlace en Footer.
   - Posibilidad de pasar parámetros de consulta: e.g. `index.html?from=landing` o `index.html?action=login`.

2. **De `index.html` a `landing.html`**:
   - En la vista de login de `index.html`, agregar un enlace superior o inferior discreto pero distinguido:
     - *"&larr; Volver a la Landing Institucional / Convocatoria 2026"*.
   - En el menú lateral o navbar de fraternos autenticados:
     - Acceso directo a *"Ver Landing Pública / Convocatoria 2026"*.

---

## 7. Criterios de Aceptación y Validación Automatizada

Para asegurar la máxima calidad y verificar la solución contra `tests_verification.py` o un nuevo script `test_landing_page.py`:

1. **Verificación Estructural del DOM**:
   - Existencia de `landing.html` en la raíz del proyecto.
   - Presencia de IDs y selectores requeridos: `#site-header`, `#hero`, `#metadatos`, `[data-venue-metadata]`, `#gallery-swiper`, `#bloques-swiper`, `#card-3d-wistus`, `#btn-bottom-bar`, `#modal-portal-nav`, `#enquire-drawer`, `#site-footer`.
2. **Validación de Enlaces de Activos y Dependencias**:
   - Verificación de que todos los recursos locales (`assets/img/wistus-badge.svg`, `assets/img/wistus-banner.jpg`, etc.) existen y no devuelven 404.
   - Enlace bidireccional válido a `index.html`.
3. **Validación de Sintaxis y Scripts**:
   - Sin errores de parseo HTML ni JavaScript.
   - Inicialización correcta de Swiper y listeners de eventos (`DOMContentLoaded`, `scroll`, `click`).
4. **Fidelidad Visual y UX**:
   - Header blur en scroll, apertura limpia de drawer y modal, tarjeta 3D interactiva, responsive en 375px.

---

*Reporte elaborado por `survey_explorer_monte_3`.*
