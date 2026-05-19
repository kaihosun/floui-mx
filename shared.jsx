// shared.jsx — tokens, mock data, primitives, LeadModal
// Everything is attached to window at the bottom.

const FLOUI = {
  bg:       '#FFF6F2',
  navy:     '#3B62AB',
  navyDeep: '#2A4A85',
  green:    '#DAE9C6',
  greenDeep:'#B6D098',
  white:    '#FFFFFF',
  ink:      '#262626',
  ink60:    'rgba(38,38,38,0.6)',
  ink45:    'rgba(38,38,38,0.45)',
  ink20:    'rgba(38,38,38,0.2)',
  ink10:    'rgba(38,38,38,0.1)',
  cream:    '#F2EAD9',
  clay:     '#E4B79B',
  lilac:    '#D8D2EC',
  butter:   '#F4E2A8',
  peach:    '#F6CDB7',
  dusk:     '#2A2F47',
};

// ---------- Mock data ----------
const TOPICS = [
  { id: 'all',       label: 'Todos',      count: 24 },
  { id: 'marketing', label: 'Marketing',  count: 7 },
  { id: 'software',  label: 'Software',   count: 5 },
  { id: 'growth',    label: 'Growth',     count: 6 },
  { id: 'ops',       label: 'Operación',  count: 4 },
  { id: 'finanzas',  label: 'Finanzas',   count: 2 },
];

const FORMATS = [
  { id: 'pdf',      label: 'Guía' },
  { id: 'workbook', label: 'Workbook' },
  { id: 'video',    label: 'Video' },
  { id: 'webinar',  label: 'Webinar' },
];

// 12 resources, alternating free / premium, varied topics + formats. Prices in MXN.
const RESOURCES = [
  { id:'r01', title:'Manual del flujo de marketing para tu restaurante', subtitle:'12 pasos para convertir vecinos en clientes recurrentes.', topic:'marketing', format:'pdf',      access:'free',    price:null, pages:42, downloads:1284, accent:'cream',  newish:true,  featured:true  },
  { id:'r02', title:'Playbook de growth para PyMEs', subtitle:'Frameworks reales sin jerga de Silicon Valley.', topic:'growth',    format:'pdf',      access:'premium', price:490,  pages:68, downloads:412,  accent:'clay',   newish:true,  featured:true  },
  { id:'r03', title:'Workbook de costos & margen', subtitle:'Pon números a tu menú. Spreadsheet incluido.', topic:'finanzas',  format:'workbook', access:'free',    price:null, pages:18, downloads:892,  accent:'butter', newish:false, featured:false },
  { id:'r04', title:'Stack de software para operar un restaurante', subtitle:'Las 9 herramientas que sí valen lo que cuestan.', topic:'software',  format:'pdf',      access:'free',    price:null, pages:24, downloads:1576, accent:'lilac',  newish:false, featured:true  },
  { id:'r05', title:'Curso: Email marketing que sí vende', subtitle:'4 sesiones · 1.5h · ejemplos en español.', topic:'marketing', format:'video',    access:'premium', price:1290, pages:null, downloads:308, accent:'green', newish:true, featured:true },
  { id:'r06', title:'Checklist de apertura semanal', subtitle:'Lo que tu manager olvida los lunes.', topic:'ops',       format:'workbook', access:'free',    price:null, pages:6,  downloads:2104, accent:'peach',  newish:false, featured:false },
  { id:'r07', title:'Webinar: cómo cobrar lo que vales', subtitle:'Con Gisell — grabado abril 2026.', topic:'growth',    format:'webinar',  access:'free',    price:null, pages:null, downloads:614, accent:'navy',  newish:true, featured:false },
  { id:'r08', title:'Plantilla de pronóstico de ventas (12 meses)', subtitle:'Google Sheet con tu mix de canales.', topic:'finanzas',  format:'workbook', access:'premium', price:290,  pages:null, downloads:198, accent:'cream', newish:false, featured:false },
  { id:'r09', title:'Manual de onboarding de meseros', subtitle:'Reduce rotación con 7 días bien diseñados.', topic:'ops',       format:'pdf',      access:'premium', price:390,  pages:36, downloads:142,  accent:'clay',   newish:false, featured:false },
  { id:'r10', title:'Curso: Implementa tu primer CRM', subtitle:'Para negocios que ya no caben en WhatsApp.', topic:'software',  format:'video',    access:'premium', price:1490, pages:null, downloads:226, accent:'lilac', newish:true, featured:false },
  { id:'r11', title:'Guía rápida: ads que no queman dinero', subtitle:'10 reglas antes de tocar Meta Ads Manager.', topic:'marketing', format:'pdf',      access:'free',    price:null, pages:14, downloads:1942, accent:'butter', newish:false, featured:false },
  { id:'r12', title:'Workbook: tu primer dashboard de growth', subtitle:'Las 6 métricas que importan, hoja a hoja.', topic:'growth',    format:'workbook', access:'free',    price:null, pages:22, downloads:738,  accent:'green',  newish:false, featured:false },
];

const formatPrice = (p) => p == null ? null : `$${p.toLocaleString('es-MX')}`;

const ACCENT_COLORS = {
  cream:  { bg: FLOUI.cream,  ink: FLOUI.ink },
  clay:   { bg: FLOUI.clay,   ink: FLOUI.ink },
  butter: { bg: FLOUI.butter, ink: FLOUI.ink },
  lilac:  { bg: FLOUI.lilac,  ink: FLOUI.ink },
  green:  { bg: FLOUI.green,  ink: FLOUI.ink },
  peach:  { bg: FLOUI.peach,  ink: FLOUI.ink },
  navy:   { bg: FLOUI.navy,   ink: FLOUI.white },
};

const FORMAT_LABEL = { pdf:'Guía PDF', workbook:'Workbook', video:'Curso video', webinar:'Webinar' };

// ---------- Primitive: ResourceCover ----------
// Stylized "thumbnail" — no real image needed. Looks like a book/PDF cover.
function ResourceCover({ resource, variant = 'card', hideBadge = false, style }) {
  const accent = ACCENT_COLORS[resource.accent] || ACCENT_COLORS.cream;
  const isVideo = resource.format === 'video' || resource.format === 'webinar';
  return (
    <div style={{
      position:'relative',
      width:'100%', height:'100%',
      background: accent.bg,
      color: accent.ink,
      overflow:'hidden',
      borderRadius: 'inherit',
      ...style,
    }}>
      {/* Decorative shapes — slightly different per accent */}
      <div style={{
        position:'absolute', inset:0,
        background: `radial-gradient(120% 80% at 110% -10%, ${hex(accent.ink, 0.12)}, transparent 50%),
                     radial-gradient(80% 60% at -10% 110%, ${hex(accent.ink, 0.08)}, transparent 50%)`,
      }} />
      {/* Format badge */}
      <div style={{
        position:'absolute', top:12, left:12,
        fontFamily:'JetBrains Mono, ui-monospace, monospace',
        fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase',
        padding:'4px 7px', borderRadius:4,
        background: hex(accent.ink, 0.1), color: accent.ink,
      }}>
        {FORMAT_LABEL[resource.format]}
      </div>
      {/* Access badge top-right */}
      {!hideBadge && (
        <div style={{
          position:'absolute', top:12, right:12,
          fontFamily:'JetBrains Mono, ui-monospace, monospace',
          fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase',
          padding:'4px 7px', borderRadius:4,
          background: resource.access==='premium' ? FLOUI.navy : 'transparent',
          color: resource.access==='premium' ? FLOUI.white : accent.ink,
          border: resource.access==='premium' ? 'none' : `1px solid ${hex(accent.ink, 0.25)}`,
        }}>
          {resource.access==='premium' ? '◆ Premium' : 'Gratis'}
        </div>
      )}
      {/* Big title — serif */}
      <div style={{
        position:'absolute', left:14, right:14, bottom:14,
        fontFamily:'Instrument Serif, Georgia, serif',
        fontSize: variant==='hero' ? 30 : 20,
        lineHeight: 1.05,
        letterSpacing:'-0.01em',
        textWrap:'pretty',
      }}>
        {resource.title.split(' ').slice(0, variant==='hero'?9:6).join(' ')}
        {resource.title.split(' ').length > (variant==='hero'?9:6) ? '…' : ''}
      </div>
      {/* Play icon for video/webinar */}
      {isVideo && (
        <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:46, height:46, borderRadius:'50%',
          background: hex(accent.ink, 0.85), color: accent.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            width:0, height:0,
            borderLeft:`13px solid ${accent.bg}`,
            borderTop:'9px solid transparent',
            borderBottom:'9px solid transparent',
            marginLeft:3,
          }} />
        </div>
      )}
      {/* Sparkle ornament — corner */}
      <svg width="14" height="14" viewBox="0 0 32 32" style={{ position:'absolute', bottom:10, right:10, opacity:0.55 }}>
        <path d="M16 2L17.6 13.4L29 16L17.6 18.6L16 30L14.4 18.6L3 16L14.4 13.4L16 2Z" fill={accent.ink} />
      </svg>
    </div>
  );
}

function hex(color, alpha) {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1,3),16);
    const g = parseInt(color.slice(3,5),16);
    const b = parseInt(color.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

// ---------- LeadModal — shared across all variants ----------
function LeadModal({ resource, onClose }) {
  const [step, setStep] = React.useState(1); // 1 = form, 2 = success
  const [form, setForm] = React.useState({ nombre:'', correo:'', telefono:'', newsletter:true });
  if (!resource) return null;

  const submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(38,38,38,0.55)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20,
        backdropFilter:'blur(4px)',
        animation:'fadeIn .15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:translateY(8px) scale(.98) } to { opacity:1; transform:none } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: FLOUI.white,
          borderRadius: 16,
          maxWidth: 880, width:'100%',
          maxHeight:'90vh', overflow:'auto',
          display:'grid', gridTemplateColumns:'1fr 1fr',
          animation:'popIn .2s ease',
          boxShadow:'0 30px 80px rgba(38,38,38,0.25)',
          position:'relative',
        }}
      >
        {/* Left: visual preview */}
        <div style={{
          background: FLOUI.bg, padding: 32,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          minHeight: 480,
        }}>
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:FLOUI.navy, fontWeight:600 }}>
            Biblioteca floui
          </div>
          <div style={{ aspectRatio:'3/4', maxHeight:260, marginInline:'auto', width:'100%', maxWidth:200, borderRadius:8, overflow:'hidden', boxShadow:'0 14px 30px rgba(38,38,38,0.18)' }}>
            <ResourceCover resource={resource} />
          </div>
          <div>
            <div style={{ fontFamily:'Instrument Serif, serif', fontSize:24, lineHeight:1.1, letterSpacing:'-0.01em', marginBottom:6 }}>
              {resource.title}
            </div>
            <div style={{ fontSize:13, color:FLOUI.ink60, lineHeight:1.5 }}>{resource.subtitle}</div>
          </div>
        </div>

        {/* Right: form / success */}
        <div style={{ padding: 36, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          {step === 1 ? (
            <form onSubmit={submit}>
              <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:FLOUI.ink45, marginBottom:14 }}>
                {resource.access==='premium' ? 'Recurso premium · solicita acceso' : 'Recibe el recurso gratis'}
              </div>
              <div style={{ fontFamily:'Instrument Serif, serif', fontSize:30, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:10 }}>
                Te lo enviamos al correo.
              </div>
              <div style={{ fontSize:14, color:FLOUI.ink60, lineHeight:1.55, marginBottom:24 }}>
                Solo necesitamos saber a dónde y cómo encontrarte. Nada de spam — palabra.
              </div>

              <Field label="Nombre" value={form.nombre} onChange={(v)=>setForm({...form, nombre:v})} placeholder="¿Cómo te llamas?" />
              <Field label="Correo" type="email" value={form.correo} onChange={(v)=>setForm({...form, correo:v})} placeholder="tu@correo.com" />
              <Field label="Teléfono" type="tel" value={form.telefono} onChange={(v)=>setForm({...form, telefono:v})} placeholder="+52 ..." />

              <label style={{ display:'flex', gap:10, alignItems:'flex-start', marginTop:8, marginBottom:24, cursor:'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.newsletter}
                  onChange={(e)=>setForm({...form, newsletter:e.target.checked})}
                  style={{ marginTop:3, accentColor: FLOUI.navy }}
                />
                <span style={{ fontSize:13, color:FLOUI.ink60, lineHeight:1.5 }}>
                  Suscríbeme al newsletter de floui — un correo cada dos semanas con recursos nuevos y casos reales.
                </span>
              </label>

              <button type="submit" style={{
                width:'100%', padding:'14px 18px',
                background: FLOUI.navy, color: FLOUI.white,
                border:0, borderRadius:8,
                fontSize:14, fontWeight:500, letterSpacing:'0.01em',
                cursor:'pointer',
              }}>
                {resource.access==='premium' ? 'Solicitar acceso →' : 'Enviarme el recurso →'}
              </button>
              <div style={{ fontSize:11, color:FLOUI.ink45, marginTop:14, lineHeight:1.5 }}>
                Al continuar aceptas nuestro aviso de privacidad.
              </div>
            </form>
          ) : (
            <div>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background: FLOUI.green, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5L10 17L19 7" stroke={FLOUI.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontFamily:'Instrument Serif, serif', fontSize:30, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:10 }}>
                ¡Listo, {form.nombre || 'gracias'}!
              </div>
              <div style={{ fontSize:14, color:FLOUI.ink60, lineHeight:1.6, marginBottom:24 }}>
                Te enviamos el recurso a <strong style={{color:FLOUI.ink}}>{form.correo || 'tu correo'}</strong>. Revisa la bandeja de entrada (y promociones, por si acaso).
                {form.newsletter && ' Ya estás suscrito al newsletter.'}
              </div>
              <button onClick={onClose} style={{
                padding:'12px 22px', background:'transparent',
                border:`1.5px solid ${FLOUI.ink}`, color: FLOUI.ink,
                borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:500,
              }}>
                Volver a la biblioteca
              </button>
            </div>
          )}
        </div>

        <button onClick={onClose} aria-label="Cerrar" style={{
          position:'absolute', top:14, right:14,
          width:32, height:32, borderRadius:'50%',
          background:FLOUI.white, border:`1px solid ${FLOUI.ink10}`,
          cursor:'pointer', fontSize:16, color:FLOUI.ink,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>×</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type='text', placeholder }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:FLOUI.ink60, marginBottom:6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width:'100%', padding:'11px 14px',
          border:`1.5px solid ${FLOUI.ink10}`,
          borderRadius:8, fontSize:14,
          fontFamily:'inherit', background:FLOUI.white, color:FLOUI.ink,
          outline:'none', transition:'border-color .15s',
        }}
        onFocus={(e)=>e.target.style.borderColor=FLOUI.navy}
        onBlur={(e)=>e.target.style.borderColor=FLOUI.ink10}
      />
    </div>
  );
}

// ---------- LeadModal context — single global modal ----------
const LeadCtx = React.createContext(null);
function LeadProvider({ children }) {
  const [active, setActive] = React.useState(null);
  return (
    <LeadCtx.Provider value={setActive}>
      {children}
      <LeadModal resource={active} onClose={() => setActive(null)} />
    </LeadCtx.Provider>
  );
}
function useOpenLead() { return React.useContext(LeadCtx); }

// ---------- expose ----------
Object.assign(window, {
  FLOUI, TOPICS, FORMATS, RESOURCES, ACCENT_COLORS, FORMAT_LABEL,
  ResourceCover, LeadModal, LeadProvider, useOpenLead, hex, formatPrice,
});
