import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClientForm — Creative Onboarding',
  description: 'Beautiful animated client onboarding forms',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
