import type { ComponentType } from 'react';
import { HeroClassic }  from './variants/HeroClassic';
import { HeroStagger }  from './variants/HeroStagger';
import { HeroSplit }    from './variants/HeroSplit';
import { HeroTerminal } from './variants/HeroTerminal';

/**
 * All available Hero variants.
 * Add or remove entries here to control the rotation pool.
 */
const VARIANTS: ComponentType[] = [
  HeroClassic,
  HeroStagger,
  HeroSplit,
  HeroTerminal,
];

/**
 * Pick once at module load time — stable for the whole page session,
 * changes on every hard refresh / new tab.
 */
const picked = Math.floor(Math.random() * VARIANTS.length);

export const Hero = () => {
  const Variant = VARIANTS[picked];
  return <Variant />;
};
