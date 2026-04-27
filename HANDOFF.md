# HANDOFF — floui.mx · Próximamente

**Fecha:** Abril 27, 2026  
**Estado:** Live en producción  
**URL:** https://floui.mx  
**Repo:** https://github.com/kaihosun/floui-mx  

---

## Lo que está hecho

### Infraestructura
- Repo GitHub: `kaihosun/floui-mx` — branch `main` conectado a Vercel
- Deploy automático: cada `git push` a `main` publica en floui.mx via Vercel + Cloudflare
- SSL: configurado (Vercel maneja certificados, Cloudflare en DNS-only)

### Página (`index.html`)
- HTML + CSS vanilla, sin frameworks, sin bundler
- Paleta Floui v2.0 completa via variables CSS (ningún hex hardcodeado)
- 4 bloques: Hero → Qué es floui → Para quién (Dawn Green) → CTA final + footer
- Watermark "PRÓXIMAMENTE" via CSS `::before` — opacidad 4.5%
- Badge animado con pulso verde
- Sparkle SVG inline como acento decorativo
- Pills de pilares: "Marketing que convierte · Software que opera · Growth que se siente"
- CTA → `https://calendly.com/floui` (abre en nueva pestaña)
- **Nota:** Calendly requiere activar al menos un Event Type en calendly.com/event_types

### Assets
| Archivo | Uso | Estado |
|---------|-----|--------|
| `assets/logo-wordmark.png` | Nav, hero, footer (1111×623, fondo blanco) | ✅ |
| `assets/logo.png` | Base para favicon y OG (2000×2000, fondo Soft Dawn) | ✅ |
| `assets/favicon-32.png` | Pestaña del browser | ✅ |
| `assets/apple-touch-icon.png` | iOS home screen (180px) | ✅ |
| `assets/og-floui.png` | Preview WhatsApp/redes (1200×630) | ✅ |
| `assets/sparkle.svg` | Referencia SVG (también inline en HTML) | ✅ |

---

## Pendiente (según PRD §9 y §10)

### Bloqueante
- [ ] **Activar Event Type en Calendly** — sin esto el CTA da error al visitante
- [ ] **Bloque 4 de social proof** — omitido en v1 por falta de datos. Cuando haya números reales (negocios atendidos, años de experiencia, resultados) agregar entre "Para quién" y CTA final

### Próximas iteraciones
- [ ] Analytics — agregar GA4 o Plausible (1 script, evento `agenda_llamada_click`)
- [ ] Verificar Lighthouse score 95+ (sin haber corrido aún)
- [ ] Página completa del sitio (fuera de scope v1 — ver PRD §10)

---

## Cómo hacer deploy

```bash
cd /Users/eduardoflores/AI_Projects/Floui/floui-website
# editar index.html
git add index.html
git commit -m "tipo: descripción"
git push   # Vercel despliega automáticamente
```

## Estructura de archivos

```
floui-website/
├── index.html              ← todo el sitio
├── HANDOFF.md              ← este archivo
├── PLAN.md                 ← backlog priorizado
├── README.md               ← instrucciones de deploy
└── assets/
    ├── logo-wordmark.png   ← logo en página (nav/hero/footer)
    ├── logo.png            ← base para favicon y OG
    ├── favicon-32.png
    ├── apple-touch-icon.png
    ├── og-floui.png
    └── sparkle.svg
```

---

## Contexto de marca

Sistema de color, tipografía y voz: ver `CLAUDE.md` en `/Users/eduardoflores/AI_Projects/Floui/CLAUDE.md`  
PRD completo: `floui_proximamente_PRD.md` en la raíz del proyecto.  
Fuente de verdad de color: `floui_color_system_v2.html` — paleta v2.0 con `#3B62AB` como primario.  
⚠️ Ignorar `floui_brand_deconstruction.html` para colores — usa la v1.0 obsoleta (`#1B3A9E`).
