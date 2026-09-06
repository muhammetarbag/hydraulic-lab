import type { Metadata } from 'next';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';
export const metadata: Metadata = {
  icons: {
    icon: `${process.env.HYDRAULIC_PAGES === 'true' ? '/hydraulic-lab' : ''}/favicon.svg`,
  },
  title: 'Hydraulic Lab · ATA 29 | HEE 305',
  description:
    'Etkileşimli uçak hidrolik sistemi, arıza senaryoları ve açıklamalı ATA 29 soruları.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="dark">
      <body>{children}</body>
    </html>
  );
}
