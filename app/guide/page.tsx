import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Property Guide - Dwell KE',
  description: 'Your guide to renting and managing properties in Kenya.',
};

export default function PropertyGuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Property Guide</h1>
            <p className="text-gray-400 text-lg">Everything you need to know about Kenyan property rental</p>
          </div>

          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-white mb-4">Tenant Guide</h2>
            <p className="text-gray-400 mb-4">
              Finding the right property in Kenya? Here are the key things to know:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Research neighborhoods and commute times</li>
              <li>• Understand typical lease terms (6-12 months)</li>
              <li>• Budget for deposit (typically 1-3 months rent)</li>
              <li>• Check water and electricity connections</li>
            </ul>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}