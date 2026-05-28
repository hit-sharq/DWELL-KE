import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { NewsBlogSection } from '@/components/NewsBlogSection';

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <CTASection />
      <NewsBlogSection />
      <Footer />
    </main>
  );
}