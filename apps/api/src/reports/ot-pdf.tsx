import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { WorkOrder } from '../work-orders/entities/work-order.entity';

const BRAND_GREEN = '#00c896';
const DARK = '#1a1a2e';
const GREY = '#666666';
const LIGHT_BORDER = '#e8e8e8';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    color: DARK,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `2 solid ${BRAND_GREEN}`,
  },
  brandName: { fontSize: 18, color: BRAND_GREEN },
  brandSub: { fontSize: 8, color: GREY, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: BRAND_GREEN,
    color: 'white',
    fontSize: 8,
    padding: '4 8',
    borderRadius: 3,
  },
  headerDate: { fontSize: 8, color: GREY, marginTop: 4 },

  // Sections
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 10,
    color: BRAND_GREEN,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: `1 solid ${LIGHT_BORDER}`,
  },

  // Rows
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, color: GREY, fontSize: 8 },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },

  // Avatar
  avatar: { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },

  // Evidence grid
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  evidenceCell: { width: '48%', marginRight: '2%', marginBottom: 8 },
  evidenceImg: { width: '100%', height: 110, objectFit: 'cover', borderRadius: 3 },
  evidenceCaption: { fontSize: 7, color: GREY, marginTop: 2 },

  // Signature
  sigBox: { border: `1 solid ${LIGHT_BORDER}`, padding: 8, borderRadius: 4, marginTop: 4 },
  sigImg: { width: '100%', height: 72, objectFit: 'contain' },
  sigName: { fontSize: 8, color: GREY, marginTop: 4 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: GREY,
    borderTop: `1 solid ${LIGHT_BORDER}`,
    paddingTop: 6,
  },
});

function fmt(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function maskImei(imei: string): string {
  if (!imei || imei.length < 5) return imei ?? '—';
  return imei.slice(0, -5) + '*****';
}

const WO_TYPE_LABEL: Record<string, string> = {
  installation: 'Instalación',
  revision: 'Revisión',
  support: 'Soporte',
  config: 'Configuración',
  motor_cut: 'Corte de motor',
};

interface Props {
  wo: WorkOrder;
  shareUrl: string;
}

export function OtPdfDocument({ wo, shareUrl }: Props) {
  const tech = wo.technician;
  const completedOn = fmt(wo.completedAt || wo.createdAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>TechField GPS</Text>
            <Text style={styles.brandSub}>Reporte de servicio técnico</Text>
            <Text style={styles.headerDate}>{completedOn}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.verifiedBadge}>✓ Instalación Verificada</Text>
            <Text style={{ fontSize: 7, color: GREY, marginTop: 6 }}>{shareUrl}</Text>
          </View>
        </View>

        {/* ── Técnico ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnico</Text>
          {tech?.avatarUrl ? (
            <Image src={tech.avatarUrl} style={styles.avatar} />
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{tech?.name ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nivel</Text>
            <Text style={styles.value}>{tech?.level ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Zona</Text>
            <Text style={styles.value}>
              {[tech?.zoneCity, tech?.zoneState].filter(Boolean).join(', ') || '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de servicio</Text>
            <Text style={styles.value}>{WO_TYPE_LABEL[wo.type] ?? wo.type}</Text>
          </View>
        </View>

        {/* ── Vehículo ───────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca / Modelo / Año</Text>
            <Text style={styles.value}>
              {wo.vehicleBrand} {wo.vehicleModel} {wo.vehicleYear}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placa</Text>
            <Text style={styles.value}>{wo.vehiclePlate}</Text>
          </View>
          {wo.vehicleColor ? (
            <View style={styles.row}>
              <Text style={styles.label}>Color</Text>
              <Text style={styles.value}>{wo.vehicleColor}</Text>
            </View>
          ) : null}
          {wo.vehicleVin ? (
            <View style={styles.row}>
              <Text style={styles.label}>VIN</Text>
              <Text style={styles.value}>{wo.vehicleVin}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Dispositivo GPS ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispositivo GPS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dispositivo</Text>
            <Text style={styles.value}>{wo.deviceBrand} {wo.deviceModel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IMEI</Text>
            <Text style={styles.value}>{maskImei(wo.deviceImei)}</Text>
          </View>
          {wo.deviceSim ? (
            <View style={styles.row}>
              <Text style={styles.label}>SIM</Text>
              <Text style={styles.value}>{wo.deviceSim}</Text>
            </View>
          ) : null}
          {wo.deviceOperator ? (
            <View style={styles.row}>
              <Text style={styles.label}>Operadora</Text>
              <Text style={styles.value}>{wo.deviceOperator}</Text>
            </View>
          ) : null}
          {wo.devicePlatform ? (
            <View style={styles.row}>
              <Text style={styles.label}>Plataforma</Text>
              <Text style={styles.value}>{wo.devicePlatform}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Cliente ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{wo.clientName}</Text>
          </View>
          {wo.clientPhone ? (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{wo.clientPhone}</Text>
            </View>
          ) : null}
          {wo.clientRating ? (
            <View style={styles.row}>
              <Text style={styles.label}>Calificación</Text>
              <Text style={styles.value}>{'★'.repeat(wo.clientRating)} ({wo.clientRating}/5)</Text>
            </View>
          ) : null}
        </View>

        {/* ── Notas ──────────────────────────────────────────────────────── */}
        {wo.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas técnicas</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{wo.notes}</Text>
          </View>
        ) : null}

        {/* ── Evidencias ─────────────────────────────────────────────────── */}
        {wo.evidences?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Evidencias fotográficas ({wo.evidences.length})
            </Text>
            <View style={styles.evidenceGrid}>
              {wo.evidences.map((ev) => (
                <View key={ev.id} style={styles.evidenceCell}>
                  <Image src={ev.url} style={styles.evidenceImg} />
                  <Text style={styles.evidenceCaption}>
                    {ev.stage} — {fmt(ev.takenAt || ev.uploadedAt)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Firma ──────────────────────────────────────────────────────── */}
        {wo.clientSignatureUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Firma del cliente</Text>
            <View style={styles.sigBox}>
              <Image src={wo.clientSignatureUrl} style={styles.sigImg} />
              <Text style={styles.sigName}>
                {wo.clientName} — {fmt(wo.completedAt)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text>Verificado por TechField GPS</Text>
          <Text>{shareUrl}</Text>
          <Text>Generado el {fmt(new Date())}</Text>
        </View>

      </Page>
    </Document>
  );
}
