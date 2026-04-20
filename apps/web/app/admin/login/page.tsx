'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      if (data.user?.role !== 'platform_admin') {
        setError('No tienes permisos de administrador');
        return;
      }
      document.cookie = `admin_token=${data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de login');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080C12' }}>
      <form onSubmit={handleSubmit} style={{ background: '#0D1320', padding: 40, borderRadius: 16, width: 340, border: '1px solid rgba(255,255,255,0.07)' }}>
        <h1 style={{ color: '#00C47D', fontWeight: 800, marginBottom: 8 }}>TechField Admin</h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>Acceso restringido a administradores de plataforma</p>

        {error && <p style={{ color: '#ff4d4d', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 6 }}>Teléfono</label>
        <input value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+52 55 xxxx xxxx"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#080C12', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }} />

        <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 6 }}>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#080C12', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 24 }} />

        <button type="submit"
          style={{ width: '100%', padding: '12px', background: '#00C47D', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
