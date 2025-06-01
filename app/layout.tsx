import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAAAM STUDIO',
  description: 'Browser engine, no coding expirience nessesary but poweful enough for pros',
  generator: 'SAAAM LLC',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
