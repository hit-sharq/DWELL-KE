import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - Dwell KE',
  description: 'Pricing plans for tenants and landlords on Dwell KE platform.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Pricing Plans</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that works for you. No hidden fees, transparent pricing for all users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-4">Tenant</h2>
              <p className="text-gray-400 mb-6">Finding your dream property should be simple and affordable.</p>
              <div className="text-4xl font-bold text-cyan-400 mb-4">Free</div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex gap-2">✓ Browse verified properties</li>
                <li className="flex gap-2">✓ Secure M-Pesa payments</li>
                <li className="flex gap-2">✓ Direct landlord messaging</li>
                <li className="flex gap-2">✓ Booking management</li>
              </ul>
              <Link href="/marketplace" className="block w-full text-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">Start Browsing</Link>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-4">Landlord</h2>
              <p className="text-gray-400 mb-6">List your property and connect with quality tenants.</p>
              <div className="text-4xl font-bold text-cyan-400 mb-4">
                10% Fee
                <span className="text-lg text-gray-500 font-normal">/booking</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex gap-2">✓ Property listing</li>
                <li className="flex gap-2">✓ Tenant screening</li>
                <li className="flex gap-2">✓ Payment processing</li>
                <li className="flex gap-2">✓ Analytics dashboard</li>
              </ul>
              <Link href="/auth/signup" className="block w-full text-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">Get Started</Link>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}