import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VendorSense – AI Vendor Intelligence',
  description: 'Smart vendor selection, monitoring, and predictive risk intelligence powered by AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
