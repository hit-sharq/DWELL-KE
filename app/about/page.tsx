import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { AboutContent } from '@/components/AboutContent';
import { FEATURES } from '@/lib/constants';

export const metadata = {
  title: 'About Dwell KE - Premium Property Management',
  description: 'Learn about Dwell KE and our mission to revolutionize property rental in Kenya.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden pt-24 pb-28 sm:pt-28 sm:pb-36">
        <div className="absolute inset-0 -z-10 gradient-surface-alt opacity-100" />

        {/* cinematic glow blobs */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/10 blur-[80px] -z-10" />
        <div className="absolute top-20 -right-24 w-[360px] h-[360px] rounded-full bg-violet-500/10 blur-[80px] -z-10" />

        {/* bottom fade to keep content readable */}
        <div className="absolute inset-x-0 bottom-0 h-56 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <AboutContent FEATURES={FEATURES} />
          </div>
        </div>

        <div className="scene-divider mt-32" />
      </section>
      <Footer />
    </main>
  );
}

