import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Cookie Policy - Dwell KE',
  description: 'Cookie policy for Dwell KE platform.',
};

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Cookie Policy</h1>
            <p className="text-gray-400">Last updated: May 2026</p>
          </div>

          <GlassmorphicCard className="space-y-6">
            <p className="text-gray-300">
              We use cookies to improve your experience on our platform.
            </p>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Cookies We Use</h3>
              <p className="text-sm text-gray-400">
                • Essential cookies for authentication
                • Analytics cookies for performance monitoring
                • Preference cookies for your settings
              </p>
            </div>
            <p className="text-sm text-gray-500 pt-4">
              You can manage cookies in your browser settings.
            </p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}