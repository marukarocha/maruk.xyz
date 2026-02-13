// import { Navigation } from './components/Navigation';
import { useEffect } from 'react';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { StoryTelling } from './sections/StoryTelling';
import { Contact } from './sections/Contact';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader } from './components/Loader';
import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t.meta.title;
    
    // Update meta description
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
      {/* <Navigation /> */}
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
    </div>
  );
}

export default App;
