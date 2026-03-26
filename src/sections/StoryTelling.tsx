import { useRef, useLayoutEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Map, Hammer, Sparkles, Rocket, Target } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

// Large background icons for each step (rendered as watermark)
const BgIcon = ({ index, theme }: { index: number; theme: string }) => {
  const icons = [
    <Search strokeWidth={0.5} />,
    <Map strokeWidth={0.5} />,
    <Hammer strokeWidth={0.5} />,
    <Sparkles strokeWidth={0.5} />,
    <Rocket strokeWidth={0.5} />,
    <Target strokeWidth={0.5} />,
  ];
  const color = theme === 'light' ? 'text-black/[0.04]' : 'text-white/[0.04]';
  return (
    <div className={`process-bg-icon absolute bottom-[10%] right-[8%] w-[220px] h-[220px] md:w-[320px] md:h-[320px] ${color} pointer-events-none`}>
      {icons[index % icons.length]}
    </div>
  );
};

// ============================================================
// ============================================================
// Per-card connector — full-card SVG overlay
// Each phase has a unique narrative line composition
// viewBox 0 0 1000 1000 covers the entire card area
// ============================================================
const CardConnector = ({ index, theme }: { index: number; theme: string }) => {
  const dark = theme === 'dark';

  // 3 weight levels for hierarchy
  const w1 = dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)'; // main trunk
  const w2 = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'; // branches
  const w3 = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; // fine twigs
  const dotStroke = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)';
  const dotFill = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const dotSolid = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

  const shapes: Record<number, ReactNode> = {
    // ──────────────────────────────────────────────────────────
    // PHASE 1 — EXPLORAR
    // Main diagonal from bottom-left rising to upper-right.
    // From it, many branches fork outward — ideas spreading
    // everywhere, filling the card. Organic, expansive.
    // ──────────────────────────────────────────────────────────
    0: (
      <g>
        {/* ── Main diagonal trunk ── */}
        <path className="phase-line" d="M 0 950 L 180 720 L 400 480 L 620 280 L 850 80" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* ── Primary branches (thick) ── */}
        {/* Branch A — forks right-down early, idea spreading low */}
        <path className="phase-line" d="M 180 720 L 340 760 L 520 710" stroke={w2} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Branch B — forks left-up from mid trunk */}
        <path className="phase-line" d="M 400 480 L 260 380 L 140 340" stroke={w2} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Branch C — forks right from upper trunk */}
        <path className="phase-line" d="M 620 280 L 780 320 L 920 280" stroke={w2} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Branch D — forks down-right from upper area */}
        <path className="phase-line" d="M 620 280 L 700 440 L 820 520" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ── Secondary branches (medium) ── */}
        {/* Sub-branch from A — splits further right */}
        <path className="phase-line" d="M 340 760 L 420 850 L 560 880" stroke={w3} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Sub-branch from A — goes up */}
        <path className="phase-line" d="M 520 710 L 580 620 L 640 600" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Sub-branch from B — extends left */}
        <path className="phase-line" d="M 260 380 L 200 280 L 120 220" stroke={w3} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Sub-branch from B — drops down-left */}
        <path className="phase-line" d="M 260 380 L 300 480 L 260 560" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Sub-branch from C — extends up */}
        <path className="phase-line" d="M 780 320 L 820 220 L 880 160" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Sub-branch from D — curves down */}
        <path className="phase-line" d="M 700 440 L 620 520 L 580 620" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Sub-branch from trunk — small exploration left */}
        <path className="phase-line" d="M 180 720 L 80 660 L 40 580" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Tiny twig from upper trunk */}
        <path className="phase-line" d="M 850 80 L 940 40" stroke={w3} strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 850 80 L 900 150" stroke={w3} strokeWidth="0.8" fill="none" strokeLinecap="round" />

        {/* ── Junction markers ── */}
        {/* Main trunk junctions */}
        <circle className="phase-dot" cx="180" cy="720" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="400" cy="480" r="6" stroke={dotStroke} strokeWidth="2" fill={dotFill} />
        <circle className="phase-dot" cx="620" cy="280" r="6" stroke={dotStroke} strokeWidth="2" fill={dotFill} />
        <circle className="phase-dot" cx="850" cy="80" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        {/* Branch endpoints — small solid dots */}
        <circle className="phase-dot" cx="520" cy="710" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="140" cy="340" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="920" cy="280" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="820" cy="520" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="560" cy="880" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="640" cy="600" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="120" cy="220" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="260" cy="560" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="880" cy="160" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="40" cy="580" r="2.5" fill={dotSolid} />
        <circle className="phase-dot" cx="940" cy="40" r="2" fill={dotSolid} />
        <circle className="phase-dot" cx="900" cy="150" r="2" fill={dotSolid} />
      </g>
    ),

    // ──────────────────────────────────────────────────────────
    // PHASE 2 — ESTRUTURAR (placeholder — will redesign later)
    // ──────────────────────────────────────────────────────────
    1: (
      <g>
        <path className="phase-line" d="M 0 800 L 200 800 L 200 500 L 500 500 L 500 250 L 800 250 L 800 100 L 1000 100" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 200 500 L 350 500 L 350 350" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 500 250 L 650 250 L 650 150" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle className="phase-dot" cx="200" cy="500" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="500" cy="250" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="800" cy="100" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="350" cy="350" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="650" cy="150" r="3" fill={dotSolid} />
      </g>
    ),

    // ──────────────────────────────────────────────────────────
    // PHASE 3 — CONSTRUIR (placeholder)
    // ──────────────────────────────────────────────────────────
    2: (
      <g>
        <path className="phase-line" d="M 100 900 L 100 600 L 300 600 L 300 400 L 600 400 L 600 200 L 900 200 L 900 80" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 300 400 L 450 350 L 500 200" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 600 200 L 700 300 L 800 300" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 100 600 L 200 550 L 250 450" stroke={w3} strokeWidth="1" fill="none" strokeLinecap="round" />
        <circle className="phase-dot" cx="100" cy="600" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="300" cy="400" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="600" cy="200" r="6" stroke={dotStroke} strokeWidth="2" fill={dotFill} />
        <circle className="phase-dot" cx="900" cy="80" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="500" cy="200" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="800" cy="300" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="250" cy="450" r="2.5" fill={dotSolid} />
      </g>
    ),

    // ──────────────────────────────────────────────────────────
    // PHASE 4 — REFINAR (placeholder)
    // ──────────────────────────────────────────────────────────
    3: (
      <g>
        <path className="phase-line" d="M 0 500 C 200 500, 250 300, 400 300 C 550 300, 600 500, 800 400 C 900 350, 950 200, 1000 200" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 400 300 L 450 180 L 500 160" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 800 400 L 750 500 L 700 520" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle className="phase-dot" cx="400" cy="300" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="800" cy="400" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="500" cy="160" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="700" cy="520" r="3" fill={dotSolid} />
      </g>
    ),

    // ──────────────────────────────────────────────────────────
    // PHASE 5 (placeholder)
    // ──────────────────────────────────────────────────────────
    4: (
      <g>
        <path className="phase-line" d="M 500 950 L 500 700 L 300 500 L 500 300 L 700 500 L 500 700" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 500 300 L 500 100" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 300 500 L 120 500" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 700 500 L 880 500" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle className="phase-dot" cx="500" cy="700" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="300" cy="500" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="500" cy="300" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="700" cy="500" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="500" cy="100" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="120" cy="500" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="880" cy="500" r="3" fill={dotSolid} />
      </g>
    ),

    // ──────────────────────────────────────────────────────────
    // PHASE 6 (placeholder)
    // ──────────────────────────────────────────────────────────
    5: (
      <g>
        <path className="phase-line" d="M 0 500 C 150 500, 200 350, 350 350 C 500 350, 550 500, 700 450 C 850 400, 900 250, 1000 250" stroke={w1} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 350 350 C 380 250, 420 220, 460 280" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path className="phase-line" d="M 700 450 L 750 550 L 820 580" stroke={w2} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle className="phase-dot" cx="350" cy="350" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="700" cy="450" r="5" stroke={dotStroke} strokeWidth="1.5" fill={dotFill} />
        <circle className="phase-dot" cx="460" cy="280" r="3" fill={dotSolid} />
        <circle className="phase-dot" cx="820" cy="580" r="3" fill={dotSolid} />
      </g>
    ),
  };

  return (
    <div className="phase-connector absolute inset-0 z-[5] pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {shapes[index % 6]}
      </svg>
    </div>
  );
};

export const StoryTelling = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLSpanElement>(null);
  const processoRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introLineRef = useRef<HTMLDivElement>(null);
  const introDotRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  const themes = ['dark', 'light', 'dark', 'light', 'dark', 'light'];

  const storyCards = (t.storytelling?.cards || []).map((card: any, index: number) => ({
    ...card,
    theme: themes[index % themes.length],
  }));

  const cardCount = storyCards.length;
  const desktopTrackWidth = cardCount * 50;
  const mobileTrackWidth = cardCount * 100;

  useLayoutEffect(() => {
    if (!storyCards.length) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ============================================================
      // Initial states
      // ============================================================
      gsap.set('.story-card-content', { opacity: 0, y: 40 });
      gsap.set('.process-bg-icon', { scale: 0.6, opacity: 0 });

      // Intro elements
      if (introLineRef.current) gsap.set(introLineRef.current, { scaleY: 0, transformOrigin: 'top center' });
      if (workflowRef.current) gsap.set(workflowRef.current, { opacity: 0, y: 15 });
      if (processoRef.current) gsap.set(processoRef.current, { opacity: 0, y: 25 });

      // ============================================================
      // Main pinned timeline
      // ============================================================
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4500',
          scrub: 1.2, // slightly laggy for smoothness
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        }
      });

      // ============================================================
      // Phase 1: Intro (0–3.5)
      // Line drops → reaches Processo → dot appears → dot pulses
      // → dot expands into circle mask → reveals content
      // ============================================================

      // Initial dot state
      if (introDotRef.current) {
        gsap.set(introDotRef.current, {
          scale: 0, opacity: 0, transformOrigin: 'center center',
        });
      }

      // 1a. Line drops from top down to "Processo" — FAST
      tl.fromTo(introLineRef.current,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.35, ease: 'power2.out' },
        0
      );

      // 1b. Dot appears at the tip of the line (above Processo)
      tl.to(introDotRef.current, {
        scale: 1, opacity: 1,
        duration: 0.15, ease: 'back.out(3)',
      }, 0.2);

      // 1c. "// workflow" fades in — almost immediate
      tl.fromTo(workflowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        0.25
      );

      // 1d. "Processo" enters below the dot — fast
      tl.fromTo(processoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' },
        0.3
      );

      // 1e. Dot pulses once (scale up slightly then back)
      tl.to(introDotRef.current, {
        scale: 1.6, duration: 0.1, ease: 'power2.out',
      }, 0.55);
      tl.to(introDotRef.current, {
        scale: 1.0, duration: 0.1, ease: 'power2.in',
      }, 0.65);

      // 1f–1h. SIMULTÂNEO: textos saem com letter-spacing + dot expande + máscara abre
      // Tudo começa junto em 0.75 para fluidez máxima

      // Workflow e linha somem
      tl.to([workflowRef.current, introLineRef.current], {
        opacity: 0, duration: 0.2, ease: 'power1.in',
      }, 0.75);

      // "Processo" sai com letter-spacing expandindo
      tl.to(processoRef.current, {
        opacity: 0, y: 15, letterSpacing: '0.5em', scale: 1.15,
        duration: 0.3, ease: 'power1.in',
      }, 0.75);

      // Dot EXPANDE — vira a máscara circular (rápido, junto com saída dos textos)
      tl.to(introDotRef.current, {
        scale: 120, opacity: 0,
        duration: 0.6, ease: 'power2.in',
      }, 0.75);

      // Máscara abre (começa junto, não depois)
      tl.fromTo(maskRef.current,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(150% at 50% 50%)', duration: 1.5, ease: 'power2.inOut' },
        0.75
      );

      // Intro overlay some
      tl.to(introOverlayRef.current, {
        opacity: 0, pointerEvents: 'none',
        duration: 0.3, ease: 'none',
      }, 1.6);

      tl.addLabel('introEnd', 2.0);

      // ============================================================
      // Phase 2: Card content reveal
      // ============================================================
      tl.to('.story-card-content', {
        opacity: 1, y: 0,
        duration: 1, stagger: 0.06, ease: 'power3.out',
      }, 'introEnd-=2');

      // ============================================================
      // Phase 3: Per-card connector line draw
      // Each card's SVG paths draw independently as they come into view
      // Slightly delayed vs scroll for a trailing feel
      // ============================================================
      const phaseLines = gsap.utils.toArray('.phase-line') as SVGPathElement[];
      const phaseDots = gsap.utils.toArray('.phase-dot');

      phaseLines.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(phaseDots, { scale: 0, opacity: 0, transformOrigin: 'center' });

      // Group lines and dots by card (each card has ~3-4 lines and ~2-3 dots)
      const connectors = gsap.utils.toArray('.phase-connector') as Element[];
      
      connectors.forEach((connector, i) => {
        const lines = connector.querySelectorAll('.phase-line');
        const dots = connector.querySelectorAll('.phase-dot');
        
        // First card starts drawing RIGHT AS the mask begins revealing
        // so lines grow together with the circle opening.
        const cardDuration = 6 / cardCount;
        const startPos = i === 0
          ? 0.75   // simultaneous with mask reveal and text exit
          : 2.0 + (i * cardDuration) - 0.2;

        // Main trunk line draws first
        if (lines[0]) {
          tl.to(lines[0], {
            strokeDashoffset: 0,
            duration: i === 0 ? 2.5 : cardDuration * 0.8, // first card gets more time
            ease: 'power1.out',
          }, startPos);
        }

        // Branch lines draw staggered after trunk
        for (let l = 1; l < lines.length; l++) {
          const branchDelay = i === 0 ? 0.15 * l : 0.2 * l;
          tl.to(lines[l], {
            strokeDashoffset: 0,
            duration: i === 0 ? 1.8 : cardDuration * 0.5,
            ease: 'power2.out',
          }, startPos + (i === 0 ? 0.4 : 0) + branchDelay);
        }

        // Dots pop after lines start
        dots.forEach((dot, d) => {
          const dotDelay = i === 0 ? 0.8 + d * 0.12 : 0.3 + d * 0.15;
          tl.to(dot, {
            scale: 1, opacity: 1,
            duration: 0.25,
            ease: 'back.out(2)',
          }, startPos + dotDelay);
        });
      });

      // ============================================================
      // Phase 4: Background icon + card scale
      // ============================================================
      const bgIcons = gsap.utils.toArray('.process-bg-icon');
      const cards = gsap.utils.toArray('.process-card');
      const scrollPerCard = 6 / cardCount;

      gsap.set(cards, { scale: 0.93, transformOrigin: 'center center' });

      // First card
      if (bgIcons[0]) {
        tl.to(bgIcons[0] as Element, {
          scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out',
        }, 'introEnd-=2');
      }
      if (cards[0]) {
        tl.to(cards[0] as Element, {
          scale: 1, duration: 1.5, ease: 'power2.out',
        }, 'introEnd-=2');
      }

      // Subsequent cards
      cards.forEach((card, i) => {
        if (i === 0) return;
        const pos = `introEnd+=${i * scrollPerCard - scrollPerCard * 0.3}`;

        tl.to(cards[i - 1] as Element, {
          scale: 0.93, duration: scrollPerCard * 0.6, ease: 'power2.in',
        }, pos);

        tl.to(card as Element, {
          scale: 1, duration: scrollPerCard * 0.8, ease: 'power2.out',
        }, pos);

        if (bgIcons[i - 1]) {
          tl.to(bgIcons[i - 1] as Element, {
            scale: 0.4, opacity: 0, duration: scrollPerCard * 0.5, ease: 'power2.in',
          }, pos);
        }

        if (bgIcons[i]) {
          tl.to(bgIcons[i] as Element, {
            scale: 1, opacity: 1, duration: scrollPerCard * 0.8, ease: 'power2.out',
          }, pos);
        }
      });

      if (cards.length > 0) {
        tl.to(cards[cards.length - 1] as Element, {
          scale: 0.95, duration: 0.8, ease: 'power2.in',
        }, `introEnd+=${6 - 0.5}`);
      }

      // ============================================================
      // Phase 5: Horizontal scroll
      // Slide 1 fica fixo no centro até a máscara terminar,
      // depois o scroll horizontal começa.
      // ============================================================
      mm.add('(min-width: 768px)', () => {
        // Posiciona o card 1 centralizado
        gsap.set(trackRef.current, { x: '25vw' });
        gsap.set(maskRef.current, { clipPath: 'circle(0% at 50% 50%)' });

        tl.to(trackRef.current, {
          x: `${-(desktopTrackWidth - 75)}vw`,
          ease: 'none', duration: 6,
        }, 'introEnd');
      });

      mm.add('(max-width: 767px)', () => {
        gsap.set(trackRef.current, { x: '0px' });
        gsap.set(maskRef.current, { clipPath: 'circle(0% at 50% 50%)' });

        tl.to(trackRef.current, {
          x: `${-(mobileTrackWidth - 100)}vw`,
          ease: 'none', duration: 6,
        }, 'introEnd');
      });

    }, containerRef);

    return () => ctx.revert();
  }, [storyCards]);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden z-40"
    >
      {/* ============================================================ */}
      {/* Intro overlay                                                */}
      {/* ============================================================ */}
      <div
        ref={introOverlayRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-50"
      >
        {/* Vertical line — from top edge down through text to the dot */}
        <div
          ref={introLineRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-white/40"
          style={{ height: 'calc(50% + 80px)' }}
        />

        {/* Text group — centered */}
        <div className="flex flex-col items-center gap-2">
          <span
            ref={workflowRef}
            className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#555]"
          >
            &#47;&#47; workflow
          </span>
          <h2
            ref={processoRef}
            className="text-6xl md:text-9xl font-bold text-white whitespace-nowrap tracking-tighter"
          >
            {t.storytelling?.processTitle || 'Processo'}
          </h2>
        </div>

        {/* Dot marker — centered below "Processo", then expands into mask */}
        <div
          ref={introDotRef}
          className="mt-6 z-10"
        >
          <div className="w-5 h-5 rounded-full border border-white/40 bg-white/5 relative">
            <div className="absolute inset-[4px] rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Mask wrapper                                                 */}
      {/* ============================================================ */}
      <div
        ref={maskRef}
        className="w-full h-full absolute inset-0 z-10"
        style={{ clipPath: 'circle(0px at 50% 50%)' }}
      >
        <div
          ref={trackRef}
          className="h-full flex flex-row relative"
          style={{ width: `${mobileTrackWidth}vw` }}
        >
          {/* Cards with per-card connectors */}
          {storyCards.map((card: any, index: number) => (
            <div
              key={index}
              className={`process-card w-screen md:w-[50vw] h-full flex flex-col justify-center relative shrink-0 ${
                card.theme === 'light'
                  ? 'bg-[#ededed] text-[#1a1a1a]'
                  : 'bg-[#111] text-white'
              }`}
            >
              {/* Side border */}
              <div className={`absolute right-0 top-[15%] bottom-[15%] w-[1px] ${
                card.theme === 'light' ? 'bg-black/[0.06]' : 'bg-white/[0.06]'
              }`} />

              {/* Background icon */}
              <BgIcon index={index} theme={card.theme} />

              {/* Per-card connector — full-card narrative lines */}
              <CardConnector
                index={index}
                theme={card.theme}
              />

              <div className="flex flex-col gap-4 md:gap-6 max-w-2xl p-10 md:p-20 story-card-content relative z-10">
                {/* Index number */}
                <span className={`text-6xl md:text-8xl font-extralight font-mono tracking-tighter leading-none ${
                  card.theme === 'light' ? 'text-black/[0.07]' : 'text-white/[0.07]'
                }`}>
                  {card.id}
                </span>

                {/* Title */}
                <h3 className="text-4xl md:text-7xl font-bold tracking-tight leading-[0.9]">
                  {card.title}
                </h3>

                {/* Description */}
                <p className={`text-base md:text-lg mt-2 max-w-md leading-relaxed font-light ${
                  card.theme === 'light' ? 'text-[#555]' : 'text-[#888]'
                }`}>
                  {card.description}
                </p>

                {/* Bottom accent */}
                <div className={`mt-3 w-12 h-[1.5px] rounded-full ${
                  card.theme === 'light' ? 'bg-black/12' : 'bg-white/12'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
