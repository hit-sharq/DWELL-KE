'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';

export default function AdminReportsPage() {
  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-400">Generate and view platform analytics reports</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Revenue Report', desc: 'Monthly and yearly revenue analytics' },
          { title: 'User Growth', desc: 'Track user acquisition and engagement' },
          { title: 'Property Analytics', desc: 'Performance metrics for all properties' },
          { title: 'Fraud Detection', desc: 'Suspicious activity and disputes' },
        ].map((report) => (
          <GlassmorphicCard key={report.title}>
            <h3 className="text-lg font-bold text-white mb-2">{report.title}</h3>
            <p className="text-gray-400 mb-4">{report.desc}</p>
            <PremiumButton variant="outline" size="sm">
              Generate Report
            </PremiumButton>
          </GlassmorphicCard>
        ))}
      </motion.div>
    </div>
  );
}
