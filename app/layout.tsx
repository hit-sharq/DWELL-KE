import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import OnboardingRedirect from '@/components/OnboardingRedirect'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

/* ─── Cinematic type scale ─── */
const _inter  = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
const _serif  = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Dwell KE — Premium Property Platform for Kenya',
  description:
    'Luxury verified properties in Nairobi, Mombasa, Nakuru & beyond. ' +
    'Instant M-Pesa bookings, trusted landlords, and AI-powered property matching — reimagined.',
  keywords: [
    'Dwell KE', 'Kenya properties', 'Nairobi apartments', 'Mombasa beachfront',
    'verified landlords', 'M-Pesa property', 'luxury Kenya real estate',
  ],
  openGraph: {
    title: 'Dwell KE — Luxury Properties in Kenya',
    description: 'Premium verified properties — Nairobi, Mombasa, Nakuru & beyond.',
    type: 'website',
    locale: 'en_KE',
  },
  icons: {
    icon: [{ url: '/favicon.ico', href: '/favicon.ico' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Allow user pinch/zoom for accessibility on mobile.
  userScalable: true,
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="system">
<ClerkProvider>
        <html
          lang="en"
          className="scroll-smooth"
          suppressHydrationWarning
        style={{
          // Inject CSS vars so globals uses the right palettes
          ['--font-display' as string]: _serif.variable,
          ['--font-inter'   as string]: _inter.variable,
        }}
      >
        <body
          className={`
            ${_inter.variable}
            ${_serif.variable}
            font-sans
            antialiased
            bg-background
            text-foreground

            min-h-screen
            overflow-x-hidden
          `}
          suppressHydrationWarning
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
          <OnboardingRedirect />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
        </ClerkProvider>
      </ThemeProvider>
  );
}

