// Navigation is rendered inside Hero
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { StoryTelling } from './sections/StoryTelling';
import { Contact } from './sections/Contact';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader } from './components/Loader';
import { SectionCursor } from './components/SectionCursor';
import { useLanguage } from './i18n/useLanguage';
import { PlaygroundLayout } from './playground/PlaygroundLayout';
import { PlaygroundIndex } from './playground/PlaygroundIndex';
import { ExperimentView } from './playground/ExperimentView';
import { TechConsultingPage } from './pages/TechConsultingPage';

// Portfolio — the main site
const Portfolio = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t.meta.title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', t.meta.description);
  }, [t]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-white selection:text-black">
      <Loader />
      <main>
        <Hero />
        <About />
        <Skills />
        <StoryTelling />
        <Contact />
      </main>
      <Footer />
      <ErrorBoundary>
        <ProjectModal />
      </ErrorBoundary>

      {/* Custom cursors per section */}
      <SectionCursor sectionId="about" preset="hologram" />
      <SectionCursor sectionId="skills" preset="contrast" />
      <SectionCursor sectionId="process" preset="contrast" />
      <SectionCursor sectionId="contact" preset="glow" color="#00ffcc" hoverColor="#ffffff" />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Portfolio */}
      <Route path="/" element={<Portfolio />} />
      <Route path="/consultoria-informatica" element={<TechConsultingPage />} />

      {/* Playground */}
      <Route path="/playground" element={<PlaygroundLayout />}>
        <Route index element={<PlaygroundIndex />} />
        <Route path=":id" element={<ExperimentView />} />
      </Route>
    </Routes>
  );
}

export default App;
