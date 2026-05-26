import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Terms of Service - Dwell KE',
  description: 'Terms of service for Dwell KE platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: May 2026</p>
          </div>

          <GlassmorphicCard className="space-y-6">
            <p className="text-gray-300">
              By using Dwell KE, you agree to these terms governing property listings, bookings, and payments.
            </p>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Key Terms</h3>
              <p className="text-sm text-gray-400">
                • Landlords pay 10% fee per successful booking
                • Tenants must provide accurate information
                • All properties must be verified before listing
                • Payments processed through M-Pesa
              </p>
            </div>
            <p className="text-sm text-gray-500 pt-4">
              Questions? Contact legal@dwellke.com
            </p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}