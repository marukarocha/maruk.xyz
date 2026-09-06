import type { ReactNode } from 'react';
import { HeroBackgroundDarkLiquid } from '../../components/HeroBackgroundDarkLiquid';
import { Navigation } from '../../components/Navigation';

interface HeroShellProps {
  children: ReactNode;
}

/**
 * Shared wrapper for all Hero variants.
 * Provides: section#home, Navigation, 3D liquid background and vignette overlay.
 */
export const HeroShell = ({ children }: HeroShellProps) => (
  <section
    id="home"
    className="min-h-[92svh] flex items-center justify-center relative overflow-hidden bg-transparent"
  >
    <Navigation />
    <HeroBackgroundDarkLiquid />
    {/* Radial vignette */}
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0a_100%)] opacity-60" />
    {children}
  </section>
);
