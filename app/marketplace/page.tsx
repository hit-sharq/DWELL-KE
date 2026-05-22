import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PropertyListing } from '@/components/PropertyListing';

export const metadata = {
  title: 'Property Marketplace - Dwell KE',
  description: 'Browse verified properties available in Kenya',
};

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <PropertyListing />
      </div>
      <Footer />
    </main>
  );
}
