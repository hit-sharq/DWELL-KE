import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Licenses - Dwell KE',
  description: 'Open source licenses for Dwell KE platform.',
};

export default function LicensesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Licenses</h1>
          </div>

          <GlassmorphicCard className="space-y-4">
            <p className="text-gray-300">Dwell KE uses open source software.</p>
            <div className="text-sm text-gray-400 space-y-2">
              <p>• Next.js — MIT License</p>
              <p>• React — MIT License</p>
              <p>• Tailwind CSS — MIT License</p>
              <p>• Prisma — Apache 2.0</p>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}