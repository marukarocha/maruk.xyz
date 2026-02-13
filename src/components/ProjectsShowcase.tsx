import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, X, Layout, Cpu } from 'lucide-react';
import { gsap } from 'gsap';
import { useProjectModal } from '../hooks/useProjectModal';

// Tipos
interface Project {
  id: number | string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github?: string;
  demo?: string;
  projectId?: string; // ID para abrir o modal detalhado
}

interface ProjectsShowcaseProps {
  category: string | null;
  onClose: () => void;
}

// Features para referência (sincronizado com About.tsx)
const features = [
  {
    id: 'web-apps',
    icon: Layout,
    title: 'Web Aplicações & SaaS',
  },
  {
    id: '3d-motion',
    icon: Box,
    title: '3D & Motion Strategy',
  },
  {
    id: 'creative-ai',
    icon: Cpu,
    title: 'Direção Criativa & IA',
  }
];

// Dados dos projetos por categoria (Case Studies)
const projectsByCategory: Record<string, Project[]> = {
  'web-apps': [
    {
      id: 'motodiario',
      title: 'Moto Diário',
      description: 'Plataforma PWA para motociclistas com rotas offline e gestão de manutenção.',
      image: '/images/motodiario-hero.jpg', // Placeholder - será substituído se a imagem não existir
      tech: ['React', 'Mapbox', 'PWA', 'Supabase'],
      projectId: 'motodiario'
    },
    {
      id: 101,
      title: 'Plataforma SaaS B2B',
      description: 'Arquitetura de alta performance para gestão empresarial. UI otimizada para produtividade com design system proprietário.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      tech: ['React', 'TypeScript', 'AI-Driven-Design', 'Tailwind'],
      github: '#',
      demo: '#'
    },
    {
      id: 102,
      title: 'Fintech Dashboard',
      description: 'Interface de análise financeira em tempo real com visualização de dados complexos através de gráficos interativos.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      tech: ['Next.js', 'Recharts', 'Node.js', 'WebSocket'],
      github: '#',
      demo: '#'
    }
  ],
  '3d-motion': [
    {
      id: 201,
      title: 'Visualização 3D de Produto',
      description: 'Experiência imersiva para e-commerce que permite visão 360º e configuração em tempo real, acelerando a decisão de compra.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      tech: ['Three.js', 'React Three Fiber', 'WebGL', 'Blender'],
      github: '#',
      demo: '#'
    },
    {
      id: 202,
      title: 'Interactive Spatial Audio',
      description: 'Experiência webGL com áudio espacial reativo ao movimento do usuário, criando imersão profunda para marca de áudio.',
      image: 'https://images.unsplash.com/photo-1615752395662-79058b76c8c5?w=800&q=80',
      tech: ['WebGL', 'Audio API', 'GSAP', 'GLSL'],
      github: '#',
      demo: '#'
    }
  ],
  'creative-ai': [
    {
      id: 301,
      title: 'AI Branding System',
      description: 'Identidade visual gerada com auxílio de IA e refinada manualmente, criando uma linguagem visual única e escalável.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      tech: ['Midjourney', 'Stable Diffusion', 'Figma', 'React'],
      github: '#',
      demo: '#'
    },
    {
      id: 302,
      title: 'Generative UI Components',
      description: 'Biblioteca de componentes de interface que se adaptam ao contexto do usuário usando lógica generativa.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      tech: ['OpenAI API', 'React', 'Tailwind', 'Storybook'],
      github: '#',
      demo: '#'
    }
  ]
};

export const ProjectsShowcase = ({ category, onClose }: ProjectsShowcaseProps) => {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { openProject } = useProjectModal();

  const projects = category ? projectsByCategory[category] || [] : [];
  const categoryInfo = features.find(f => f.id === category);

  useEffect(() => {
    if (!showcaseRef.current || !category) return;

    // Timeline de entrada mais suave e sutil
    const tl = gsap.timeline();

    // Animação do container principal mais sutil
    tl.fromTo(showcaseRef.current, 
      { 
        opacity: 0, 
        y: 40, 
        scale: 0.98,
        rotationX: -5
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotationX: 0,
        duration: 1.0, 
        ease: "power2.out" 
      }
    );

    // Animação do header mais suave
    if (headerRef.current) {
      tl.fromTo(headerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
        "-=0.6"
      );
    }

    // Animação dos cards mais sutil
    if (cardsRef.current) {
      const projectCards = cardsRef.current.querySelectorAll('.project-card');
      tl.fromTo(projectCards,
        { 
          opacity: 0, 
          y: 30, 
          scale: 0.95,
          rotationY: 8
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotationY: 0,
          duration: 0.8, 
          stagger: {
            amount: 0.4,
            from: "start",
            ease: "power2.out"
          },
          ease: "power2.out" 
        },
        "-=0.4"
      );
    }

    // Scroll suave após animação com offset mais sutil
    setTimeout(() => {
      showcaseRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }, 400);

  }, [category]);

  const handleClose = () => {
    if (!showcaseRef.current) {
      onClose();
      return;
    }

    // Animação de saída mais suave
    const tl = gsap.timeline({
      onComplete: onClose
    });

    // Animar cards saindo primeiro com movimento mais sutil
    const projectCards = showcaseRef.current.querySelectorAll('.project-card');
    tl.to(projectCards, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      rotationY: -5,
      duration: 0.5,
      stagger: {
        amount: 0.2,
        from: "end"
      },
      ease: "power2.in"
    });

    // Depois o container principal com movimento mais sutil
    tl.to(showcaseRef.current, {
      opacity: 0,
      y: -30,
      scale: 0.98,
      rotationX: 5,
      duration: 0.6,
      ease: "power2.in"
    }, "-=0.3");
  };

  if (!category || !categoryInfo) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        ref={showcaseRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="projects-showcase mt-12 p-8 bg-[#111] rounded-sm border border-[#333] shadow-2xl backdrop-blur-sm"
        style={{ perspective: '1000px' }}
      >
        {/* Header */}
        <div ref={headerRef} className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center border border-[#333] rounded-full">
              <categoryInfo.icon className="text-[#ededed]" size={20} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-2xl font-light text-[#ededed] tracking-wide">
                Projetos <span className="text-[#666]">/</span> {categoryInfo.title}
              </h3>
              <p className="text-[#666] text-xs uppercase tracking-widest mt-1">
                {projects.length} Selected Works
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-[#ededed] border border-transparent hover:border-[#333] transition-all duration-300"
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
        
        {/* Vimeo Reels - Keep as is but maybe wrap in consistent container */}
        {(category === 'frontend' || category === 'animation') && (
          <div className="mb-8 w-full bg-[#000] border border-[#222] aspect-video">
            <iframe
              src={category === 'frontend' 
                ? "https://player.vimeo.com/video/880236451?badge=0&autopause=0&player_id=0&app_id=58479"
                : "https://player.vimeo.com/video/816333951?badge=0&autopause=0&player_id=0&app_id=58479&loop=1"
              }
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%' }}
              title={category === 'frontend' ? "Trabalhos Web" : "Reel"}
            />
          </div>
        )}

        {/* Projects Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              onClick={() => project.projectId && openProject(project.projectId)}
              className="project-card relative bg-[#161616] border border-[#222] hover:border-[#444] aspect-[4/5] group cursor-pointer overflow-hidden transition-colors duration-500"
              whileHover={{ 
                y: -4,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
            >
              {/* Background Image - Desaturated unless hovered */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
                style={{
                  backgroundImage: `url('${project.image}')`
                }}
              >
                 {/* Fallback dark */}
                 <div className="absolute inset-0 bg-[#1a1a1a] -z-10 flex items-center justify-center">
                    <categoryInfo.icon className="text-[#333]" size={80} strokeWidth={0.5} />
                 </div>
              </div>

              {/* Gradient dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-500" />

              {/* Content Container */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                
                {/* Title and Decoration line */}
                <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <h4 className="text-xl font-light text-[#ededed] mb-2 group-hover:text-white transition-colors duration-300">
                    {project.title}
                  </h4>
                  <div className="w-8 h-[1px] bg-[#666] group-hover:w-16 group-hover:bg-[#ededed] transition-all duration-500"></div>
                </div>

                {/* Description & Links wrapper - hidden initially or collapsed */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-[200px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <p className="text-[#a1a1aa] text-sm mb-4 font-light leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] uppercase tracking-wider text-[#888] border border-[#333] px-2 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  {/* Links or CTA */}
                  <div className="flex gap-4">
                    {project.projectId ? (
                       <span className="text-[#ededed] text-xs uppercase tracking-widest hover:text-white group-hover:underline decoration-1 underline-offset-4 pointer-events-none">
                         View Case Study
                       </span>
                    ) : (
                      <>
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ededed] text-xs uppercase tracking-widest hover:underline decoration-1 underline-offset-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Github
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ededed] text-xs uppercase tracking-widest hover:underline decoration-1 underline-offset-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Live Demo
                          </a>
                        )}
                      </>
                    )}ve Demo
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#222] text-center">
          <p className="text-[#666] text-sm font-light">
            Interessado? <span className="text-[#ededed] ml-1">Vamos construir algo juntos.</span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};