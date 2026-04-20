import Link from 'next/link';

const FEATURES = [
  { icon: '📋', title: 'OTs digitales', desc: 'Crea y cierra órdenes de trabajo con evidencias fotográficas, firma digital y reporte PDF.' },
  { icon: '🏆', title: 'Gamificación', desc: 'Sistema de puntos, niveles y badges. De Básico a Elite mientras tu carrera crece.' },
  { icon: '📚', title: 'Base de conocimiento', desc: 'Accede a guías de instalación, APNs y cortes de motor aportadas por la comunidad.' },
  { icon: '🔗', title: 'Link público', desc: 'Comparte la OT con tu cliente via WhatsApp. Sin app, solo un link con toda la info.' },
  { icon: '🔔', title: 'Push notifications', desc: 'Alertas de nuevas OTs, subida de nivel y recordatorios de actividad.' },
  { icon: '📡', title: 'Offline', desc: 'Trabaja sin internet. La app sincroniza al reconectarte.' },
];

const LEVELS = [
  { name: 'Nuevo', score: '0-39', color: '#666' },
  { name: 'Básico', score: '40-59', color: '#888' },
  { name: 'Verificado', score: '60-74', color: '#4a9eff' },
  { name: 'Pro', score: '75-84', color: '#a855f7' },
  { name: 'Senior', score: '85-92', color: '#f59e0b' },
  { name: 'Elite', score: '93+', color: '#00C47D' },
];

export default function LandingPage() {
  return (
    <main style={{ background: '#080C12', color: '#fff', fontFamily: "'Sora','Inter',sans-serif", overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 64px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,196,125,0.12)', border: '1px solid rgba(0,196,125,0.4)', borderRadius: 24, padding: '6px 18px', fontSize: 13, color: '#00C47D', marginBottom: 24 }}>
          Para técnicos GPS en LATAM
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px' }}>
          El CRM que los{' '}
          <span style={{ color: '#00C47D' }}>técnicos GPS</span>{' '}
          merecían
        </h1>
        <p style={{ color: '#8899aa', fontSize: 18, maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Gestiona tus instalaciones, genera reportes PDF profesionales y crece de Básico a Elite mientras tu carrera avanza.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer"
            style={{ background: '#00C47D', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>
            Descargar en Android
          </a>
          <a href="#features"
            style={{ background: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16, border: '1px solid rgba(255,255,255,0.15)' }}>
            Ver funciones
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: '#0D1320', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
          {[['OTs generadas', '12,400+'], ['Técnicos activos', '1,800+'], ['Países', '6'], ['KB entradas', '300+']].map(([label, value]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#00C47D', margin: 0 }}>{value}</p>
              <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 48 }}>Todo lo que necesitas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#0D1320', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 14 }}>{f.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#8899aa', lineHeight: 1.6, margin: 0, fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section style={{ padding: '64px 20px', background: '#0D1320', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Escala tu nivel profesional</h2>
          <p style={{ color: '#8899aa', marginBottom: 40 }}>Tu activity score refleja qué tan activo eres. Sube de nivel y desbloquea nuevas funciones.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <div key={l.name} style={{ background: '#080C12', border: `1px solid ${l.color}40`, borderRadius: 12, padding: '14px 20px', minWidth: 110 }}>
                <p style={{ color: l.color, fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>{l.name}</p>
                <p style={{ color: '#666', fontSize: 12, margin: 0 }}>{l.score} pts</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>¿Listo para digitalizarte?</h2>
        <p style={{ color: '#8899aa', marginBottom: 36 }}>Únete a los técnicos GPS más profesionales de LATAM.</p>
        <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer"
          style={{ background: '#00C47D', color: '#fff', padding: '16px 40px', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 18, display: 'inline-block' }}>
          Descargar gratis →
        </a>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0D1320', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px', textAlign: 'center', color: '#555', fontSize: 13 }}>
        © 2025 Vemontech · TechField GPS · <a href="/admin" style={{ color: '#444', textDecoration: 'none' }}>Admin</a>
      </footer>
    </main>
  );
}
