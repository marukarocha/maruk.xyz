import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, ExternalLink, Github, ChevronDown, Rocket, Layers, Code, Database } from 'lucide-react';
import { useProjectModal } from '../../hooks/useProjectModal';
import { useEffect, useRef } from 'react';

export function ProjectModal() {
  const { selectedProject, closeProject } = useProjectModal();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  const { 
    id,
    title, 
    role, 
    problem, 
    solution, 
    techStack = [], 
    images, 
    links 
  } = selectedProject || {};

  return (
    <AnimatePresence mode="wait">
      {selectedProject && (
        <motion.div
        layoutId={`project-bg-${id}`} // Link to the background layer of the button, not the content
        className="fixed inset-0 z-[100] bg-[#0a0a0a] text-[#ededed] overflow-y-auto h-screen w-screen"
        initial={{ borderRadius: 40 }} // Starts round like the button
        animate={{ borderRadius: 0 }}
        exit={{ borderRadius: 40, transition: { duration: 0.5 } }}
        transition={{ 
            layout: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }, // Slower, smoother expansion
        }}
        >
        
        {/* Content Container - Fades in separately to avoid stretching content */}
        <motion.div 
            className="min-h-full w-full relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >

        {/* Fixed Navigation/Header */}
        <div 
            className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 mix-blend-difference"
        >
            <div className="flex flex-col">
                <span className="text-xs font-mono uppercase tracking-widest text-white/50">Case Study</span>
                <span className="text-xl font-bold font-display">{title}</span>
            </div>
            <button 
            onClick={closeProject}
            className="group flex items-center gap-2 text-sm font-mono uppercase tracking-widest hover:text-white transition-colors cursor-pointer pointer-events-auto"
            >
            <span>Close</span>
            <div className="bg-white text-black p-2 rounded-full group-hover:rotate-90 transition-transform duration-300">
                <X size={20} />
            </div>
            </button>
        </div>

        {/* SECTION 1: HERO */}
        <section className="min-h-screen relative flex items-center justify-center overflow-hidden py-20 border-b border-white/5">
            {/* Background Image Parallax Effect but simple fix first */}
            <div className="absolute inset-0 z-0">
               {images?.hero && (
                   <motion.img 
                     initial={{ scale: 1.1 }}
                     whileInView={{ scale: 1 }}
                     transition={{ duration: 2, ease: "easeOut" }}
                     src={images.hero} 
                     alt={title} 
                     className="w-full h-full object-cover opacity-30 grayscale-[20%]"
                   />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/80" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-end pb-24 min-h-[50vh]">
                <div className="mb-12 md:mb-0">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6">
                            {title?.split(' ')[0]}<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                                {title?.split(' ').slice(1).join(' ')}
                            </span>
                        </h1>
                    </motion.div>
                </div>
                
                <div className="flex flex-col gap-8 items-start">
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed max-w-lg"
                    >
                        {problem || "Uma solução inovadora para problemas complexos trazendo alta performance e design de ponta."}
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-3"
                    >
                         {techStack?.slice(0, 4).map((tech, i) => (
                             <span key={i} className="px-4 py-2 border border-white/20 rounded-full text-sm font-mono hover:bg-white/10 transition-colors">
                                {tech}
                             </span>
                         ))}
                    </motion.div>
                </div>
            </div>

            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
            >
                <ChevronDown size={32} />
            </motion.div>
        </section>

        {/* SECTION 2: CONTEXT & ROLE */}
        <section className="min-h-screen bg-[#0f0f0f] relative flex items-center py-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                     <div className="md:col-span-4">
                         <span className="text-primary-500 font-mono text-sm uppercase tracking-widest mb-4 block">The Mission</span>
                         <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl md:text-5xl font-bold mb-8"
                         >
                            Desafio &<br/>Objetivos
                         </motion.h2>
                         
                         <div className="space-y-6">
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white/5 p-6 rounded-xl border border-white/5"
                             >
                                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Layers size={20} className="text-purple-400"/> O Problema</h3>
                                 <p className="text-gray-400 text-sm">{problem}</p>
                             </motion.div>
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                viewport={{ once: true }}
                                className="bg-white/5 p-6 rounded-xl border border-white/5"
                             >
                                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Rocket size={20} className="text-cyan-400"/> A Solução</h3>
                                 <p className="text-gray-400 text-sm">{solution}</p>
                             </motion.div>
                         </div>
                     </div>

                     <div className="md:col-span-8 flex flex-col justify-center">
                         {/* Large Featured Image / Mockup */}
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative w-full aspect-[16/9] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
                         >
                             {images?.hero ? (
                                <img src={images.hero} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">Mockup Area</div>
                             )}

                             {links?.live && (
                                 <a href={links.live} target="_blank" className="absolute bottom-6 right-6 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                                     Ver Projeto Ao Vivo <ExternalLink size={16} />
                                 </a>
                             )}
                         </motion.div>
                     </div>
                </div>
            </div>
        </section>

        {/* SECTION 3: TECH ARSENAL DETAIL */}
        <section className="min-h-screen bg-[#0a0a0a] relative flex items-center py-20 border-t border-white/5">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-20">
                     <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                     >
                        Bastidores Técnicos
                     </motion.h2>
                     <p className="text-gray-400 max-w-2xl mx-auto">As tecnologias e decisões arquiteturais que tornaram este projeto possível.</p>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {techStack?.map((tech, i) => (
                         <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-[#161616] transition-all flex flex-col items-center justify-center text-center gap-4 group"
                         >
                             <div className="p-4 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                                 {/* Generic Tech Icon - could be mapped */}
                                 <Code size={32} className="text-gray-400 group-hover:text-white" />
                             </div>
                             <span className="font-mono text-lg font-medium">{tech}</span>
                         </motion.div>
                     ))}
                 </div>
            </div>
        </section>

        {/* SECTION 4: OUTRO / NEXT */}
        <section className="min-h-screen bg-white text-black relative flex items-center justify-center">
            <div className="text-center max-w-4xl px-6">
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black mb-12 tracking-tighter"
                >
                    Gostou do que viu?
                </motion.h2>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    {links?.github && (
                        <a href={links.github} target="_blank" className="px-8 py-4 bg-black text-white rounded-full text-xl font-bold flex items-center gap-3 hover:bg-gray-800 transition-colors">
                            <Github size={24} /> Código Fonte
                        </a>
                    )}
                     {links?.live && (
                        <a href={links.live} target="_blank" className="px-8 py-4 border-2 border-black text-black rounded-full text-xl font-bold flex items-center gap-3 hover:bg-black hover:text-white transition-colors">
                            Acessar Projeto <ExternalLink size={24} />
                        </a>
                    )}
                </div>
                <button 
                  onClick={closeProject}
                  className="mt-24 text-gray-500 hover:text-black uppercase tracking-widest text-sm font-bold flex flex-col items-center gap-2 mx-auto transition-colors"
                >
                    <ChevronDown className="rotate-180" size={24} />
                    Voltar para o Portfolio
                </button>
            </div>
        </section>
        
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
