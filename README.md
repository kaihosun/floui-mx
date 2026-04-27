# floui.mx — Página Próximamente

Sitio estático. HTML + CSS vanilla. Sin frameworks, sin bundler.

## Deploy

**Vercel (recomendado con Cloudflare):**
```bash
# Desde la carpeta floui-website/
npx vercel --prod
```
O conectar el repo en vercel.com → Import Git Repository → root directory: `floui-website/`

**Netlify:**
Drag & drop la carpeta `floui-website/` en netlify.com/drop

## Configurar dominio floui.mx en Cloudflare

1. En Vercel: Settings → Domains → Add `floui.mx`
2. Vercel genera los DNS records (CNAME o A records)
3. En Cloudflare: DNS → Add the records Vercel provides → Proxy status: **DNS only** (nube gris, no naranja)

## Actualizar CTA

Reemplazar el `href` del botón cuando esté activo el canal de agenda:

```html
<!-- Calendly -->
href="https://calendly.com/floui"

<!-- WhatsApp Business -->
href="https://wa.me/52XXXXXXXXXX?text=Hola%20floui%2C%20quiero%20agendar%20una%20llamada"

<!-- Mailto (actual) -->
href="mailto:hola@floui.mx?subject=Quiero%20agendar%20una%20llamada%20con%20floui"
```

Hay dos botones en el HTML — buscar `btn-cta` para actualizarlos.

## Assets pendientes

- `/assets/og-floui.png` — imagen OG para redes (1200×630px). Sin ella, las previews en redes no tendrán imagen.

## Criterios de aceptación (PRD §9)

- [x] Wordmark `floui` en serif italic
- [x] Fondo Soft Dawn `#FFF6F2`
- [x] Botón pill Deep Blue `#3B62AB`
- [x] Sparkle verde como acento decorativo
- [x] "flujo" aparece en el copy
- [x] Sin hex hardcodeados en CSS
- [x] Sin `box-shadow`
- [x] Responsive mobile (375px)
- [ ] CTA apunta a canal de agenda real (pendiente confirmación)
- [ ] OG image creada
- [ ] Lighthouse 95+
