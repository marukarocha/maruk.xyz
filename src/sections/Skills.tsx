import { useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus, ArrowUpRight, Code2, Box, Cpu, Palette } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { useProjectModal } from '../hooks/useProjectModal';
import Earth3D from '../components/Earth3D';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// TechLines — SVG circuit lines that grow with scroll
// Animated with GSAP drawSVG-style (strokeDashoffset)
// ============================================================
const TechLines = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll('.tech-path');
    const dots = svgRef.current.querySelectorAll('.tech-dot');
    const nodeCircles = svgRef.current.querySelectorAll('.tech-node');

    // Set initial state: lines hidden via strokeDashoffset
    paths.forEach((path) => {
      const el = path as SVGPathElement;
      const len = el.getTotalLength();
      gsap.set(el, {
        strokeDasharray: len,
        strokeDashoffset: len,
        opacity: 1,
      });
    });

    gsap.set(dots, { scale: 0, transformOrigin: 'center' });
    gsap.set(nodeCircles, { scale: 0, transformOrigin: 'center', opacity: 0 });

    const ctx = gsap.context(() => {
      // Draw lines as user scrolls through the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.5,
        }
      });

      // Stagger line drawing
      paths.forEach((path, i) => {
        const el = path as SVGPathElement;
        tl.to(el, {
          strokeDashoffset: 0,
          duration: 3,
          ease: 'none',
        }, i * 0.5);
      });

      // Pulse dots at intersections
      tl.to(dots, {
        scale: 1,
        duration: 0.5,
        stagger: 0.3,
        ease: 'back.out(3)',
      }, 1);

      // Node circles appear
      tl.to(nodeCircles, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.4,
        ease: 'elastic.out(1, 0.5)',
      }, 1.5);

    });

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main horizontal circuit line — runs across top area */}
      <path
        className="tech-path"
        d="M -20 120 L 300 120 L 340 160 L 700 160 L 740 120 L 1460 120"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
        opacity="0"
      />
      {/* Vertical branch left */}
      <path
        className="tech-path"
        d="M 300 120 L 300 400 L 340 440 L 340 700"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
        opacity="0"
      />
      {/* Diagonal crossing */}
      <path
        className="tech-path"
        d="M 700 160 L 900 360 L 900 600 L 860 640 L 860 800"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth="1"
        opacity="0"
      />
      {/* Bottom horizontal */}
      <path
        className="tech-path"
        d="M -20 780 L 200 780 L 240 740 L 600 740 L 640 780 L 1460 780"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
        opacity="0"
      />
      {/* Right vertical */}
      <path
        className="tech-path"
        d="M 1100 0 L 1100 300 L 1060 340 L 1060 560 L 1100 600 L 1100 900"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="1"
        opacity="0"
      />

      {/* Junction dots */}
      <circle className="tech-dot" cx="300" cy="120" r="3" fill="rgba(0,0,0,0.15)" />
      <circle className="tech-dot" cx="700" cy="160" r="3" fill="rgba(0,0,0,0.15)" />
      <circle className="tech-dot" cx="340" cy="440" r="3" fill="rgba(0,0,0,0.12)" />
      <circle className="tech-dot" cx="900" cy="360" r="3" fill="rgba(0,0,0,0.12)" />
      <circle className="tech-dot" cx="240" cy="740" r="2.5" fill="rgba(0,0,0,0.12)" />
      <circle className="tech-dot" cx="640" cy="780" r="2.5" fill="rgba(0,0,0,0.12)" />
      <circle className="tech-dot" cx="1100" cy="340" r="3" fill="rgba(0,0,0,0.10)" />

      {/* Node circles — larger intersection markers */}
      <circle className="tech-node" cx="340" cy="160" r="8" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
      <circle className="tech-node" cx="900" cy="600" r="8" stroke="rgba(0,0,0,0.08)" strokeWidth="1" fill="none" />
      <circle className="tech-node" cx="1060" cy="560" r="6" stroke="rgba(0,0,0,0.08)" strokeWidth="1" fill="none" />
      <circle className="tech-node" cx="600" cy="740" r="6" stroke="rgba(0,0,0,0.08)" strokeWidth="1" fill="none" />
    </svg>
  );
};

// Category icons mapping
const categoryIcons = [
  <Code2 size={20} strokeWidth={1.5} />,
  <Box size={20} strokeWidth={1.5} />,
  <Cpu size={20} strokeWidth={1.5} />,
  <Palette size={20} strokeWidth={1.5} />,
];

interface SkillCategory {
  title: string;
  description: string;
  skills: string[];
  featuredProject?: {
    id: string;
    label: string;
  };
}

export const Skills = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { openProject } = useProjectModal();

  const { t } = useLanguage();

  const skillCategories: SkillCategory[] = [
    {
      title: t.skills.categories.frontend,
      description: t.skills.categories.frontendDesc,
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
      featuredProject: {
        id: 'motodiario',
        label: 'View Featured Case: Moto Diário'
      }
    },
    {
      title: t.skills.categories.ai,
      description: t.skills.categories.aiDesc,
      skills: ['Three.js', 'GSAP', 'ScrollTrigger', 'GLTF Pipelines', 'Spatial UI'],
      featuredProject: {
        id: 'pdv-showcase',
        label: 'Abrir espaço visual'
      }
    },
    {
      title: t.skills.categories.motion,
      description: t.skills.categories.motionDesc,
      skills: ['GSAP', 'Framer Motion', 'CSS Animations', 'WebGL', 'Interactive Design'],
      featuredProject: {
        id: 'motion-portfolio',
        label: 'Abrir espaço motion'
      }
    },
    {
      title: t.skills.categories.design,
      description: t.skills.categories.designDesc,
      skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping']
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCategoryClick = (category: SkillCategory, index: number) => {
    if (category.featuredProject?.id) {
      openProject(category.featuredProject.id);
      return;
    }

    toggleAccordion(index);
  };

  // ============================================================
  // GSAP scroll animations — entrance, items stagger, exit
  // ============================================================
  useLayoutEffect(() => {
    if (!containerRef.current || !listRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = listRef.current!.querySelectorAll('.skill-item');
      const lines = listRef.current!.querySelectorAll('.skill-line');
      const header = headerRef.current;

      // --- Header entrance ---
      if (header) {
        gsap.fromTo(header,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // --- Items stagger entrance ---
      gsap.fromTo(items,
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // --- Line drawing animation ---
      gsap.fromTo(lines,
        { scaleX: 0, transformOrigin: 'left' },
        {
          scaleX: 1,
          duration: 1.5,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // --- Section exit (fade out as leaving viewport) ---
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -40,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 30%',
          end: 'bottom top',
          scrub: 1,
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section-padding bg-[#ededed] dark:bg-[#0a0a0a] relative overflow-hidden py-40 min-h-screen flex flex-col justify-center transition-colors duration-500 z-30"
    >
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="sticky top-0 h-screen w-full">
          <Earth3D />
        </div>
      </div>

      
      {/* Dynamic Tech Lines — SVG circuit animation */}
      <TechLines />

      <div ref={containerRef} className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div ref={headerRef} className="mb-28">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#999] mb-4 block">
                &#47;&#47; capabilities
              </span>
              <h2 className="text-4xl md:text-7xl font-normal text-[#1a1a1a] dark:text-[#ededed] tracking-tight max-w-2xl leading-[1.05]">
                {t.skills.title} <span className="text-[#999] animate-cursor-blink">_</span>
              </h2>
            </div>
            <div className="text-base md:text-lg font-mono text-[#888] uppercase tracking-widest mb-2 max-w-sm text-right leading-relaxed">
              {t.skills.description}
            </div>
          </div>
        </div>

        {/* List Layout */}
        <div ref={listRef} className="flex flex-col">
          {/* Top Line */}
          <div className="skill-line w-full h-[1px] bg-[#ccc] dark:bg-[#333] mb-0" />

          {skillCategories.map((category, idx) => (
            <div key={idx} className={`skill-item group bg-transparent transition-all duration-500 relative ${openIndex === idx ? 'my-4' : ''}`}>
              
              {/* Full Width Background Hover/Active Effect */}
              <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 transition-all duration-500 ${
                  openIndex === idx 
                    ? 'bg-[#1a1a1a] dark:bg-[#111]' 
                    : 'group-hover:bg-[#1a1a1a] dark:group-hover:bg-[#111] opacity-0 group-hover:opacity-100'
                }`} 
              />

              <div 
                onClick={() => handleCategoryClick(category, idx)}
                className="py-10 md:py-12 flex items-center justify-between gap-6 transition-all duration-300 px-4 -mx-4 rounded-sm cursor-pointer relative z-20"
              >
                
                {/* Left: Index + Icon + Title */}
                <div className="flex items-center gap-5 md:gap-8 w-full">
                  {/* Index number */}
                  <span className={`text-xs font-mono tracking-wider transition-colors duration-300 min-w-[28px] ${
                    openIndex === idx ? 'text-[#666]' : 'text-[#aaa] dark:text-[#555] group-hover:text-[#666]'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Category Icon */}
                  <div className={`p-2.5 rounded-lg border transition-all duration-300 ${
                    openIndex === idx 
                      ? 'border-[#444] text-[#ededed] bg-white/5' 
                      : 'border-[#ddd] dark:border-[#333] text-[#888] dark:text-[#555] group-hover:border-[#444] group-hover:text-[#ededed] group-hover:bg-white/5'
                  }`}>
                    {categoryIcons[idx]}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl md:text-5xl font-light uppercase tracking-tight transition-colors duration-300 ${
                    openIndex === idx ? 'text-[#ededed]' : 'text-[#1a1a1a] dark:text-[#ededed] group-hover:text-[#ededed]'
                  }`}>
                    {category.title}
                  </h3>
                </div>

                {/* Right: Action Icon */}
                <div className={`transition-all duration-300 shrink-0 ${
                  openIndex === idx ? 'rotate-180 text-[#ededed]' : 'text-[#aaa] dark:text-[#555] group-hover:rotate-90 group-hover:text-[#ededed]'
                }`}>
                  {openIndex === idx ? <Minus size={22} strokeWidth={1.5} /> : <Plus size={22} strokeWidth={1.5} />}
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence mode="wait">
                {openIndex === idx && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden px-4 -mx-4 mb-4 rounded-b-sm relative z-20"
                  >
                    <div className="pb-12 pt-4 border-t border-[#333]/50 border-dashed">
                      <div className="grid md:grid-cols-2 gap-10">
                        {/* Left: Description + CTA */}
                        <div className="pl-[60px] md:pl-[76px]">
                          <p className="text-[#999] text-base md:text-lg leading-relaxed font-light mb-8">
                            {category.description}
                          </p>
                          
                          {category.featuredProject && (
                            <button 
                              onClick={() => openProject(category.featuredProject!.id)}
                              className="group/btn flex items-center gap-3 relative px-6 py-3 rounded-full transition-all duration-300 transform"
                            >
                              <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover/btn:bg-white/10 group-hover/btn:border-white/20 transition-colors rounded-full" />
                              <span className="relative z-10 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 w-2 h-2 rounded-full animate-pulse" />
                                <span className="uppercase tracking-widest text-xs font-bold text-white">{category.featuredProject.label}</span>
                                <ArrowUpRight size={14} className="text-white/50 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Right: Skills Tags */}
                        <div className="flex flex-wrap gap-2 content-start justify-end items-start">
                          {category.skills.map((skill, sIdx) => (
                            <span 
                              key={sIdx} 
                              className="px-4 py-2 bg-white/10 text-[#ededed] rounded-full text-sm font-medium border border-white/10 hover:border-white/25 hover:bg-white/15 transition-all duration-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Divider Line */}
              <div className="skill-line w-full h-[1px] bg-[#ccc] dark:bg-[#333]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
