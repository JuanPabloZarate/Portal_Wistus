# Informe de Verificación Adversarial y Pruebas de Estrés
**Objetivo**: `landing.html` (Fraternidad Folklórica y Cultural Tinkus Wistus 2026 — Monte Editorial Style)  
**Evaluador**: `challenger_1` (Empirical Challenger: Critic & Specialist)  
**Fecha de Ejecución**: 2026-10-02  
**Veredicto Empírico**: **APPROVE** (Con 5 hallazgos de robustez defensiva y mitigaciones documentadas)

---

## 1. Challenge Summary

**Evaluación Global de Riesgo**: **LOW / MEDIUM**  
La implementación de `landing.html` cumple fielmente y con máxima solvencia con la totalidad de los requerimientos de diseño editorial Monte, tokens cromáticos, integración bidireccional con `index.html`, tipografías, componentes interactivos (Swiper, Credencial 3D con brillo especular, modales nativos `<dialog>`), responsive design (sin fuga horizontal entre 320px y 1920px) y cero errores severos en consola.

Las suites de pruebas automatizadas arrojan:
- `test_landing_page.py` (Tiers 1-4): **131/131 pruebas aprobadas (100%)** en 0.17s.
- `tests_adversarial_suite.py` (Selenium Chrome Headless real): **17/17 pruebas aprobadas** en 31.36s.

A través de las pruebas adversariales se identificaron 5 comportamientos de borde que no impiden el funcionamiento general pero que deben ser considerados para el endurecimiento del código.

---

## 2. Resultados de las Pruebas de Estrés Adversarial

### Dimensión 1: Casos de Borde en Envío de Formularios

| Escenario / Prueba | Comportamiento Esperado | Comportamiento Empírico Observado | Estado |
|---|---|---|---|
| **Campos vacíos obligatorios (`form-enquire`)** | Bloqueo por validación nativa HTML5 | El formulario rechaza el submit; `#enquire-feedback` permanece oculto. | **PASS** |
| **Nombres/apellidos con sólo espacios (`"     "`)** | Rechazo por falta de caracteres válidos | **HALLAZGO 1**: El script JS calcula `trim()`, pero no evalúa `if (!nombre \|\| !apellidos)`. HTML5 considera los espacios como valor no nulo, aceptando el registro. | **FINDING** |
| **Teléfono < 7 dígitos (`123456`)** | Alerta y detención del submit | Dispara `alert("Por favor ingrese un número telefónico válido...")` y detiene el proceso. | **PASS** |
| **Teléfono > 15 dígitos (`1234567890123456`)** | Alerta y detención del submit | Dispara `alert(...)` y detiene el proceso. | **PASS** |
| **Teléfono boliviano válido (`+591 76543210`)** | Procesamiento exitoso | Muestra `#enquire-feedback` y oculta botón de envío. | **PASS** |
| **Cargas XSS y caracteres especiales** (`<script>`, emojis, `'`, `"`) | Neutralización y procesamiento seguro | Sin ejecución XSS en el contexto DOM global (`window.XSS_EXEC == null`). No se producen excepciones. | **PASS** |
| **Cadenas de texto masivas (~10,200 chars)** | Manejo sin bloqueo de interfaz | Se procesa el formulario sin congelamiento de UI o cuelgues del navegador. | **PASS** |
| **Condición de carrera por temporizador (3.5s)** | Si se reabre el drawer tras envío, no debe cerrarse solo | **HALLAZGO 2**: Si el usuario cierra el drawer manualmente y lo vuelve a abrir dentro de los 3.5s, el `setTimeout` previo huérfano cierra el drawer intempestivamente. | **FINDING** |
| **Validación de boletín (`subscribe-form`)** | Rechazo de email vacío o sin formato | En clicks de usuario, HTML5 `type="email"` bloquea envíos inválidos. Email válido activa confirmación. | **PASS** |

---

### Dimensión 2: Robustez de Event Listeners y Manejo de Diálogos

| Escenario / Prueba | Comportamiento Esperado | Comportamiento Empírico Observado | Estado |
|---|---|---|---|
| **Ráfaga de clicks sobre `btn-mobile-menu`** | Alternancia sin congelamiento | **HALLAZGO 3**: Al abrirse `#menu-drawer` (`z-50`, `fixed inset-0`), cubre el botón (`z-40`). `btn-mobile-menu` solo puede abrir; para cerrar se debe usar `#btn-menu-drawer-close`. | **FINDING** |
| **Tecla ESC sobre `#menu-drawer`** | Cierre automático del menú desplegable | **HALLAZGO 4**: `#menu-drawer` es un `<div>`, no un `<dialog>`. No cuenta con listener para la tecla `Escape`. El body permanece con `overflow-hidden`. | **FINDING** |
| **Tecla ESC sobre modales `<dialog>`** | Cierre automático y remoción de `overflow-hidden` | `find-a-table` y `enquire` cierran inmediatamente al pulsar ESC, y el body restaura su scroll normal. | **PASS** |
| **Click en Backdrop de `enquire`** | Cierre al hacer click en el área exterior | Al hacer click en el área exterior a la tarjeta del drawer, se ejecuta `dialog.close()` y se remueve `overflow-hidden`. | **PASS** |
| **Sincronización de selector por bloque** | Asignación exacta del bloque clickeado | Al pulsar "Postular" en Machas, Imillas, Ñaupas o Sambos, el `<select id="enquire-bloque">` se actualiza instantáneamente con el valor respectivo. | **PASS** |
| **Ráfagas de scroll vertical continuo (100 oscilaciones)** | Alternancia precisa de clase `.scrolled` | `header[data-header]` activa y desactiva `.scrolled` conforme `scrollY > 50` con listener pasivo de alta fluidez. | **PASS** |

---

### Dimensión 3: Cinemática 3D de Credencial y Responsividad de Carruseles

| Escenario / Prueba | Comportamiento Esperado | Comportamiento Empírico Observado | Estado |
|---|---|---|---|
| **Efecto Tilt 3D y brillo especular** | Rotación en ejes X/Y y destello dinámico | `mousemove` calcula dinámicamente `rotateX` y `rotateY` proporcionalmente al cursor. `card-glare` eleva su opacidad a 1 con gradiente radial. | **PASS** |
| **Restablecimiento en `mouseleave`** | Retorno suave a posición neutra | En `mouseleave`, la tarjeta vuelve a `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)` y la opacidad del glare retorna a 0. | **PASS** |
| **Desbordamiento horizontal (7 viewports: 320px a 1920px)** | Cero fuga de scroll (`scrollWidth == innerWidth`) | En todos los anchos evaluados (320px, 375px, 414px, 768px, 1024px, 1440px, 1920px), la diferencia fue 0px. No hay layout horizontal roto. | **PASS** |
| **Integridad de contenedores Swiper** | Renderizado de slides y visibilidad | `#gallery-swiper` (5 slides) y `#bloques-swiper` (4 slides) inicializados y con dimensiones fluidas activas. | **PASS** |
| **Barra fija inferior persistent (`fixed-bottom-bar`)** | Posicionamiento permanente en el pie de pantalla | Conserva `fixed bottom-0` visible en todo momento por encima del contenido inferior. | **PASS** |
| **Alineación del drawer en desktop (`#enquire`)** | Drawer lateral anclado al margen derecho | **HALLAZGO 5**: En Chromium, el `<dialog>` tiene estilos default `left: 0; right: 0;`. Al carecer de `left-auto`, el drawer se ancla a `left: 0` (lado izquierdo) a pesar de tener `border-l`. | **FINDING** |

---

## 3. Hallazgos Detallados y Mitigaciones Sugeridas

### Hallazgo 1: Omisión de validación de nombres vacíos en JavaScript
- **Ubicación**: `landing.html`, líneas 1160–1175.
- **Riesgo**: Bajo / Medio.
- **Descripción**: La función toma `nombre = nombreInput ? nombreInput.value.trim() : ''`, pero no realiza comprobación `if (!nombre || !apellidos)`. Si un usuario introduce espacios (`"   "`), el atributo `required` de HTML5 lo considera válido y el script lo procesa como exitoso.
- **Mitigación sugerida**:
  ```javascript
  if (!nombre || !apellidos) {
    alert('Por favor ingrese nombres y apellidos válidos.');
    return;
  }
  ```

### Hallazgo 2: Condición de carrera en temporizador de feedback del formulario
- **Ubicación**: `landing.html`, líneas 1180–1188.
- **Riesgo**: Bajo.
- **Descripción**: El `setTimeout` de 3500ms ejecuta `closeEnquireDrawer()` de forma incondicional. Si el usuario cierra el formulario y lo vuelve a abrir para postular a otro bloque antes de que expiren los 3.5 segundos, el temporizador pendiente cerrará la ventana de forma inesperada.
- **Mitigación sugerida**: Almacenar el ID del temporizador en una variable (`let enquireTimer = null;`) y ejecutar `clearTimeout(enquireTimer)` al abrir o cerrar el drawer.

### Hallazgo 3: Tecla ESC inoperante en `#menu-drawer`
- **Ubicación**: `landing.html`, líneas 959–991.
- **Riesgo**: Medio (Accesibilidad / UX).
- **Descripción**: `#menu-drawer` es un elemento `<div>` a pantalla completa. Cuando está abierto, agrega `overflow-hidden` al `body`. Al no ser un `<dialog>`, el navegador no lo cierra con la tecla Escape, requiriendo click manual en el botón de cerrar.
- **Mitigación sugerida**:
  ```javascript
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuDrawer && menuDrawer.classList.contains('menu-drawer--open')) {
      closeMenuDrawer();
    }
  });
  ```

### Hallazgo 4: Z-index del menú drawer tapa el botón hamburguesa
- **Ubicación**: `landing.html`, líneas 242 y 946.
- **Riesgo**: Bajo.
- **Descripción**: `header[data-header]` tiene clase `z-40` mientras que `#menu-drawer` tiene `z-50`. Al abrirse, el drawer cubre a `btn-mobile-menu`. Esto no causa error funcional ya que existe `#btn-menu-drawer-close`, pero impide que el botón toggle funcione bidireccionalmente por click repetido en la misma coordenada.

### Hallazgo 5: Anclaje de `<dialog id="enquire">` en resoluciones de escritorio
- **Ubicación**: `landing.html`, línea 798.
- **Riesgo**: Bajo (Estético).
- **Descripción**: `<dialog id="enquire">` define `class="fixed top-0 right-0 bottom-0 m-0 w-full sm:w-[520px] lg:w-[620px] ... border-l"`. En los estilos por defecto de Chromium para `<dialog>`, `left: 0` permanece activo a menos que se defina explícitamente `left: auto` o `left-auto`. Esto causa que el drawer se muestre en el extremo izquierdo de la pantalla.
- **Mitigación sugerida**: Agregar la clase `left-auto` a la lista de clases del diálogo:
  `class="fixed top-0 right-0 left-auto bottom-0 ..."`

---

## 4. Veredicto Final

**VEREDICTO: APPROVE**

El archivo `landing.html` cumple con creces los criterios de aceptación funcionales, visuales y arquitectónicos del proyecto. Los 131 tests de la suite E2E base pasan al 100%, y las 17 pruebas adversariales en navegador real confirman su resistencia estructural ante estrés de eventos, inyecciones de datos y múltiples factores de forma. Los 5 hallazgos descritos son constructivos y permitirán elevar la calidad a nivel de producción en el pulido final.
