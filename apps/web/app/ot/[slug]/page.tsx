import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const PUBLIC_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://techfieldgps.vemontech.com';

interface Evidence {
  id: string;
  url: string;
  stage: string;
  takenAt?: string;
  uploadedAt: string;
}

interface Technician {
  name: string;
  level: string;
  avatarUrl?: string;
  zoneCity?: string;
  zoneState?: string;
}

interface WorkOrder {
  slug: string;
  clientName: string;
  clientRating?: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor?: string;
  deviceBrand: string;
  deviceModel: string;
  deviceImei: string;
  deviceSim?: string;
  deviceOperator?: string;
  devicePlatform?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  technician: Technician;
  evidences: Evidence[];
}

async function fetchOt(slug: string): Promise<WorkOrder | null> {
  try {
    const res = await fetch(`${API_URL}/public/ot/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const wo = await fetchOt(params.slug);
  if (!wo) {
    return { title: 'Reporte no encontrado — TechField GPS' };
  }

  const title = `Instalación GPS verificada — ${wo.vehicleBrand} ${wo.vehicleModel} | TechField GPS`;
  const description = `Reporte de instalación GPS en ${wo.vehicleBrand} ${wo.vehicleModel} ${wo.vehicleYear} placa ${wo.vehiclePlate}. Técnico: ${wo.technician.name} (${wo.technician.level}).`;
  const firstPhoto = wo.evidences[0]?.url;
  const pageUrl = `${PUBLIC_URL}/ot/${wo.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'TechField GPS',
      type: 'article',
      images: firstPhoto ? [{ url: firstPhoto, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: firstPhoto ? [firstPhoto] : [],
    },
  };
}

function fmt(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function maskImei(imei: string): string {
  if (imei.length < 5) return imei;
  return imei.slice(0, -5) + '*****';
}

const STAGE_LABEL: Record<string, string> = {
  before: 'Antes',
  during: 'Durante',
  after: 'Después',
  device: 'Dispositivo',
  extra: 'Extra',
};

export default async function OtPage({ params }: { params: { slug: string } }) {
  const wo = await fetchOt(params.slug);
  if (!wo) notFound();

  const shareUrl = `${PUBLIC_URL}/ot/${wo.slug}`;
  const pdfUrl = `${API_URL}/public/ot/${wo.slug}/pdf`;
  const waText = encodeURIComponent(`📍 Reporte de instalación GPS\n${shareUrl}`);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: '3px solid var(--green)', paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--grey)', marginBottom: 4 }}>TechField GPS · Reporte de servicio</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark)' }}>
              Instalación verificada
            </h1>
            <p style={{ fontSize: 13, color: 'var(--grey)', marginTop: 4 }}>
              {fmt(wo.completedAt ?? wo.createdAt)}
            </p>
          </div>
          <span style={{ background: 'var(--green)', color: 'white', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
            ✓ Verificada
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={btnStyle('#1a1a2e', 'white')}
          >
            ⬇ Descargar PDF
          </a>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={btnStyle('#25D366', 'white')}
          >
            WhatsApp
          </a>
        </div>
      </header>

      {/* ── Técnico ─────────────────────────────────────────────────────── */}
      <Section title="Técnico">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {wo.technician.avatarUrl ? (
            <Image
              src={wo.technician.avatarUrl}
              alt={wo.technician.name}
              width={52}
              height={52}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>
              {wo.technician.name.charAt(0)}
            </div>
          )}
          <div>
            <p style={{ fontWeight: 600 }}>{wo.technician.name}</p>
            <p style={{ fontSize: 12, color: 'var(--grey)' }}>
              {wo.technician.level}
              {wo.technician.zoneCity ? ` · ${wo.technician.zoneCity}` : ''}
              {wo.technician.zoneState ? `, ${wo.technician.zoneState}` : ''}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Vehículo ────────────────────────────────────────────────────── */}
      <Section title="Vehículo">
        <Row label="Marca / Modelo" value={`${wo.vehicleBrand} ${wo.vehicleModel} ${wo.vehicleYear}`} />
        <Row label="Placa" value={wo.vehiclePlate} />
        {wo.vehicleColor && <Row label="Color" value={wo.vehicleColor} />}
      </Section>

      {/* ── Dispositivo GPS ─────────────────────────────────────────────── */}
      <Section title="Dispositivo GPS">
        <Row label="Dispositivo" value={`${wo.deviceBrand} ${wo.deviceModel}`} />
        <Row label="IMEI" value={maskImei(wo.deviceImei)} />
        {wo.deviceSim && <Row label="SIM" value={wo.deviceSim} />}
        {wo.deviceOperator && <Row label="Operadora" value={wo.deviceOperator} />}
        {wo.devicePlatform && <Row label="Plataforma" value={wo.devicePlatform} />}
      </Section>

      {/* ── Cliente ─────────────────────────────────────────────────────── */}
      <Section title="Cliente">
        <Row label="Nombre" value={wo.clientName} />
        {wo.clientRating ? (
          <Row label="Calificación" value={'★'.repeat(wo.clientRating) + ` (${wo.clientRating}/5)`} />
        ) : null}
      </Section>

      {/* ── Notas ───────────────────────────────────────────────────────── */}
      {wo.notes ? (
        <Section title="Notas técnicas">
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{wo.notes}</p>
        </Section>
      ) : null}

      {/* ── Evidencias ──────────────────────────────────────────────────── */}
      {wo.evidences.length > 0 ? (
        <Section title={`Evidencias fotográficas (${wo.evidences.length})`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {wo.evidences.map((ev) => (
              <div key={ev.id}>
                <Image
                  src={ev.url}
                  alt={STAGE_LABEL[ev.stage] ?? ev.stage}
                  width={400}
                  height={270}
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                />
                <p style={{ fontSize: 11, color: 'var(--grey)', marginTop: 4 }}>
                  {STAGE_LABEL[ev.stage] ?? ev.stage} · {fmt(ev.takenAt ?? ev.uploadedAt)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--grey)', flexWrap: 'wrap', gap: 8 }}>
        <span>Verificado por TechField GPS</span>
        <a href={shareUrl} style={{ color: 'var(--green)' }}>{shareUrl}</a>
      </footer>

    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
      <span style={{ width: 140, flexShrink: 0, color: 'var(--grey)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'inline-block',
  };
}
