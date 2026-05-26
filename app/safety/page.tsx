import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Safety Guide - Dwell KE',
  description: 'Safety guidelines for property seekers and landlords.',
};

export default function SafetyGuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Safety Guide</h1>
            <p className="text-gray-400 text-lg">Your safety is our priority</p>
          </div>

          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-white mb-4">Tips for Tenants</h2>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex gap-2">✓ Verify property listings before visiting</li>
              <li className="flex gap-2">✓ Never send money without booking confirmation</li>
              <li className="flex gap-2">✓ Meet in public places for initial viewings</li>
              <li className="flex gap-2">✓ Report suspicious activity immediately</li>
            </ul>
          </GlassmorphicCard>

          <GlassmorphicCard className="mt-6">
            <h2 className="text-2xl font-bold text-white mb-4">Tips for Landlords</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex gap-2">✓ Screen tenants through our verification system</li>
              <li className="flex gap-2">✓ Document property condition with photos</li>
              <li className="flex gap-2">✓ Use secure M-Pesa payments through our platform</li>
              <li className="flex gap-2">✓ Keep records of all communications</li>
            </ul>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}