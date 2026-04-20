import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechField GPS',
  description: 'Plataforma de técnicos GPS verificados en LATAM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
