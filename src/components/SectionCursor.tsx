import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// ============================================================
// SectionCursor — reusable custom cursor component per section
// 
// Uses GSAP for smooth shape, size and color transitions.
// Cursor follows mouse with lerp, auto-detects interactive 
// elements and morphs on hover.
// 'contrast' preset auto-detects background brightness and 
// flips between dark/light cursor colors.
//
// Usage:
//   <SectionCursor sectionId="about" preset="hologram" />
//   <SectionCursor sectionId="skills" preset="contrast" />
//   <SectionCursor sectionId="contact" preset="glow" />
// ============================================================

export type CursorPreset = 'hologram' | 'dark' | 'contrast' | 'glow' | 'none';

interface SectionCursorProps {
  sectionId: string;
  preset?: CursorPreset;
  color?: string;
  hoverColor?: string;
  size?: number;
  hoverSize?: number;
}

// Preset configurations
const presets: Record<CursorPreset, {
  color: string;
  hoverColor: string;
  size: number;
  hoverSize: number;
  dotSize: number;
  hoverDotSize: number;
  hoverBorderRadius: string;
  glowIntensity: number;
}> = {
  hologram: {
    color: '#00ffcc',
    hoverColor: '#ffaa00',
    size: 32,
    hoverSize: 48,
    dotSize: 8,
    hoverDotSize: 12,
    hoverBorderRadius: '50%',
    glowIntensity: 1,
  },
  dark: {
    color: '#333333',
    hoverColor: '#111111',
    size: 36,
    hoverSize: 56,
    dotSize: 8,
    hoverDotSize: 5,
    hoverBorderRadius: '20%',
    glowIntensity: 0,
  },
  contrast: {
    color: '#1a1a1a',         // dark by default (for light bgs)
    hoverColor: '#000000',
    size: 38,                 // bigger initial size
    hoverSize: 56,
    dotSize: 10,              // bigger dot
    hoverDotSize: 6,
    hoverBorderRadius: '30%',
    glowIntensity: 0,
  },
  glow: {
    color: '#00ffcc',
    hoverColor: '#ffffff',
    size: 28,
    hoverSize: 44,
    dotSize: 7,
    hoverDotSize: 10,
    hoverBorderRadius: '50%',
    glowIntensity: 1,
  },
  none: {
    color: 'transparent',
    hoverColor: 'transparent',
    size: 0,
    hoverSize: 0,
    dotSize: 0,
    hoverDotSize: 0,
    hoverBorderRadius: '50%',
    glowIntensity: 0,
  },
};

// Utility: get luminance of an rgb color to decide if bg is dark or light
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get background color under the cursor by checking ALL stacked elements
// Uses elementsFromPoint to catch positioned bg divs (even at -z-10)
function getBackgroundColorAtPoint(x: number, y: number): { r: number; g: number; b: number } | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    const htmlEl = el as HTMLElement;
    // Skip our own cursor elements
    if (htmlEl.hasAttribute('data-cursor-el')) continue;
    const bg = getComputedStyle(htmlEl).backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = +match[1], g = +match[2], b = +match[3];
        // Skip pure black (common on overlays/body)
        if (r === 0 && g === 0 && b === 0) continue;
        return { r, g, b };
      }
    }
  }
  return null;
}

export const SectionCursor = ({
  sectionId,
  preset = 'hologram',
  color,
  hoverColor,
  size,
  hoverSize,
}: SectionCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isInsideRef = useRef(false);
  const isHoveringRef = useRef(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const config = presets[preset];
  const cursorColor = color || config.color;
  const cursorHoverColor = hoverColor || config.hoverColor;
  const cursorSize = size || config.size;
  const cursorHoverSize = hoverSize || config.hoverSize;

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section || !cursorRef.current || !ringRef.current) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    const glow = config.glowIntensity;
    const isContrast = preset === 'contrast';

    // Track current contrast state
    let isDarkBg = false;
    const contrastColors = {
      light: { color: '#1a1a1a', hoverColor: '#000000' },   // cursor on light bg
      dark:  { color: '#e0e0e0', hoverColor: '#ffffff' },    // cursor on dark bg
    };
    let activeColor = cursorColor;
    let activeHoverColor = cursorHoverColor;

    // Hide default cursor on the section
    section.style.cursor = 'none';
    const styleTag = document.createElement('style');
    styleTag.textContent = `#${sectionId} * { cursor: none !important; }`;
    document.head.appendChild(styleTag);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Contrast detection: sample bg color under cursor using stacking order
      if (isContrast && !isHoveringRef.current) {
        const bgColor = getBackgroundColorAtPoint(e.clientX, e.clientY);
        if (bgColor) {
          const lum = getLuminance(bgColor.r, bgColor.g, bgColor.b);
          const nowDark = lum < 0.2;
          if (nowDark !== isDarkBg) {
            isDarkBg = nowDark;
            const colors = nowDark ? contrastColors.dark : contrastColors.light;
            activeColor = colors.color;
            activeHoverColor = colors.hoverColor;
            // GSAP smooth color transition
            gsap.to(cursor, {
              background: colors.color,
              duration: 0.4,
              ease: 'power2.out',
            });
            gsap.to(ring, {
              borderColor: colors.color,
              duration: 0.4,
              ease: 'power2.out',
            });
          }
        }
      }
    };

    const onMouseEnter = () => {
      isInsideRef.current = true;
      gsap.to([cursor, ring], { opacity: 1, duration: 0.3, ease: 'power2.out' });
    };

    const onMouseLeave = () => {
      isInsideRef.current = false;
      gsap.to([cursor, ring], { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    // GSAP-powered hover transitions
    const onPointerOverInteractive = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.closest('a, button, [role="button"], canvas, [data-cursor-hover]') !== null;
      
      if (isInteractive && !isHoveringRef.current) {
        isHoveringRef.current = true;

        const hColor = isContrast ? activeHoverColor : cursorHoverColor;

        // Dot: shrink or grow + color shift
        gsap.to(cursor, {
          width: config.hoverDotSize,
          height: config.hoverDotSize,
          background: hColor,
          boxShadow: glow 
            ? `0 0 ${cursorHoverSize * 0.5}px ${hColor}60, 0 0 ${cursorHoverSize}px ${hColor}20`
            : 'none',
          duration: 0.4,
          ease: 'power3.out',
        });

        // Ring: expand + morph shape + color shift
        gsap.to(ring, {
          width: cursorHoverSize,
          height: cursorHoverSize,
          borderColor: hColor,
          borderWidth: '1.5px',
          borderRadius: config.hoverBorderRadius,
          duration: 0.5,
          ease: 'elastic.out(1, 0.6)',
        });
      }
    };

    const onPointerOutInteractive = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.closest('a, button, [role="button"], canvas, [data-cursor-hover]') !== null;
        
      if (isInteractive) {
        isHoveringRef.current = false;

        const nColor = isContrast ? activeColor : cursorColor;

        // Reset dot
        gsap.to(cursor, {
          width: config.dotSize,
          height: config.dotSize,
          background: nColor,
          boxShadow: glow
            ? `0 0 ${cursorSize * 0.4}px ${nColor}50, 0 0 ${cursorSize * 0.8}px ${nColor}15`
            : 'none',
          duration: 0.4,
          ease: 'power3.out',
        });

        // Reset ring
        gsap.to(ring, {
          width: cursorSize,
          height: cursorSize,
          borderColor: nColor,
          borderWidth: '1px',
          borderRadius: '50%',
          duration: 0.5,
          ease: 'elastic.out(1, 0.6)',
        });
      }
    };

    // Smooth animation loop (lerp follow)
    const animate = () => {
      const lerp = 0.15;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

      const x = currentPos.current.x;
      const y = currentPos.current.y;

      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    // Bind events
    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseenter', onMouseEnter);
    section.addEventListener('mouseleave', onMouseLeave);
    section.addEventListener('pointerover', onPointerOverInteractive);
    section.addEventListener('pointerout', onPointerOutInteractive);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      section.style.cursor = '';
      styleTag.remove();
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseenter', onMouseEnter);
      section.removeEventListener('mouseleave', onMouseLeave);
      section.removeEventListener('pointerover', onPointerOverInteractive);
      section.removeEventListener('pointerout', onPointerOutInteractive);
      cancelAnimationFrame(rafRef.current);
    };
  }, [sectionId, cursorColor, cursorHoverColor, cursorSize, cursorHoverSize, config]);

  if (preset === 'none') return null;

  const glow = config.glowIntensity;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={cursorRef}
        data-cursor-el
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full opacity-0"
        style={{
          width: `${config.dotSize}px`,
          height: `${config.dotSize}px`,
          background: cursorColor,
          boxShadow: glow
            ? `0 0 ${cursorSize * 0.4}px ${cursorColor}50, 0 0 ${cursorSize * 0.8}px ${cursorColor}15`
            : 'none',
          willChange: 'transform',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        data-cursor-el
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border opacity-0"
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          borderColor: cursorColor,
          borderWidth: '1px',
          willChange: 'transform',
        }}
      />
    </>
  );
};
