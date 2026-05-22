import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'About Dwell KE - Premium Property Management',
  description: 'Learn about Dwell KE and our mission to revolutionize property rental in Kenya.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">About Dwell KE</h1>
          
          <div className="space-y-8">
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                Dwell KE exists to revolutionize property rental in Kenya. We&apos;re building the most trusted platform for connecting tenants with verified landlords, ensuring secure, transparent, and seamless transactions powered by M-Pesa integration and advanced fraud detection.
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-4">Why Choose Dwell KE?</h2>
              <ul className="space-y-3 text-gray-400">
                <li className="flex gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span>All properties are verified and authenticated for your peace of mind</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span>Secure M-Pesa payment integration for seamless transactions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span>Advanced AI-powered fraud detection to protect users</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span>Real-time insights and notifications for property inquiries</span>
                </li>
              </ul>
            </GlassmorphicCard>

            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
              <p className="text-gray-400 leading-relaxed">
                Built by a passionate team of real estate professionals and technologists who understand the challenges of property rental in Kenya. We&apos;re committed to creating a platform that puts security and transparency first.
              </p>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
