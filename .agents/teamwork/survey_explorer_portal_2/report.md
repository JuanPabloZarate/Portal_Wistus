# Reporte de Exploración del Código Base, Activos y Estrategia de Integración
## Portal Fraternal Tinkus Wistus — Entrada Universitaria La Paz 2026 / Oruro 2027

**Agente**: `survey_explorer_portal_2`  
**Rol**: Teamwork Preview Explorer (`teamwork_preview_explorer`)  
**Fecha de Exploración**: 2026-10-02  
**Directorio de Trabajo**: `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_explorer_portal_2`  
**Raíz del Proyecto**: `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal`  
**Documento de Requisitos**: `.agents/teamwork/ORIGINAL_REQUEST.md`  
**Estado**: Completo & Verificado  

---

## 1. Resumen Ejecutivo

La Fraternidad Cultural y Folklórica **Tinkus Wistus** cuenta con un portal web SPA existente y plenamente operativo (`index.html`, 156 KB), concebido para la gestión interna de fraternos (cédula de identidad, padrón biométrico, registro de cuotas, libro de pagos, asistencias por QR y mesa directiva).

El objetivo de la presente investigación es realizar una auditoría integral y de solo lectura de dicho código base para guiar la creación de `landing.html`: una **landing page institucional y de captación editorial de alta gama** inspirada en el prestigioso sitio de **Monte (DOMA R&B)** (`https://domarb.com.au/venue/monte/`).

### Hallazgos Principales:
1. **Activos de Marca Existentes de Alta Fidelidad**: El repositorio cuenta con un conjunto de vectores SVG y gráficos rasterizados de excepcional calidad (`assets/img/wistus-badge.svg`, `wistus-logo-w.svg`, `wistus-escudo.svg`, `wistus-banner.jpg`), con una resolución de hasta 2048×1285px en fotografía y vectores matemáticamente escalables con Chakana Andina, monograma "W" facetado en lilas y marcos dorados.
2. **Componente Precursor de Credencial**: El proyecto ya dispone de `css/credencial.css` con animación holográfica de shimmer dorado (`goldHolographicGlow`), sellos conmemorativos y distribución de tarjeta PVC, sirviendo de base directa para el componente 3D solicitado en R4.
3. **Brecha de Fotografía Multibloque**: Solo existe una fotografía rasterizada local en alta resolución (`wistus-banner.jpg`). Para satisfacer el carrusel de galería y el carrusel de 4 bloques (Machas, Imillas, Ñaupas, Sambos), se requiere una estrategia de recursos fotográficos culturales curados con fallback local garantizado.
4. **Integración Bidireccional Limpia y Sin Fricción**: `index.html` actualmente carece de enlaces hacia `landing.html`. Se han identificado los puntos precisos de inyección en la pantalla de login (`#view-login`), barra lateral (`#appSidebar`) y barra superior (`portal-topbar`).
5. **Configuración de Despliegue en Vercel**: `vercel.json` tiene una regla comodín `/(.*)` hacia `/index.html` que interceptaría `/landing.html` si no se declara la ruta explícita previa.

---

## 2. Inventario Exhaustivo y Análisis del Código Base Actual

A continuación se detalla la estructura física del proyecto en `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal`:

| Archivo / Directorio | Tamaño (Bytes) | Rol y Tecnologías | Estado y Reutilización |
| :--- | :--- | :--- | :--- |
| `index.html` | 156,846 | SPA principal de gestión fraterna (Bootstrap 5.3.3, Icons, Animate.css, Firebase v10 compat). | Punto de llegada y retorno para fraternos registrados. |
| `css/style.css` | 49,141 | Sistema de diseño de la plataforma (`--brand-primary: #7c3aed`, `--warning: #d97706`, Slate neutrals). | Referencia de tokens CSS y utilidades de marca. |
| `css/credencial.css` | 6,046 | Estilos de credencial digital PVC con destello holográfico y modo impresión. | Base CSS del componente 3D holográfico. |
| `js/data.js` | 36,645 | Estructura de datos: configuración de tema, bloques, cuotas, bancos, eventos, comunicados y miembros. | Proveedor de datos institucionales (horarios, sedes, bloques, cuotas). |
| `js/state.js` | 37,485 | Gestor de estado reactivo (`StateManager`), persistencia en `LocalStorage` y sincronización. | Lógica de negocio del portal fraterno. |
| `js/auth.js` | 14,221 | Control de acceso por CI para miembros y credenciales para directiva. | Manejo de sesiones y redirecciones. |
| `js/asistencias.js` | 45,587 | Módulo de asistencias y escáner de códigos QR. | Terminal de escaneo con cámara. |
| `js/pagos.js` | 66,815 | Módulo de pagos, verificación de comprobantes y pasarela simulada. | Libro de cuotas y saldos. |
| `js/miembros.js` | 12,443 | Padrón y kardex individual de fraternos. | Directorio de fraternos. |
| `js/app.js` | 76,622 | Coordinador general del portal (`PortalApp`), enrutamiento de vistas internas (`showView`). | Controlador de UI y notificaciones. |
| `js/db-service.js` | 9,040 | Abstracción de base de datos híbrida (Firebase Firestore / LocalStorage). | Capa de persistencia. |
| `js/firebase-config.js` | 3,575 | Configuración de Firebase Web. | Credenciales de nube. |
| `tests_verification.py` | 42,499 | Suite de pruebas unitarias en Python (`unittest`) con 30 tests automatizados. | Pasa 100% OK. Modelo para `test_landing_page.py`. |
| `iniciar_portal.py` | 1,663 | Servidor HTTP local Python (`http.server` puerto 8000). | Ejecutable sin dependencias para pruebas locales. |
| `iniciar_portal.bat` | 667 | Script lanzador por lotes para Windows. | Launcher de 1-clic. |
| `vercel.json` | 536 | Configuración de rutas y headers para Vercel. | Requiere ajuste de enrutamiento para `landing.html`. |
| `README.md` | 5,044 | Documentación operativa del portal fraternal. | Guía institucional y de demostración. |

---

## 3. Auditoría de Activos Gráficos y Multimedia (`assets/img/`)

Se realizó una inspección binaria y vectorial detallada de cada archivo en `assets/img/`:

| Archivo | Formato | Dimensiones / Tamaño | Contenido Visual y Paleta | Aptitud para `landing.html` |
| :--- | :--- | :--- | :--- | :--- |
| `wistus-banner.jpg` | JPEG | 2048 × 1285 px (555,781 bytes) | Fotografía real de alta resolución de la Fraternidad Tinkus Wistus en desfile / entrada con vestimenta completa, monteras de plumas y público. | **Activo Estrella:** Ideal para el Hero Masthead a pantalla completa (`h-svh`) y primer slide del carrusel de fotografías. |
| `wistus-badge.svg` | SVG | ViewBox 0 0 128 128 (2,247 bytes) | Insignia circular oficial: fondo radial dorado (`#fef08a` a `#d97706`), anillo perimetral lila (`#5b21b6` a `#c084fc`), monograma "W" facetado y pespunte interior. | **Activo Estrella:** Perfecto para el Navbar Header, favicon, badge oficial sobre el Hero y cabecera de la credencial. |
| `wistus-badge.png` | PNG | 512 × 512 px (14,818 bytes) | Versión rasterizada transparente del badge oficial en alta definición. | Respaldo rasterizado para dispositivos que no rendericen SVG complejo. |
| `wistus-logo-w.svg` | SVG | ViewBox 0 0 512 512 (6,306 bytes) | Emblema monumental vectorial con Chakana Andina superior, monograma 3D "W" facetado en lilas, disco solar dorado con rayos y texto en arco *"TINKUS WISTUS"*. | **Activo Estrella:** Ideal para el componente CTA de la Credencial Holográfica 3D, modales y marcas de agua. |
| `wistus-escudo.svg` | SVG | ViewBox 0 0 400 400 (3,703 bytes) | Escudo heráldico con casco y montera tradicional de Tinku (5 plumas multicolores), chakana central, corona de laureles y cinta *"TINKUS WISTUS"*. | Ideal para la sección de historia/cultura andina, sello del Footer editorial y modales de bloques. |
| `wistus-escudo.jpg` | JPEG | 512 × 512 px (26,403 bytes) | Render rasterizado del escudo heráldico. | Avatar y respaldo rasterizado. |
| `wistus-logo.jpg` | JPEG | 512 × 512 px (26,403 bytes) | Render rasterizado del logo circular. | Respaldo rasterizado. |
| `wistus-banner.svg` | SVG | ViewBox 0 0 600 120 (997 bytes) | Tipografía vectorial decorativa: "FRATERNIDAD" y "TINKUS WISTUS" en gradiente lila. | Titulares tipográficos o firmas de sección. |
| `perfil-pagina.png` | PNG | 800 × 800 px (279,916 bytes) | Gráfico institucional cuadrado con isotipo y fondo. | Open Graph / Twitter Card (`og:image`). |
| `avatar-default.svg` | SVG | Vectorial (281 bytes) | Silueta neutra de usuario. | Foto de muestra para la credencial de membresía. |

---

## 4. Análisis de Datos Reutilizables de la Fraternidad (`js/data.js`)

`js/data.js` alberga una rica estructura de datos canónica que puede nutrir los textos editoriales de `landing.html`:

### 4.1 Identidad Institucional
- **Nombre Canónico**: Fraternidad Folklórica y Cultural Tinkus Wistus
- **Nombre Corto**: Tinkus Wistus
- **Lema Fraternal**: *"Los mejores Tinkus del país"*
- **Danza**: Tinkus (Ritmo guerrero del norte de Potosí)
- **Gestión / Convocatoria**: Entrada Universitaria La Paz 2026 (y proyección Carnaval de Oruro 2027)

### 4.2 Locales y Horarios de Ensayo (Para la Sección de Metadatos `<dl>`)
- **Sede Central**: Sede Social Tinkus Wistus (Calle Almirante Grau, Zona San Pedro, La Paz)
- **Campo de Práctica / Coreografía**: Cancha Polideportiva Munaypata / Sede Social
- **Días y Horarios**: Sábados y Domingos de 15:00 a 19:30
- **Tolerancia de Asistencia**: 15 a 20 minutos (control biométrico / QR)

### 4.3 Bloques Fraternos (Requerimiento R4)
En `data.js` figuran actualmente:
1. `machas`: Bloque Machas Wistus (Guía: Juan Pablo Quispe, cupos: 60, acento carmesí/dorado) — Representa la fuerza guerrera, destreza física y paso firme.
2. `imillas`: Bloque Imillas Wistus (Guía: Maria Elena Flores, cupos: 75, acento fucsia/lila) — Representa la gracia, juventud y agilidad femenina.
3. `mayores`: Bloque Tinkus Wistus Mayores — Veteranos y fundadores.
4. `choclos`: Bloque Choclos — Energía y dinamismo intermedio.
5. `wanllis`: Bloque Semillero Wanllis — Tradición de relevo generacional.

*Alineación con el Requerimiento R4 de `ORIGINAL_REQUEST.md`:*
El requerimiento explicita: **Bloque Machas**, **Bloque Imillas**, **Bloque Ñaupas** y **Bloque Sambos**.
- **Bloque Machas**: Los guerreros de vanguardia.
- **Bloque Imillas**: La belleza, donaire y energía de las jóvenes danzantes.
- **Bloque Ñaupas**: Los guardianes de la tradición y el paso antiguo.
- **Bloque Sambos**: El vigor acrobático, velocidad y salto contemporáneo.

### 4.4 Cuotas y Proceso de Inscripción
- Inscripción Inicial Fraterna: Bs. 250 - 300
- Banda Oficial de Bronces: Bs. 350 - 400
- Confección de Traje y Montera Artesanal: Bs. 800 - 900
- Recepción Social: Bs. 200 - 250
- Bancos para Pago: BNB, Banco Unión, BMSC, Banco BISA, Banco FIE, BancoSol (cuentas oficiales habilitadas con QR de pago).

---

## 5. Diseño y Arquitectura de Integración Bidireccional (`landing.html` ⟷ `index.html`)

Para cumplir estrictamente con los Criterios de Aceptación:
> *"La navegación entre landing.html y el portal index.html funciona de ida y vuelta."*

Se define la siguiente matriz de enlaces bidireccionales:

```
+-----------------------------------------------------------------------------------+
|                                  landing.html                                     |
|  (Sitio Institucional Editorial Monte Style: Captación, Historia, Bloques y 3D)  |
+-----------------------------------------------------------------------------------+
       │  ▲                                                             │  ▲
       │  │ (Botón Header "Ingresar al Portal")                         │  │ (Botón Modal "Pagar Cuotas")
       │  │ (Botón Bottom Bar "Ingresar al Portal")                     │  │ (Botón 3D "Ver mi Credencial")
       ▼  │                                                             ▼  │
+-----------------------------------------------------------------------------------+
|                                   index.html                                      |
|    (Portal Fraternal SPA: Login CI, Padrón, Cuotas, Asistencias, Mesa Directiva)  |
+-----------------------------------------------------------------------------------+
```

### 5.1 Enlaces Salientes desde `landing.html` hacia `index.html`
1. **Header Superior (Navbar)**:
   - Botón pill en extremo derecho: `href="index.html"`, texto *"Portal Fraterno &rarr;"*.
2. **Modal a Pantalla Completa (Monte Menu Navigation)**:
   - Opción 01: *"Ingresar al Portal Fraterno"* (`href="index.html"`).
   - Opción 04: *"Gestión de Pagos & Cuotas"* (`href="index.html"`).
3. **Barra Fija Inferior (Bottom Action Bar)**:
   - Botón secundario derecho: `href="index.html"`, icono `<i class="bi bi-box-arrow-in-right"></i>`, texto *"Acceso Fraternos"*.
4. **Sección de Cita & Metadatos (`<dl>`)**:
   - Elemento `<dd>` de "Padrón & Portal": `<a href="index.html" class="underline hover:text-purple-600">portal.tinkuswistus.bo &rarr;</a>`.
5. **Componente CTA de Credencial Holográfica 3D**:
   - Botón secundario: `<a href="index.html" class="btn-secondary">Ya soy Fraterno &bull; Ver mi Credencial &rarr;</a>`.
6. **Footer Editorial**:
   - Columna "Plataforma Oficial": Enlaces a *"Portal de Miembros"*, *"Padrón Biométrico"* y *"Panel Directiva"* que dirigen a `index.html`.

### 5.2 Enlaces de Retorno desde `index.html` hacia `landing.html`
Actualmente, `index.html` no posee ningún enlace a `landing.html`. Las siguientes modificaciones no intrusivas deben ser aplicadas por el agente constructor (`preview_builder`):

#### A. En la Vista de Login (`index.html`, `#view-login`):
- **Botón Flotante Superior**: En la parte superior de la pantalla de login:
  ```html
  <a href="landing.html" class="btn btn-sm btn-outline-light rounded-pill px-3 py-1 position-absolute top-0 start-0 m-3 z-3 d-inline-flex align-items-center gap-2">
      <i class="bi bi-arrow-left"></i>
      <span>Conoce la Fraternidad (Sitio Web)</span>
  </a>
  ```
- **En el Pie de la Tarjeta de Login (alrededor de la línea 134)**:
  ```html
  <div class="mt-2">
      <a href="landing.html" class="text-decoration-none text-muted small hover-brand">
          <i class="bi bi-globe me-1"></i> Ir a la Portada Institucional 2026 &rarr;
      </a>
  </div>
  ```

#### B. En la Barra Lateral del Shell Autenticado (`index.html`, `#appSidebar`):
- **En la Cabecera del Sidebar o Navegación (alrededor de la línea 178)**:
  ```html
  <a href="landing.html" class="sidebar-nav-item text-secondary mb-2" title="Volver al sitio web institucional">
      <i class="bi bi-box-arrow-up-right"></i>
      <span>Sitio Institucional</span>
  </a>
  ```

#### C. En la Barra Superior del Portal (`index.html`, `.portal-topbar`):
- **Junto al Perfil de Usuario (alrededor de la línea 258)**:
  ```html
  <a href="landing.html" class="btn btn-outline-secondary btn-sm rounded-pill d-none d-md-inline-flex align-items-center gap-1 me-2" title="Ver portada institucional">
      <i class="bi bi-house"></i>
      <span class="small">Portada</span>
  </a>
  ```

---

## 6. Análisis de Brecha de Activos (Existentes vs. Faltantes)

| Recurso Requerido en R1-R5 | Disponibilidad Local | Análisis y Estrategia de Resolución |
| :--- | :--- | :--- |
| **Fotografía Hero Masthead** | ✅ Existe (`assets/img/wistus-banner.jpg`) | Fotografía de 2048×1285px. Se adaptará como fondo del Hero Masthead con overlay sutil oscuro/pétreo. |
| **Badge Oficial Wistus** | ✅ Existe (`assets/img/wistus-badge.svg` y `.png`) | Vector SVG circular con "W" y orla dorada. Utilizado en Navbar, Hero y Credencial. |
| **Emblema Chakana 3D** | ✅ Existe (`assets/img/wistus-logo-w.svg`) | Vector 512×512px con Chakana y "W" facetada. Emblema central de la Credencial 3D. |
| **Escudo Heráldico Montera** | ✅ Existe (`assets/img/wistus-escudo.svg`) | Vector con montera tradicional de plumas. Utilizado como sello de prestigio en Footer y Modal. |
| **Fotografías Carrusel Galería** | ⚠️ Parcial (1 local, se requieren 4-5) | Se usará `wistus-banner.jpg` como Slide 1. Para los Slides 2 al 5, se utilizarán URLs fotográficas de alta resolución de cultura andina y tinkus (Unsplash curado) con fallback automático al banner local en caso de error de red. |
| **Fotografías Carrusel Bloques** | ⚠️ No existen fotos separadas por bloque | Se configurará un layout de tarjeta editorial de alta costura con estética de tarjeta de revista: fondo con gradiente temático de bloque (Carmesí Machas, Rosa/Fucsia Imillas, Índigo Ñaupas, Esmeralda/Oro Sambos), insignias vectoriales Wistus, ficha técnica de vestimenta, guía y sinopsis histórica. |
| **Estilos Credencial Holográfica** | ✅ Existe (`css/credencial.css`) | La animación `@keyframes goldHolographicGlow` y el gradiente multicapa ya están afinados y se adaptarán con física de inclinación 3D (`transform: perspective(1000px) rotateX(...) rotateY(...)`). |
| **Tipografía Editorial Serif** | ⚠️ Requiere importación de Google Fonts | Monte utiliza `Domaine Text`. Se importará `Cormorant Garamond` y/o `Playfair Display` desde Google Fonts, complementada con `Plus Jakarta Sans` y `JetBrains Mono` ya existentes. |
| **Librería de Carrusel Táctil** | ⚠️ Requiere CDN | Se utilizará Swiper 11 (`swiper-bundle.min.css` y `swiper-bundle.min.js`) mediante CDN de JSDelivr para fluidez táctil en móvil y arrastre en desktop. |

---

## 7. Advertencias Técnicas y Recomendaciones Operativas

1. **Configuración de Vercel (`vercel.json`)**:
   En la línea 21 de `vercel.json` existe la siguiente regla:
   ```json
   {
     "src": "/(.*)",
     "dest": "/index.html"
   }
   ```
   *Riesgo*: Cualquier solicitud a `/landing.html` en un despliegue de Vercel será reescrita a `/index.html`.
   *Recomendación*: Añadir antes de la regla comodín:
   ```json
   {
     "src": "/landing(.html)?",
     "dest": "/landing.html"
   }
   ```
2. **Cero Dependencia de Empaquetadores**:
   El proyecto opera en modo desarrollo/producción estático sin Node.js ni bundlers. `landing.html` debe mantenerse 100% autónomo, ejecutable directamente mediante doble clic o sirviéndose a través de `iniciar_portal.py`.
3. **Optimización de Rendimiento del Efecto 3D**:
   El componente interactivo de la Credencial 3D debe calcular la inclinación en función de las coordenadas del puntero relativas al centro de la tarjeta (`boundingClientRect`), aplicando `will-change: transform` y limitando el ángulo a ±15 grados para evitar saltos visuales en pantallas de alta tasa de refresco.
4. **Respeto a los 375px Móviles**:
   La barra fija inferior (`#fixedBottomBar`) no debe superponerse con el contenido final del footer; el `<body>` debe contar con un `padding-bottom: 5rem` para garantizar legibilidad completa.

---

## 8. Especificación para la Suite de Verificación (`test_landing_page.py`)

Siguiendo el estándar de `tests_verification.py`, la nueva suite de verificación automatizada `test_landing_page.py` debe evaluar de forma programática:

```python
import os
import unittest
from bs4 import BeautifulSoup

class TestLandingPageMonteStyle(unittest.TestCase):
    def test_01_landing_html_exists_and_valid(self):
        # Valida existencia y tamaño superior a 5KB
        ...
    def test_02_key_dom_sections_present(self):
        # Valida header, hero, metadatos (<dl>), galeria, bloques, credencial 3d, modales, fixed bar y footer
        ...
    def test_03_bidirectional_links_to_index(self):
        # Valida que existan enlaces directos href="index.html"
        ...
    def test_04_static_assets_referenced_exist(self):
        # Valida que todas las imágenes locales referenciadas en landing.html existan en assets/img/
        ...
    def test_05_index_html_has_return_links(self):
        # Valida presencia de enlaces de retorno hacia landing.html en index.html
        ...
```

---

## 9. Conclusión del Análisis

El código base del Portal Fraternal Tinkus Wistus es sólido, limpio y modular. Proporciona una base idónea de activos institucionales, esquemas de color y datos para construir una landing page editorial del más alto calibre estético. La combinación de la arquitectura de Monte (DOMA R&B) con los activos culturales de Tinkus Wistus resultará en una experiencia web de vanguardia.
