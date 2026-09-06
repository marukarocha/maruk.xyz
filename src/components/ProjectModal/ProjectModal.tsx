import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useProjectModal } from '../../hooks/useProjectModal';
import { useEffect, useRef } from 'react';
import { getProjectById } from '../../data/projects';
import { FrontendLayout, MotionLayout, DesignLayout } from './ModalLayouts';

function getCategoryFromProjectId(projectId: string): 'frontend' | 'motion' | '3d' | 'design' {
  if (projectId === 'motion-portfolio') return 'motion';
  if (projectId === 'pdv-showcase' || projectId.includes('3d')) return '3d';
  if (projectId === 'motodiario') return 'frontend';
  if (projectId.includes('design')) return 'design';
  return 'frontend';
}

export function ProjectModal() {
  const { selectedProject, closeProject } = useProjectModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useMotionValue(0);
  const currentCategory = selectedProject ? getCategoryFromProjectId(selectedProject.id) : null;
  const motionProject = getProjectById('motion-portfolio');
  const threeDProject = getProjectById('pdv-showcase');

  useEffect(() => {
    if (!selectedProject) {
      scrollYProgress.set(0);
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const syncScrollProgress = () => {
      const maxScrollableDistance = modalElement.scrollHeight - modalElement.clientHeight;
      const progress = maxScrollableDistance > 0 ? modalElement.scrollTop / maxScrollableDistance : 0;
      scrollYProgress.set(progress);
    };

    syncScrollProgress();
    modalElement.addEventListener('scroll', syncScrollProgress, { passive: true });
    window.addEventListener('resize', syncScrollProgress);

    return () => {
      modalElement.removeEventListener('scroll', syncScrollProgress);
      window.removeEventListener('resize', syncScrollProgress);
    };
  }, [selectedProject, scrollYProgress]);

  useEffect(() => {
    if (!selectedProject) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [selectedProject]);

  const renderLayout = () => {
    if (!selectedProject) return null;

    switch (currentCategory) {
      case 'motion':
        return <MotionLayout project={motionProject ?? selectedProject} scrollYProgress={scrollYProgress} onClose={closeProject} />;
      case '3d':
        return <MotionLayout project={threeDProject ?? selectedProject} scrollYProgress={scrollYProgress} onClose={closeProject} />;
      case 'design':
        return <DesignLayout project={selectedProject} scrollYProgress={scrollYProgress} onClose={closeProject} />;
      case 'frontend':
      default:
        return <FrontendLayout project={selectedProject} scrollYProgress={scrollYProgress} onClose={closeProject} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedProject && (
          <motion.div
            key={selectedProject.id}
            ref={modalRef}
            className="project-modal-container fixed inset-0 z-[100] h-screen w-screen overflow-x-hidden overflow-y-auto bg-[#080808]/95 text-[#ededed] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button
              onClick={closeProject}
              className="fixed right-4 top-4 z-[220] inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/55 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/78 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-cyan-100/35 hover:text-white sm:right-6 sm:top-6"
              aria-label="Voltar"
            >
              <span>Voltar</span>
            </button>

            {renderLayout()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
