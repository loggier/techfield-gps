const API = process.env.API_URL ?? 'http://api.techfieldgps.vemontech.com/api/v1';

async function adminFetch<T>(path: string, token: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts?.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Admin API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersWeek: number;
  totalOts: number;
  closedOts: number;
  pendingKb: number;
  approvedKb: number;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  zoneCountry: string;
  level: string;
  activityScore: number;
  totalPoints: number;
  isMarketplaceVisible: boolean;
  createdAt: string;
}

export interface AdminWO {
  id: string;
  slug: string;
  status: string;
  clientName: string;
  vehicleBrand: string;
  vehicleModel: string;
  country: string;
  zoneCountry: string;
  clientRating: number | null;
  createdAt: string;
  technician: { id: string; name: string; level: string };
}

export interface KbPending {
  id: string;
  title: string;
  type: string;
  country: string;
  zoneCountry: string;
  createdAt: string;
  author: { id: string; name: string; level: string };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const adminApi = {
  stats: (token: string) => adminFetch<AdminStats>('/admin/stats', token),
  users: (token: string, q = '') => adminFetch<Paginated<AdminUser>>(`/admin/users?limit=50${q ? `&q=${q}` : ''}`, token),
  workOrders: (token: string, status = '') => adminFetch<Paginated<AdminWO>>(`/admin/work-orders?limit=50${status ? `&status=${status}` : ''}`, token),
  pendingKb: (token: string) => adminFetch<Paginated<KbPending>>('/admin/kb/pending', token),
  approveKb: (token: string, id: string) =>
    adminFetch(`/admin/kb/${id}/approve`, token, { method: 'POST' }),
  rejectKb: (token: string, id: string) =>
    adminFetch(`/admin/kb/${id}/reject`, token, { method: 'POST' }),
};
