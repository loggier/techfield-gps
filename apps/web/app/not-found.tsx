export default function NotFound() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
      <h1 style={{ fontSize: 48, color: 'var(--green)' }}>404</h1>
      <p style={{ color: 'var(--grey)' }}>Reporte no encontrado o no disponible</p>
      <a href="/" style={{ color: 'var(--green)', fontSize: 14 }}>← Volver al inicio</a>
    </main>
  );
}
