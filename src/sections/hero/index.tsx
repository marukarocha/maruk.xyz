import type { ComponentType } from 'react';
import { HeroClassic }  from './variants/HeroClassic';

/**
 * All available Hero variants.
 * Add or remove entries here to control the rotation pool.
 */
const VARIANTS: ComponentType[] = [
  HeroClassic,
];

/**
 * Keep the first impression consistent. The experimental variants still live
 * in this folder, but the public homepage should not change on refresh.
 */
const picked = 0;

export const Hero = () => {
  const Variant = VARIANTS[picked];
  return <Variant />;
};
