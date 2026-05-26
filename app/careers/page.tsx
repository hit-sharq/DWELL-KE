import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import Link from 'next/link';

export const metadata = {
  title: 'Careers - Dwell KE',
  description: 'Join our team and help revolutionize property rental in Kenya.',
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Careers</h1>
            <p className="text-gray-400 text-lg">Join us in building the future of property rental in Kenya</p>
          </div>

          <GlassmorphicCard className="text-center py-16">
            <p className="text-gray-400 mb-4">We're hiring!</p>
            <p className="text-gray-500">Check back soon for open positions or email careers@dwellke.com</p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}