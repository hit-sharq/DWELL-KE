'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRAND } from '@/lib/constants';

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Mobile App', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
      ],
    },
  ];

  return (
    <footer className="glassmorphic-dark border-t border-slate-700/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h3 className="text-xl font-bold text-white mb-2">{BRAND.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{BRAND.description}</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Instagram
              </a>
            </div>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <motion.div
              key={`footer-section-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={`${section.title}-link-${linkIdx}`}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 {BRAND.name}. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with care in Kenya 🇰🇪
          </p>
        </div>
      </div>
    </footer>
  );
};
