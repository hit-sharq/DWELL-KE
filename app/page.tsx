import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';

import { HowItWorksSection } from '@/components/HowItWorksSection';
import { CTASection } from '@/components/CTASection';
import { NewsBlogSection } from '@/components/NewsBlogSection';
import { Footer } from '@/components/Footer';
import { LandingMarketplacePreview } from '@/components/LandingMarketplacePreview';

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />

      <HowItWorksSection />

      <section className="container mx-auto px-4 py-8">
        <LandingMarketplacePreview />
      </section>

      <CTASection />
      <NewsBlogSection />
      <Footer />
    </main>
  );
}