'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useClerk, useUser } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { NAV_LINKS, BRAND } from '@/lib/constants';
import { PremiumButton } from './PremiumButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';


export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord' | 'hotel' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const mx = useMotionValue(0.5);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    const onMove = (e: MouseEvent) => {
      mx.set(Math.min(1, Math.max(0, e.clientX / window.innerWidth)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, [mx]);

  useEffect(() => {
    if (!isLoaded || !user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

const fetchRoles = async () => {
      try {
        // Admin tab should be driven by the same source of truth as the server:
        // ADMIN_CLERK_IDS -> /api/admin/status
        const adminRes = await fetch('/api/admin/status');
        if (adminRes.ok) {
          try {
            const adminData = await adminRes.json();
            setIsAdmin(Boolean(adminData.isAdmin));
          } catch {
            setIsAdmin(false);
          }
        }

        // Dashboard link (tenant vs landlord) still uses DB role.
        const res = await fetch('/api/users');
        if (res.ok) {
          try {
            const data = await res.json();
            setUserRole(data.role);
          } catch {
            setUserRole('tenant');
          }
        } else {
          setUserRole('tenant');
        }
      } catch {
        setUserRole('tenant');
        setIsAdmin(false);
      }
    };

    fetchRoles();
  }, [isLoaded, user]);


  const isLandlord = userRole === 'landlord';
  const isHotel = userRole === 'hotel';
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accentH = useTransform(mx, [0, 1], [185, 220]);
  const accent = useTransform(accentH, (h) => `hsl(${h}, 88%, 58%)`);

  const baseBg = isScrolled
    ? 'rgba(4,8,18,0.78)'
    : 'rgba(4,8,18,0.22)';

  return (
    <motion.nav
      role="navigation"
      aria-label="Primary navigation"
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 130, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-[100]"
    >
      <div
        className="absolute inset-0 -z-10 rounded-b-2xl transition-all duration-500"
        style={{
          background: baseBg,
          backdropFilter: isScrolled ? 'blur(28px) saturate(200%)' : 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: isScrolled ? 'blur(28px) saturate(200%)' : 'blur(12px) saturate(160%)',
          borderBottom: `1px solid ${
            isScrolled ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.04)'
          }`,
          boxShadow: isScrolled
            ? '0 20px 60px -12px rgba(0,0,0,0.8), 0 4px 20px -8px rgba(34,211,238,0.06)'
            : '0 -8px 32px -8px rgba(0,0,0,0.5)',
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-[1px] h-px"
        style={{
          background: `linear-gradient(90deg,
            transparent  0%,
            ${(accent as any) as string} 40%,
            rgba(16,185,129,0.6) 60%,
            transparent 100%
          )`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5">
        <div className="flex items-center justify-between">
<Link href="/" className="group flex items-center no-underline">
            <div className="flex items-center gap-2">
              <img
                src="/1.png"
                alt="Dwell KE Logo"
                className="h-8 w-8 md:h-9 md:w-9 object-contain"
              />
              <span className="text-[13px] font-semibold tracking-wide text-white/90">Dwell KE</span>
            </div>

          </Link>

          {isMobile ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-cyan-400/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="pt-2 flex flex-col gap-3">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 rounded-xl border border-white/5 hover:border-cyan-400/20 hover:bg-cyan-400/5 transition-colors text-sm text-gray-200"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="h-px bg-white/10 my-2" />

                  <div className="flex flex-col gap-2">
                    {isLoaded && user ? (
                      <>
{isAdmin && (
                          <Link href="/admin" onClick={() => setMobileOpen(false)}>
                            <PremiumButton variant="ghost" size="sm" className="w-full justify-center">
                              Admin
                            </PremiumButton>
                          </Link>
                        )}

<Link
                           href={isLandlord ? '/dashboard/landlord' : isHotel ? '/dashboard/hotel' : '/dashboard/tenant'}
                           onClick={() => setMobileOpen(false)}
                         >
                           <PremiumButton variant="ghost" size="sm" className="w-full justify-center">
                             Dashboard
                           </PremiumButton>
                         </Link>

                        <button
                          onClick={() => {
                            signOut();
                            setMobileOpen(false);
                          }}
                          className="px-4 py-2 w-full text-[11px] uppercase tracking-[0.18em] font-mono
                                     text-gray-500/70 hover:text-cyan-300/90 no-underline
                                     border border-transparent hover:border-cyan-400/15 rounded-lg
                                     transition-all duration-300"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                          <PremiumButton variant="ghost" size="sm" className="w-full justify-center">
                            Sign In
                          </PremiumButton>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                          <PremiumButton
                            variant="solid"
                            size="sm"
                            className="w-full justify-center bg-gradient-to-r from-cyan-500/90 to-blue-500/90"
                          >
                            Get Started
                          </PremiumButton>
                        </Link>

                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="hidden md:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[11px] uppercase tracking-[0.22em] font-mono text-gray-400/80 hover:text-cyan-300 no-underline py-1 transition-colors duration-250"
                >
                  <span className="transition-colors duration-250">{link.label}</span>
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-px bg-cyan-400/60"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                </Link>
              ))}
            </div>
          )}

          {/* Right-side auth/dashboard actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle />

            {isLoaded && user ? (
              <>
{isAdmin && (
                   <Link href="/admin">
                     <PremiumButton variant="ghost" size="sm">
                       Admin
                     </PremiumButton>
                   </Link>
                 )}
<Link href={isLandlord ? '/dashboard/landlord' : isHotel ? '/dashboard/hotel' : '/dashboard/tenant'}>
                   <PremiumButton variant="ghost" size="sm">
                     Dashboard
                   </PremiumButton>
                 </Link>
                <button
                  onClick={() => signOut()}
                  className="
                    px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-mono
                    text-gray-500/70 hover:text-cyan-300/90 no-underline
                    border border-transparent hover:border-cyan-400/15 rounded-lg
                    transition-all duration-300
                  "
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <PremiumButton variant="ghost" size="sm">
                    Sign In
                  </PremiumButton>
                </Link>
                <Link href="/auth/signup">
                  <PremiumButton
                    variant="solid"
                    size="sm"
                    className="
                    bg-gradient-to-r from-cyan-500/90 to-blue-500/90
                    hover:from-cyan-400/90 hover:to-blue-400/90
                    shadow-[0_0_18px_-4px_rgba(34,211,238,0.45)]
                  "
                  >
                    Get Started
                  </PremiumButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

