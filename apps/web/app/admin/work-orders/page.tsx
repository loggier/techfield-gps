import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminApi } from '../../../lib/admin-api';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', in_progress: 'En progreso', completed: 'Completada', cancelled: 'Cancelada',
};
const STATUS_COLOR: Record<string, string> = {
  draft: '#666', in_progress: '#4a9eff', completed: '#00C47D', cancelled: '#ff4d4d',
};

export default async function AdminWorkOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const token = cookies().get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  const { items, total } = await adminApi.workOrders(token, searchParams.status ?? '');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Órdenes de Trabajo</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{total.toLocaleString()} OTs</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'draft', 'in_progress', 'completed', 'cancelled'].map(s => (
            <a key={s} href={s ? `?status=${s}` : '/admin/work-orders'}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #333', color: searchParams.status === s || (!s && !searchParams.status) ? '#00C47D' : '#666', textDecoration: 'none', fontSize: 13, background: 'transparent' }}>
              {s ? STATUS_LABEL[s] : 'Todas'}
            </a>
          ))}
        </div>
      </div>

      <div style={{ background: '#0D1320', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Cliente', 'Vehículo', 'Técnico', 'Estado', 'Rating', 'País', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(wo => (
              <tr key={wo.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', color: '#fff' }}>{wo.clientName}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{wo.vehicleBrand} {wo.vehicleModel}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{wo.technician?.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: STATUS_COLOR[wo.status] ?? '#666', fontWeight: 600, fontSize: 12 }}>
                    {STATUS_LABEL[wo.status] ?? wo.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: wo.clientRating ? '#f59e0b' : '#444' }}>
                  {wo.clientRating ? `★ ${wo.clientRating}` : '–'}
                </td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{wo.country}</td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 12 }}>
                  {new Date(wo.createdAt).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
