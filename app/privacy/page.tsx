import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Privacy Policy - Dwell KE',
  description: 'Privacy policy for Dwell KE platform.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: May 2026</p>
          </div>

          <GlassmorphicCard className="space-y-6">
            <p className="text-gray-300">
              Dwell KE respects your privacy. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Information We Collect</h3>
              <p className="text-sm text-gray-400">
                • Account information (name, email, phone)
                • Property listings and bookings
                • Payment transaction data (processed securely)
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">How We Use Your Information</h3>
              <p className="text-sm text-gray-400">
                • To match tenants with properties
                • To process payments securely
                • To send important notifications
              </p>
            </div>
            <p className="text-sm text-gray-500 pt-4">
              For questions, contact privacy@dwellke.com
            </p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}