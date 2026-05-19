// up.jsx — Final design. Dark mode, "Floui Up!" hero, V2 cards w/ pricing.
// Inspired by Switch-Lit Library hero composition.

function FlouiUp() {
  const openLead = useOpenLead();
  const [topic, setTopic]   = React.useState('all');
  const [access, setAccess] = React.useState('all');
  const [format, setFormat] = React.useState('all');
  const [q, setQ]           = React.useState('');
  const [sort, setSort]     = React.useState('new');
  const [view, setView]     = React.useState('grid'); // grid | list

  const filtered = RESOURCES
    .filter(r => topic==='all'  || r.topic===topic)
    .filter(r => access==='all' || r.access===access)
    .filter(r => format==='all' || r.format===format)
    .filter(r => !q || (r.title + r.subtitle).toLowerCase().includes(q.toLowerCase()));

  const sorted = [...filtered].sort((a,b)=>{
    if (sort==='popular')   return b.downloads - a.downloads;
    if (sort==='alpha')     return a.title.localeCompare(b.title);
    if (sort==='price-asc') return (a.price||0) - (b.price||0);
    return (b.newish?1:0) - (a.newish?1:0);
  });

  const featured = RESOURCES.filter(r => r.featured);

  return (
    <div style={{ background: FLOUI.ink, color: FLOUI.bg, minHeight:'100vh', fontFamily:'Inter Tight, system-ui, sans-serif' }}>
      <NavBar />
      <Hero q={q} setQ={setQ} />
      <FeaturedRow resources={featured} onPick={openLead} />
      <FilterBar
        topic={topic} setTopic={setTopic}
        access={access} setAccess={setAccess}
        format={format} setFormat={setFormat}
        sort={sort} setSort={setSort}
        q={q} setQ={setQ}
        view={view} setView={setView}
        count={sorted.length}
      />
      {view==='grid'
        ? <GridSection resources={sorted} onPick={openLead} />
        : <ListSection resources={sorted} onPick={openLead} />
      }
      <NewsletterBlock />
      <Footer />
    </div>
  );
}

// ─── Nav ────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav style={{
      padding:'22px 56px',
      display:'flex', justifyContent:'space-between', alignItems:'center',
      borderBottom:'1px solid rgba(255,246,242,0.08)',
      position:'sticky', top:0, zIndex:50,
      background:'rgba(38,38,38,0.85)', backdropFilter:'blur(12px)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:36 }}>
        <img src="assets/logo-wordmark.png" alt="floui"
          style={{ height:24, filter:'invert(1) brightness(1.4)' }} />
        <div style={{ display:'flex', gap:24, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', opacity:0.55 }}>
          <span>Servicios</span>
          <span>Casos</span>
          <span style={{ opacity:1, color:FLOUI.green, fontWeight:500 }}>Floui Up!</span>
          <span>Blog</span>
          <span>Contacto</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <button style={{
          padding:'8px 14px', background:'transparent', color:FLOUI.bg,
          border:'1px solid rgba(255,246,242,0.18)', borderRadius:100,
          fontSize:12, letterSpacing:'0.06em', cursor:'pointer', fontFamily:'inherit',
        }}>Iniciar sesión</button>
        <button style={{
          padding:'8px 16px', background:FLOUI.green, color:FLOUI.ink,
          border:0, borderRadius:100, fontSize:12, fontWeight:600,
          letterSpacing:'0.04em', cursor:'pointer', fontFamily:'inherit',
        }}>Suscribirme →</button>
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────
function Hero({ q, setQ }) {
  return (
    <section style={{
      padding:'72px 56px 56px',
      textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div style={{
        fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase',
        color:FLOUI.green, fontWeight:600, marginBottom:18,
        display:'inline-flex', alignItems:'center', gap:10,
      }}>
        <Sparkle color={FLOUI.green} size={12} /> Biblioteca de recursos floui
      </div>

      <h1 style={{
        fontFamily:'Instrument Serif, Georgia, serif',
        fontSize:'clamp(72px, 11vw, 156px)',
        lineHeight:0.88, letterSpacing:'-0.04em', fontWeight:400,
        margin:'0 auto', maxWidth: 1100,
      }}>
        Floui<em style={{ fontStyle:'italic', color:FLOUI.green }}>Up!</em>
      </h1>

      <p style={{
        fontSize:'clamp(17px, 1.5vw, 21px)',
        maxWidth: 580, margin:'30px auto 0',
        lineHeight:1.5, opacity:0.78,
      }}>
        Herramientas digitales para hacer que tu negocio fluya mejor.
        <br/>Guías, workbooks y cursos — gratis y premium.
      </p>

      {/* Decorative stack of resource covers — fanned out */}
      <ResourceFan />

      {/* Big search */}
      <div style={{
        maxWidth: 580, margin:'40px auto 0', position:'relative', zIndex:2,
        background:'rgba(255,246,242,0.08)', borderRadius:14,
        border:'1px solid rgba(255,246,242,0.14)',
        display:'flex', alignItems:'center', padding:'4px 6px 4px 18px',
        backdropFilter:'blur(8px)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={FLOUI.bg} strokeWidth="2" opacity="0.55" />
          <path d="M20 20L16.5 16.5" stroke={FLOUI.bg} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        </svg>
        <input
          placeholder="Buscar guías, workbooks, cursos..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            flex:1, border:0, padding:'14px 12px', fontSize:15,
            background:'transparent', fontFamily:'inherit', color:FLOUI.bg, outline:'none',
          }}
        />
        <kbd style={{
          fontFamily:'JetBrains Mono, monospace', fontSize:11,
          padding:'4px 8px', background:'rgba(255,246,242,0.08)', borderRadius:5,
          border:'1px solid rgba(255,246,242,0.14)', color:FLOUI.bg, opacity:0.7,
        }}>⌘ K</kbd>
      </div>

      <div style={{
        display:'flex', gap:24, justifyContent:'center', marginTop:24,
        fontSize:12, opacity:0.55, position:'relative', zIndex:2,
      }}>
        <span><strong style={{ color:FLOUI.bg, opacity:1 }}>24</strong> recursos</span>
        <span>·</span>
        <span><strong style={{ color:FLOUI.bg, opacity:1 }}>12,847</strong> descargas</span>
        <span>·</span>
        <span><strong style={{ color:FLOUI.bg, opacity:1 }}>4,210</strong> suscritos al newsletter</span>
      </div>
    </section>
  );
}

function Sparkle({ color, size=16, opacity=1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink:0, opacity }}>
      <path d="M16 2L17.6 13.4L29 16L17.6 18.6L16 30L14.4 18.6L3 16L14.4 13.4L16 2Z" fill={color} />
    </svg>
  );
}

// Fanned arrangement of mini covers behind the search bar
function ResourceFan() {
  const items = [
    { i:0, r:RESOURCES[3]  }, // lilac
    { i:1, r:RESOURCES[5]  }, // peach
    { i:2, r:RESOURCES[0]  }, // cream
    { i:3, r:RESOURCES[11] }, // green
    { i:4, r:RESOURCES[2]  }, // butter
    { i:5, r:RESOURCES[1]  }, // clay
    { i:6, r:RESOURCES[6]  }, // navy
  ];
  const N = items.length;
  return (
    <div style={{
      position:'relative', width:'100%', height: 240,
      marginTop: 44, marginBottom: -100,
      display:'flex', justifyContent:'center', alignItems:'flex-end',
      pointerEvents:'none',
    }}>
      {items.map(({i, r}) => {
        const spread = 18; // degrees per item
        const angle  = (i - (N-1)/2) * spread;
        const lift   = Math.abs(i - (N-1)/2) * 14;
        const isCenter = i === Math.floor(N/2);
        return (
          <div key={i} style={{
            position:'absolute', bottom: 30 + (isCenter ? 14 : 0) - lift*0.6,
            width: isCenter ? 156 : 140,
            height: isCenter ? 208 : 186,
            transform: `translateX(${(i - (N-1)/2) * 80}px) rotate(${angle}deg)`,
            transformOrigin: 'center bottom',
            borderRadius: 8,
            overflow:'hidden',
            boxShadow: `0 ${10 + lift}px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)`,
            zIndex: 10 - Math.abs(i - (N-1)/2),
          }}>
            <ResourceCover resource={r} />
          </div>
        );
      })}
      {/* arch glow behind center */}
      <div style={{
        position:'absolute', bottom: 24, left:'50%', transform:'translateX(-50%)',
        width: 320, height: 180,
        background:'radial-gradient(60% 80% at 50% 100%, rgba(218,233,198,0.25), transparent 70%)',
        filter:'blur(20px)', zIndex:0,
      }} />
    </div>
  );
}

// ─── Featured row ────────────────────────────────────────────────────
function FeaturedRow({ resources, onPick }) {
  return (
    <section style={{ padding:'120px 56px 0', position:'relative', zIndex:5 }}>
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'baseline',
        marginBottom:22,
      }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:FLOUI.green, fontWeight:600, marginBottom:8 }}>
            ★ Destacados de la semana
          </div>
          <h2 style={{ fontFamily:'Instrument Serif, serif', fontSize:34, lineHeight:1.05, letterSpacing:'-0.02em', margin:0, fontWeight:400 }}>
            Los más descargados ahora.
          </h2>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <CircleBtn>←</CircleBtn>
          <CircleBtn>→</CircleBtn>
        </div>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18,
      }}>
        {resources.slice(0,4).map(r => (
          <ResourceCard key={r.id} resource={r} onClick={()=>onPick(r)} variant="featured" />
        ))}
      </div>
    </section>
  );
}

function CircleBtn({ children }) {
  return (
    <button style={{
      width:38, height:38, borderRadius:'50%',
      background:'transparent', color:FLOUI.bg,
      border:'1px solid rgba(255,246,242,0.18)',
      cursor:'pointer', fontSize:14, fontFamily:'inherit',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>{children}</button>
  );
}

// ─── Filter bar ──────────────────────────────────────────────────────
function FilterBar({ topic, setTopic, access, setAccess, format, setFormat, sort, setSort, q, setQ, view, setView, count }) {
  return (
    <div style={{
      padding:'64px 56px 18px',
      position:'sticky', top:69, zIndex:40,
      background:'rgba(38,38,38,0.92)', backdropFilter:'blur(12px)',
      marginBottom:0,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18 }}>
        <h2 style={{ fontFamily:'Instrument Serif, serif', fontSize:34, lineHeight:1, letterSpacing:'-0.02em', margin:0, fontWeight:400 }}>
          Toda la biblioteca
        </h2>
        <div style={{ fontSize:12, opacity:0.55, fontFamily:'JetBrains Mono, monospace' }}>
          {String(count).padStart(2,'0')} resultados
        </div>
      </div>

      <div style={{
        display:'flex', gap:16, alignItems:'center', flexWrap:'wrap',
        paddingBottom:18, borderBottom:'1px solid rgba(255,246,242,0.08)',
      }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:'1 1 auto' }}>
          {TOPICS.map(t => (
            <ChipDark key={t.id} active={topic===t.id} onClick={()=>setTopic(t.id)}>
              {t.label} <span style={{ opacity:0.5, marginLeft:5, fontSize:11 }}>{t.count}</span>
            </ChipDark>
          ))}
        </div>
        <SegmentedDark
          value={access} onChange={setAccess}
          options={[
            { id:'all',     l:'Todos' },
            { id:'free',    l:'Gratis' },
            { id:'premium', l:'◆ Premium' },
          ]}
        />
        <SelectDark value={format} onChange={setFormat} options={[
          { id:'all', l:'Todos los formatos' },
          ...FORMATS.map(f=>({id:f.id, l:f.label})),
        ]} />
        <SelectDark value={sort} onChange={setSort} options={[
          { id:'new',       l:'Más nuevos' },
          { id:'popular',   l:'Más descargados' },
          { id:'price-asc', l:'Precio: bajo→alto' },
          { id:'alpha',     l:'A–Z' },
        ]} />
        <ViewToggle value={view} onChange={setView} />
      </div>
    </div>
  );
}

function ChipDark({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'7px 14px',
      border:`1px solid ${active ? FLOUI.green : 'rgba(255,246,242,0.16)'}`,
      background: active ? FLOUI.green : 'transparent',
      color: active ? FLOUI.ink : FLOUI.bg,
      borderRadius:100, fontSize:12.5, fontWeight: active?600:400,
      cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
    }}>{children}</button>
  );
}

function SegmentedDark({ value, onChange, options }) {
  return (
    <div style={{
      display:'inline-flex',
      background:'rgba(255,246,242,0.06)',
      border:'1px solid rgba(255,246,242,0.12)',
      borderRadius:100, padding:3,
    }}>
      {options.map(o => (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          padding:'6px 14px', fontSize:12, fontWeight:500,
          background: value===o.id ? FLOUI.bg : 'transparent',
          color: value===o.id ? FLOUI.ink : FLOUI.bg,
          border:0, borderRadius:100, cursor:'pointer', fontFamily:'inherit',
        }}>{o.l}</button>
      ))}
    </div>
  );
}

function SelectDark({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{
      padding:'8px 14px', fontSize:12.5,
      background:'rgba(255,246,242,0.06)',
      border:'1px solid rgba(255,246,242,0.12)',
      color:FLOUI.bg, borderRadius:100, fontFamily:'inherit', cursor:'pointer',
    }}>
      {options.map(o => <option key={o.id} value={o.id} style={{ background:FLOUI.ink }}>{o.l}</option>)}
    </select>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div style={{
      display:'inline-flex',
      background:'rgba(255,246,242,0.06)',
      border:'1px solid rgba(255,246,242,0.12)',
      borderRadius:8, padding:3,
    }}>
      {[
        { id:'grid', icon: <GridIcon /> },
        { id:'list', icon: <ListIcon /> },
      ].map(o => (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          padding:'6px 10px', background: value===o.id ? FLOUI.bg : 'transparent',
          color: value===o.id ? FLOUI.ink : FLOUI.bg,
          border:0, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center',
        }}>{o.icon}</button>
      ))}
    </div>
  );
}
function GridIcon() { return (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1.2" />
    <rect x="9" y="1" width="6" height="6" rx="1.2" />
    <rect x="1" y="9" width="6" height="6" rx="1.2" />
    <rect x="9" y="9" width="6" height="6" rx="1.2" />
  </svg>
); }
function ListIcon() { return (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="2" width="14" height="2.4" rx="1" />
    <rect x="1" y="7" width="14" height="2.4" rx="1" />
    <rect x="1" y="12" width="14" height="2.4" rx="1" />
  </svg>
); }

// ─── Grid & List ─────────────────────────────────────────────────────
function GridSection({ resources, onPick }) {
  return (
    <section style={{ padding:'24px 56px 48px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18 }}>
        {resources.map(r => (
          <ResourceCard key={r.id} resource={r} onClick={()=>onPick(r)} />
        ))}
      </div>
    </section>
  );
}

function ListSection({ resources, onPick }) {
  return (
    <section style={{ padding:'24px 56px 48px' }}>
      <div style={{
        background:'rgba(255,246,242,0.04)',
        border:'1px solid rgba(255,246,242,0.08)',
        borderRadius:14, overflow:'hidden',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'60px 1.6fr 1fr 0.6fr 0.8fr 0.7fr 100px',
          gap:18, padding:'12px 18px',
          fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase',
          color:'rgba(255,246,242,0.45)', fontWeight:600,
          borderBottom:'1px solid rgba(255,246,242,0.08)',
        }}>
          <div></div><div>Recurso</div><div>Tema</div><div>Formato</div><div>Descargas</div><div>Precio</div><div></div>
        </div>
        {resources.map((r, i) => (
          <div key={r.id} onClick={()=>onPick(r)} style={{
            display:'grid', gridTemplateColumns:'60px 1.6fr 1fr 0.6fr 0.8fr 0.7fr 100px',
            gap:18, padding:'14px 18px', alignItems:'center',
            borderBottom: i===resources.length-1 ? 'none' : '1px solid rgba(255,246,242,0.06)',
            cursor:'pointer', transition:'background .15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,246,242,0.05)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <div style={{ width:48, height:64, borderRadius:5, overflow:'hidden' }}>
              <ResourceCover resource={r} hideBadge />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{r.title}</div>
              <div style={{ fontSize:11, opacity:0.5 }}>{r.subtitle}</div>
            </div>
            <div style={{ fontSize:12, opacity:0.7 }}>{TOPICS.find(t=>t.id===r.topic).label}</div>
            <div style={{ fontSize:11, opacity:0.6, fontFamily:'JetBrains Mono, monospace' }}>{FORMAT_LABEL[r.format]}</div>
            <div style={{ fontSize:12, opacity:0.6, fontFamily:'JetBrains Mono, monospace' }}>↓ {r.downloads.toLocaleString()}</div>
            <div style={{ fontSize:13, fontWeight:600, color: r.access==='premium' ? FLOUI.green : FLOUI.bg }}>
              {r.access==='premium' ? formatPrice(r.price) : 'Gratis'}
            </div>
            <button style={{
              padding:'7px 12px', background: r.access==='premium' ? FLOUI.green : 'transparent',
              color: r.access==='premium' ? FLOUI.ink : FLOUI.bg,
              border: r.access==='premium' ? 'none' : '1px solid rgba(255,246,242,0.25)',
              borderRadius:100, fontSize:11, fontWeight:600, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
            }}>
              {r.access==='premium' ? 'Comprar' : 'Descargar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Resource card — V2 style with price ─────────────────────────────
function ResourceCard({ resource, onClick, variant }) {
  const isFeatured = variant === 'featured';
  return (
    <div onClick={onClick} style={{
      background:'rgba(255,246,242,0.04)',
      border:'1px solid rgba(255,246,242,0.1)',
      borderRadius:12, overflow:'hidden', cursor:'pointer',
      transition:'transform .2s, border-color .2s, background .2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(255,246,242,0.22)';
        e.currentTarget.style.background = 'rgba(255,246,242,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,246,242,0.1)';
        e.currentTarget.style.background = 'rgba(255,246,242,0.04)';
      }}
    >
      <div style={{ position:'relative', height:200 }}>
        <ResourceCover resource={resource} hideBadge />
        {/* Price/Free pill — top right of cover, overlapping */}
        <div style={{
          position:'absolute', top:12, right:12, zIndex:2,
          padding:'6px 12px', borderRadius:100,
          background: resource.access==='premium' ? FLOUI.ink : FLOUI.green,
          color: resource.access==='premium' ? FLOUI.green : FLOUI.ink,
          fontSize:13, fontWeight:700,
          fontFamily: resource.access==='premium' ? 'JetBrains Mono, monospace' : 'Inter Tight, sans-serif',
          letterSpacing: resource.access==='premium' ? '0.02em' : '0.04em',
          boxShadow:'0 4px 14px rgba(0,0,0,0.3)',
          border: resource.access==='premium' ? `1px solid ${FLOUI.green}` : 'none',
        }}>
          {resource.access==='premium' ? formatPrice(resource.price) : 'GRATIS'}
        </div>
      </div>
      <div style={{ padding:'16px 16px 18px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
          <span style={{
            fontSize:9.5, padding:'3px 7px', borderRadius:4,
            background:'rgba(255,246,242,0.08)', color:FLOUI.bg, opacity:0.85,
            fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase',
          }}>{TOPICS.find(t=>t.id===resource.topic).label}</span>
          <span style={{
            fontSize:9.5, padding:'3px 7px', borderRadius:4,
            background:'rgba(255,246,242,0.08)', color:FLOUI.bg, opacity:0.7,
            fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase',
          }}>{FORMAT_LABEL[resource.format]}</span>
          {resource.newish && (
            <span style={{
              fontSize:9.5, padding:'3px 7px', borderRadius:4,
              background:FLOUI.green, color:FLOUI.ink, fontWeight:700,
              letterSpacing:'0.06em',
            }}>NUEVO</span>
          )}
        </div>
        <div style={{
          fontSize: isFeatured ? 16 : 15, fontWeight:600,
          lineHeight:1.3, marginBottom:6, color:FLOUI.bg,
        }}>{resource.title}</div>
        <div style={{ fontSize:12, opacity:0.55, lineHeight:1.5, marginBottom:14 }}>
          {resource.subtitle}
        </div>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          paddingTop:12, borderTop:'1px solid rgba(255,246,242,0.08)',
        }}>
          <span style={{ fontSize:11, opacity:0.5, fontFamily:'JetBrains Mono, monospace' }}>
            ↓ {resource.downloads.toLocaleString()}
          </span>
          <span style={{
            fontSize:12, fontWeight:600,
            color: resource.access==='premium' ? FLOUI.green : FLOUI.bg,
          }}>
            {resource.access==='premium' ? 'Comprar →' : 'Descargar →'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────
function NewsletterBlock() {
  return (
    <section style={{ padding:'80px 56px 48px' }}>
      <div style={{
        background: FLOUI.green, color: FLOUI.ink, borderRadius:20,
        padding:'56px 48px', overflow:'hidden', position:'relative',
        display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:48, alignItems:'center',
      }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:FLOUI.navy, fontWeight:700, marginBottom:14 }}>
            ✦ Newsletter quincenal
          </div>
          <h3 style={{
            fontFamily:'Instrument Serif, serif', fontSize:'clamp(36px, 4vw, 52px)',
            lineHeight:1, letterSpacing:'-0.025em', margin:'0 0 14px', fontWeight:400,
          }}>
            Un correo cada dos semanas.<br/>
            <em style={{ fontStyle:'italic', color:FLOUI.navy }}>Cero relleno.</em>
          </h3>
          <p style={{ fontSize:15, lineHeight:1.55, margin:0, opacity:0.75, maxWidth:480 }}>
            Recursos nuevos antes que nadie, plus 1 caso real de un negocio que floui está acompañando.
            Te puedes desuscribir con un click.
          </p>
        </div>
        <form onSubmit={e=>e.preventDefault()} style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <input placeholder="¿Cómo te llamas?" style={inpStyle} />
          <input placeholder="tu@correo.com" style={inpStyle} />
          <button style={{
            padding:'14px 22px', background:FLOUI.ink, color:FLOUI.bg, border:0,
            borderRadius:100, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
          }}>Suscribirme →</button>
          <div style={{ fontSize:11, opacity:0.55, marginTop:4 }}>
            Al suscribirte aceptas nuestro aviso de privacidad.
          </div>
        </form>
        {/* decorative sparkles */}
        <div style={{ position:'absolute', top:24, right:32, opacity:0.4 }}>
          <Sparkle color={FLOUI.navy} size={24} />
        </div>
        <div style={{ position:'absolute', bottom:36, right:120, opacity:0.25 }}>
          <Sparkle color={FLOUI.navy} size={16} />
        </div>
      </div>
    </section>
  );
}

const inpStyle = {
  padding:'14px 18px', fontSize:14, fontFamily:'inherit',
  background:'rgba(255,255,255,0.55)', border:'1px solid rgba(38,38,38,0.18)',
  color:FLOUI.ink, borderRadius:10, outline:'none',
};

// ─── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding:'40px 56px 56px',
      borderTop:'1px solid rgba(255,246,242,0.08)',
      marginTop:24,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:24, flexWrap:'wrap' }}>
        <img src="assets/logo-wordmark.png" alt="floui"
          style={{ height:22, filter:'invert(1) brightness(1.4)', opacity:0.7 }} />
        <div style={{ display:'flex', gap:24, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.5 }}>
          <span>floui.mx</span>
          <span>hola@floui.mx</span>
          <span>@floui.mx</span>
          <span>Aviso de privacidad</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { FlouiUp });
