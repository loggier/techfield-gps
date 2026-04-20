import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminApi } from '../../lib/admin-api';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: '#0D1320', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 6 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#00C47D', fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const token = cookies().get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  let stats;
  try {
    stats = await adminApi.stats(token);
  } catch {
    redirect('/admin/login');
  }

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>Resumen de la plataforma TechField GPS</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Técnicos totales" value={stats.totalUsers.toLocaleString()} sub={`+${stats.newUsersWeek} esta semana`} />
        <StatCard label="Técnicos activos" value={stats.activeUsers.toLocaleString()} />
        <StatCard label="OTs totales" value={stats.totalOts.toLocaleString()} sub={`${stats.closedOts} completadas`} />
        <StatCard label="KB aprobados" value={stats.approvedKb.toLocaleString()} sub={`${stats.pendingKb} pendientes`} />
      </div>

      {stats.pendingKb > 0 && (
        <div style={{ background: 'rgba(0,196,125,0.1)', border: '1px solid #00C47D', borderRadius: 12, padding: 16 }}>
          <p style={{ color: '#00C47D', fontWeight: 600, margin: 0 }}>
            📋 {stats.pendingKb} entrada{stats.pendingKb > 1 ? 's' : ''} de KB esperan aprobación →{' '}
            <a href="/admin/kb" style={{ color: '#00C47D', textDecoration: 'underline' }}>Revisar ahora</a>
          </p>
        </div>
      )}
    </>
  );
}
