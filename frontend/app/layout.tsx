import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'F1 Telemetry Battle',
  description: 'Compare F1 driver telemetry with stunning 3D race visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

