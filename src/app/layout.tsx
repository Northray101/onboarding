import type { Metadata } from 'next'
import { Cormorant_Garamond, Sora } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ClientForm — Creative Onboarding',
  description: 'Beautiful animated client onboarding forms for creative studios',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${sora.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
