# PLAN.md — floui.mx

Basado en PRD v1.0 (floui_proximamente_PRD.md). Ordenado por prioridad.

---

## Fase 1 — Fixes urgentes (antes de activar tráfico)

| # | Tarea | Detalle | Archivo |
|---|-------|---------|---------|
| 1.1 | Activar Calendly | Ir a calendly.com/event_types → activar al menos un tipo de evento. Sin esto el CTA rompe la experiencia. | externo |
| 1.2 | Verificar Lighthouse | Correr `npx lighthouse https://floui.mx --view` — objetivo 95+ en Performance | — |
| 1.3 | Probar OG en producción | Verificar preview real en: opengraph.xyz con `floui.mx` | — |

---

## Fase 2 — Analytics (1 sprint corto)

| # | Tarea | Detalle | Archivo |
|---|-------|---------|---------|
| 2.1 | Agregar script de analytics | Plausible (`<script defer data-domain="floui.mx" src="https://plausible.io/js/script.js">`) o GA4 — un script, antes de `</head>` | `index.html` |
| 2.2 | Evento CTA click | Agregar `onclick` en ambos botones `.btn-cta` que dispare evento `agenda_llamada_click` al provider elegido | `index.html` |

---

## Fase 3 — Bloque de credibilidad (cuando haya datos reales)

PRD §4 Bloque 4 — omitido en v1. Insertar entre `.section-who` y `.section-cta-final` cuando estén disponibles:

| # | Tarea | Detalle |
|---|-------|---------|
| 3.1 | Definir métricas reales | Opciones: negocios atendidos, años de experiencia combinada, resultado de un cliente. **No inventar.** |
| 3.2 | Implementar bloque | Fondo: `--floui-white`. Layout: 2–3 cifras grandes con label pequeño debajo. Sin box-shadow. |

**Copy sugerido cuando haya datos:**
```
[N] negocios         [N] años            "[frase de resultado real]"
creciendo con floui  de experiencia       — Cliente, Tipo de negocio
```

---

## Fase 4 — Sitio completo (fuera de scope v1 — fases futuras)

Del PRD §10 — construir cuando floui esté listo para lanzar:

| # | Sección | Notas |
|---|---------|-------|
| 4.1 | Servicios detallados | Marketing / Software / Growth — una página o sección por pilar |
| 4.2 | Portafolio / casos de éxito | Requiere clientes que den permiso de mencionarse |
| 4.3 | Formulario de captura con backend | Email list — requiere integración (Mailchimp, Resend, etc.) |
| 4.4 | Blog / recursos | Agente `backend` + CMS headless o archivos MD |
| 4.5 | Versión en inglés | `en.floui.mx` o rutas `/en/` |
| 4.6 | Integración meeal | meeal tiene su propio sitio — solo link/referencia cruzada |

---

## Criterios de aceptación pendientes (PRD §9)

```
- [ ] CTA abre canal de agenda real (Calendly activo)         ← Fase 1.1
- [ ] Lighthouse Performance: 95+                             ← Fase 1.2
- [x] Wordmark floui en serif/script, minúsculas, visible
- [x] Fondo Soft Dawn #FFF6F2
- [x] Botón CTA pill shape Deep Blue #3B62AB
- [x] Sparkle verde como acento decorativo
- [x] "flujo" aparece en el copy
- [x] Sin hex hardcodeados en CSS
- [x] Sin box-shadow
- [x] Responsive mobile 375px
- [x] floui nunca en mayúsculas
```

---

## Fase 5 — Floui Up (biblioteca de recursos)

Página en `floui-up.html` — React 18 + Babel Standalone, fondo oscuro charcoal, biblioteca de recursos con filtros, modal lead-gen y newsletter.

| # | Tarea | Detalle | Agente |
|---|-------|---------|--------|
| 5.1 | Backend de leads | Endpoint `POST /api/leads` — body: `{ resourceId, nombre, correo, telefono, newsletter }` — integrar email transaccional (Resend o similar) | `backend` |
| 5.2 | Recursos dinámicos | Endpoint `GET /api/recursos` → `{ resources[], topics[], formats[] }`. Shape debe coincidir 1:1 con el mock en `shared.jsx`. Reemplazar array estático con `useEffect` + `fetch` en `FlouiUp` | `backend` + `frontend` |
| 5.3 | OG image dedicado | Crear `assets/og-floui-up.png` (1200×630) con "Floui Up!" sobre fondo charcoal. Actualizar meta tag en `floui-up.html` | diseño |
| 5.4 | Link público desde home | Agregar en nav de `index.html` cuando el contenido sea real (1 línea) | `frontend` |
| 5.5 | Analytics | Track de `page_view`, `recurso_click`, `lead_submit` con el mismo provider de analytics elegido en Fase 2 | `frontend` |
| 5.6 | Lighthouse audit | Si Performance <90 por Babel Standalone, pre-compilar JSX con `npx babel` y servir como `.js` planos | `qa` |
| 5.7 | Newsletter standalone | Conectar form del `NewsletterBlock` a lista de correo (Mailchimp, Resend, etc.) | `backend` |

**Contratos definidos para Fase 5.1–5.2:**
```
POST /api/leads
body: { resourceId: string, nombre: string, correo: string, telefono: string, newsletter: boolean }
→ 200 { ok: true }

GET /api/recursos
→ 200 { resources: Resource[], topics: Topic[], formats: Format[] }

Resource shape (debe coincidir con mock en shared.jsx):
{ id, title, subtitle, topic, format, access, price, pages, downloads, accent, newish, featured }
```

---

## Cómo retomar este proyecto

```bash
cd /Users/eduardoflores/AI_Projects/Floui/floui-website
# leer HANDOFF.md para el estado actual
# leer PRD completo en ../floui_proximamente_PRD.md
# leer CLAUDE.md en ../CLAUDE.md para brand system
git pull
```

Los agentes del proyecto están en `/Users/eduardoflores/AI_Projects/Floui/.claude/agents/`.  
Usar agente `frontend` para cambios en `index.html`.  
Usar agente `github` para commits y deploy.
