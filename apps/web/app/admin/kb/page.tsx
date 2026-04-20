import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminApi } from '../../../lib/admin-api';

async function approveKb(id: string, token: string) {
  'use server';
  await adminApi.approveKb(token, id);
}

async function rejectKb(id: string, token: string) {
  'use server';
  await adminApi.rejectKb(token, id);
}

const TYPE_LABELS: Record<string, string> = {
  motor_cut: 'Corte motor', apn: 'APN', installation: 'Instalación',
  known_issue: 'Problema', config: 'Config',
};

export default async function AdminKbPage() {
  const token = cookies().get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  const { items, total } = await adminApi.pendingKb(token);

  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>KB — Pendientes de revisión</h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>{total} entrada{total !== 1 ? 's' : ''} esperando aprobación</p>

      {items.length === 0 && (
        <div style={{ background: '#0D1320', borderRadius: 12, padding: 40, textAlign: 'center', color: '#666' }}>
          No hay entradas pendientes ✓
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(entry => (
          <div key={entry.id} style={{ background: '#0D1320', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: '#1a3a2a', color: '#00C47D', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </span>
                <h3 style={{ color: '#fff', fontWeight: 700, margin: '8px 0 4px', fontSize: 16 }}>{entry.title}</h3>
                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                  Por <strong style={{ color: '#aaa' }}>{entry.author?.name}</strong> · {entry.author?.level} · {entry.country} ·{' '}
                  {new Date(entry.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <form action={async () => {
                  'use server';
                  await approveKb(entry.id, token);
                }}>
                  <button type="submit"
                    style={{ padding: '8px 18px', background: '#00C47D', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Aprobar
                  </button>
                </form>
                <form action={async () => {
                  'use server';
                  await rejectKb(entry.id, token);
                }}>
                  <button type="submit"
                    style={{ padding: '8px 18px', background: 'transparent', border: '1px solid #ff4d4d', borderRadius: 8, color: '#ff4d4d', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
