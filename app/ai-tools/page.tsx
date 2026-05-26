import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

export const metadata = {
  title: 'AI Tools - Dwell KE',
  description: 'AI-powered property recommendations and fraud detection.',
};

export default function AIToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">AI Tools</h1>
            <p className="text-gray-400 text-lg">Smart property matching powered by AI</p>
          </div>

          <GlassmorphicCard className="text-center py-16">
            <p className="text-gray-400 mb-4">Our AI tools are coming soon!</p>
            <p className="text-gray-500">Get personalized property recommendations and smart fraud detection.</p>
          </GlassmorphicCard>
        </div>
      </div>
      <Footer />
    </main>
  );
}