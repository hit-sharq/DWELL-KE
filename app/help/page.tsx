import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Help Centre - Dwell KE',
  description: 'Get help with your property search, bookings, and account.',
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Help Centre</h1>
            <p className="text-gray-400 text-lg">Find answers to common questions</p>
          </div>

          <GlassmorphicCard className="text-center py-16">
            <p className="text-gray-400 mb-4">How can we help you today?</p>
            <p className="text-gray-500">Email support@dwellke.com or call +254 (0) 110 123 456</p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}