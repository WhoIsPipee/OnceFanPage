import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const manrope = localFont({src: '../../public/fonts/manrope.ttf', variable: '--font-body', display: 'swap'});
const space = localFont({src: '../../public/fonts/space-grotesk-bold.ttf', variable: '--font-display', display: 'swap'});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'SANA / MK2 — A universe of her own',
  description: 'El universo de Minatozaki Sana: TWICE, MISAMO, su trayectoria, fotografías, covers y Fridge Interview. Un archivo hecho por fans.',
  openGraph: {title: 'SANA / MK2', description: 'A universe of her own. Un archivo visual de Minatozaki Sana.', images: ['/images/sana-magenta.jpg']},
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="es" className={`${manrope.variable} ${space.variable}`}><body>{children}</body></html>;
}
