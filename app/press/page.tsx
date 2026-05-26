import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'Press - Dwell KE',
  description: 'Press releases and media coverage for Dwell KE.',
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Press</h1>
            <p className="text-gray-400 text-lg">Media resources and company news</p>
          </div>

          <GlassmorphicCard className="text-center py-16">
            <p className="text-gray-400">Press kit and media contact: press@dwellke.com</p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}