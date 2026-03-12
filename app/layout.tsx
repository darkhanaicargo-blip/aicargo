import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aicargo — Ачаа тээвэр',
  description: 'Карго бараа хянах систем',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  )
}
