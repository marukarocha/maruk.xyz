import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useProjectModal } from '../hooks/useProjectModal';
import Earth3D from '../components/Earth3D';

gsap.registerPlugin(ScrollTrigger);

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
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { openProject, selectedProject } = useProjectModal();

  const { t } = useLanguage();

  const skillCategories: SkillCategory[] = [
    {
      title: t.skills.categories.frontend,
      description: t.skills.categories.frontendDesc,
      skills: ['React', 'Next.js', 'Typescript', 'Node.js', 'PostgreSQL', 'SaaS'],
      featuredProject: {
        id: 'motodiario',
        label: 'View Featured Case: Moto Diário'
      }
    },
    {
      title: t.skills.categories.three3d,
      description: t.skills.categories.three3dDesc,
      skills: ['WordPress', 'WooCommerce', 'Shopify', 'SEO', 'Performance']
    },
    {
      title: t.skills.categories.ai,
      description: t.skills.categories.aiDesc,
      skills: ['Figma', 'UI/UX', 'Three.js', 'R3F', 'Blender', 'Motion']
    },
    {
      title: t.skills.categories.design,
      description: t.skills.categories.designDesc,
      skills: ['APIs', 'Firebase', 'Supabase', 'Stripe', 'OpenAI API']
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    if (!containerRef.current || !listRef.current) return;

    const items = listRef.current.querySelectorAll('.skill-item');
    
    gsap.fromTo(items, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.25, // Stagger aumentado
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Line drawing animation
    const lines = listRef.current.querySelectorAll('.skill-line');
    gsap.fromTo(lines,
      { scaleX: 0, transformOrigin: "left" },
      {
        scaleX: 1,
        duration: 1.5,
        stagger: 0.25,
        ease: "expo.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, []);

  return (
    <section id="skills" className="section-padding bg-[#ededed] dark:bg-[#0a0a0a] relative overflow-hidden py-32 min-h-screen flex flex-col justify-center transition-colors duration-500 z-30">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="sticky top-0 h-screen w-full">
         <Earth3D />
        </div>
      </div>

      <div ref={containerRef} className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <h2 className="text-4xl md:text-6xl font-normal text-[#1a1a1a] dark:text-[#ededed] tracking-tight max-w-2xl leading-tight">
              {t.skills.title} <span className="text-primary-500 animate-cursor-blink">_</span>
            </h2>
            <div className="text-lg md:text-xl font-mono text-[#666] uppercase tracking-widest mb-2 max-w-sm text-right leading-relaxed font-medium">
              {t.skills.description}
            </div>
          </motion.div>
        </div>

        {/* List Layout */}
        <div ref={listRef} className="flex flex-col">
          {/* Top Line */}
          <div className="skill-line w-full h-[1px] bg-[#333] dark:bg-[#333] mb-0" />

          {skillCategories.map((category, idx) => (
            <div key={idx} className={`skill-item group bg-transparent transition-all duration-500 relative ${openIndex === idx ? 'my-4' : ''}`}>
              
              {/* Full Width Background Hover/Active Effect */}
              <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 transition-colors duration-500 ${
                  openIndex === idx 
                    ? 'bg-[#1a1a1a] dark:bg-[#111]' 
                    : 'group-hover:bg-[#1a1a1a] dark:group-hover:bg-[#111] opacity-0 group-hover:opacity-100'
                }`} 
              />

              <div 
                onClick={() => toggleAccordion(idx)}
                className={`py-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 px-4 -mx-4 rounded-sm cursor-pointer relative z-20`}
              >
                
                {/* Title */}
                <h3 className={`text-3xl md:text-5xl font-light uppercase tracking-tight w-full transition-colors duration-300 ${
                  openIndex === idx ? 'text-[#ededed]' : 'text-[#1a1a1a] dark:text-[#ededed] group-hover:text-[#ededed]'
                }`}>
                  {category.title}
                </h3>

                {/* Right Side: Description Preview or Action */}
                <div className="flex items-center gap-8">
                  {/* Icon */}
                  <div className={`transition-all duration-300 ${
                    openIndex === idx ? 'rotate-180 text-[#ededed]' : 'text-black dark:text-[#555] group-hover:rotate-90 group-hover:text-[#ededed]'
                  }`}>
                    {openIndex === idx ? <Minus size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence mode="wait">
                {openIndex === idx && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden px-4 -mx-4 mb-4 rounded-b-sm relative z-20"
                  >
                    <div className="pb-12 pt-2 border-t border-[#333] border-dashed">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[#888] dark:text-[#ccc] text-lg leading-relaxed font-light mb-6">
                            {category.description}
                          </p>
                          
                          {category.featuredProject && (
                            <button 
                              onClick={() => {
                                // Add small class or state to trigger local animation before opening? 
                                // Actually, openProject is fast. We rely on AnimatePresence in Modal and layoutId.
                                openProject(category.featuredProject!.id);
                              }}
                              className="group flex items-center gap-3 relative px-6 py-3 rounded-full transition-all duration-300 transform"
                            >
                              {/* Background Layer that expands */}
                              <motion.div 
                                layoutId={`project-bg-${category.featuredProject.id}`}
                                className="absolute inset-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-colors"
                                style={{ borderRadius: 40 }} 
                              />
                              
                              {/* Content that fades out fast when opening */}
                              <motion.span 
                                animate={{ opacity: selectedProject?.id === category.featuredProject.id ? 0 : 1 }}
                                transition={{ duration: 0.2 }}
                                className="relative z-10 flex items-center gap-3"
                              >
                                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 w-2 h-2 rounded-full animate-pulse" />
                                <span className="uppercase tracking-widest text-xs font-bold text-white">{category.featuredProject.label}</span>
                                <ArrowUpRight size={16} className="text-white/50 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                              </motion.span>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 content-start justify-end">
                             {category.skills.map((skill, sIdx) => (
                              <span 
                                key={sIdx} 
                                className="px-4 py-2 bg-[#ededed] dark:bg-[#fff] text-black rounded-full text-sm font-bold border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
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
              <div className="skill-line w-full h-[1px] bg-[#333] dark:bg-[#333]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};