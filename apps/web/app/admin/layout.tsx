import { ReactNode } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Técnicos' },
  { href: '/admin/work-orders', label: 'Órdenes de trabajo' },
  { href: '/admin/kb', label: 'KB Pendiente' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#080C12', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0D1320', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color: '#00C47D', fontWeight: 800, fontSize: 16 }}>TechField</span>
          <span style={{ color: '#666', fontSize: 12, display: 'block', marginTop: 2 }}>Panel Admin</span>
        </div>
        <nav style={{ padding: '16px 0' }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              style={{ display: 'block', padding: '10px 20px', color: '#ccc', textDecoration: 'none', fontSize: 14, borderLeft: '3px solid transparent' }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 24, padding: '0 20px' }}>
          <a href="/admin/login" style={{ color: '#666', fontSize: 12, textDecoration: 'none' }}>Cerrar sesión</a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
