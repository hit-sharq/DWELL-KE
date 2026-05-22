import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dwell KE - Premium Property Management',
  description: 'Discover verified properties in Kenya with Dwell KE. Secure bookings, trusted landlords, and seamless transactions.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
       icons: {
         icon: [
           {
             url: '/favicon.ico',
             href: '/favicon.ico',
           },
         ],
       },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark scroll-smooth">
        <body className="font-sans antialiased bg-background text-foreground">
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
