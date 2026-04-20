import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminApi } from '../../../lib/admin-api';

const LEVEL_COLORS: Record<string, string> = {
  nuevo: '#666', basico: '#888', verificado: '#4a9eff',
  pro: '#a855f7', senior: '#f59e0b', elite: '#00C47D',
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const token = cookies().get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  const { items, total } = await adminApi.users(token, searchParams.q ?? '');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Técnicos</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{total.toLocaleString()} registrados</p>
        </div>
        <form>
          <input name="q" defaultValue={searchParams.q ?? ''}
            placeholder="Buscar por nombre o teléfono..."
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #333', background: '#0D1320', color: '#fff', fontSize: 14, width: 280 }} />
        </form>
      </div>

      <div style={{ background: '#0D1320', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Nombre', 'Teléfono', 'País', 'Nivel', 'Score', 'Puntos', 'Activo', 'Registro'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', color: '#fff' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{u.phone}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{u.country}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: LEVEL_COLORS[u.level] ?? '#333', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {u.level}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#00C47D', fontWeight: 700 }}>{u.activityScore}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{u.totalPoints.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: u.isActive ? '#00C47D' : '#666' }}>{u.isActive ? '✓' : '–'}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
