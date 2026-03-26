import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TechStructure3D } from '../components/TechStructure3D';
import { useLanguage } from '../i18n/LanguageContext';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

const GeometricShapes = () => {
  const shapesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!shapesRef.current) return;

    const shapes = shapesRef.current.querySelectorAll('.geometric-shape');
    
    gsap.to(shapes, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
        stagger: 2
    });

  }, []);

  return (
    <div ref={shapesRef} className="absolute inset-0 pointer-events-none overflow-hidden text-[#333]">
      <div className="geometric-shape absolute top-20 left-10 w-16 h-16 opacity-10">
        <div className="w-full h-full border border-current" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
      </div>
      <div className="geometric-shape absolute top-32 right-20 w-12 h-12 opacity-10">
        <div className="w-full h-full border border-current" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>
      <div className="geometric-shape absolute bottom-40 left-20 w-20 h-20 opacity-10">
        <div className="w-full h-full border border-current rounded-full" />
      </div>
    </div>
  );
};

const TechnicalGrid = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
    <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-[#333] to-transparent" />
    <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-[#333] to-transparent" />
    <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" />
    <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" />
  </div>
);


export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();
  const slides = t.about.slides || [];
  
  useLayoutEffect(() => {
    
    let ctx = gsap.context(() => {
        // Setup slides
        const slideElements = gsap.utils.toArray<HTMLElement>('.about-slide');
        
        // Hide ALL slides initially
        gsap.set(slideElements, { autoAlpha: 0, y: 30, filter: "blur(10px)" }); 

        ScrollTrigger.refresh();

        // ============================================================
        // MAIN PINNED TIMELINE — all slides are scrub-controlled
        // so scrolling back reverses everything properly.
        //
        // Timeline: 18 units over +=2400px scroll
        //  0–1   : Slide 1 fades IN  (entrance)
        //  1–5   : Slide 1 visible (reading time)
        //  5–6   : Slide 1 OUT / Slide 2 IN
        //  6–10  : Slide 2 visible
        // 10–11  : Slide 2 OUT / Slide 3 IN
        // 11–15  : Slide 3 visible
        // 15–17  : Slide 3 OUT (gentle slow exit)
        // 17–18  : empty buffer at the end
        // ============================================================

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=2400", 
                pin: true,     
                pinSpacing: true, 
                scrub: 0.8,     
                anticipatePin: 1,
            }
        });

        // --- Slide 1 entrance (scrub-controlled, reverses on scroll back) ---
        tl.fromTo(slideElements[0], 
          { autoAlpha: 0, y: 30, filter: "blur(10px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
          0
        );

        // --- Slide transitions ---
        // Slide 1 → Slide 2 at position 5
        tl.to(slideElements[0], { 
            autoAlpha: 0, y: -30, filter: "blur(10px)",
            duration: 1, ease: "power2.inOut",
        }, 5);
        tl.fromTo(slideElements[1], 
            { autoAlpha: 0, y: 30, filter: "blur(10px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
            5.2
        );

        // Slide 2 → Slide 3 at position 10
        if (slideElements.length > 2) {
          tl.to(slideElements[1], { 
              autoAlpha: 0, y: -30, filter: "blur(10px)",
              duration: 1, ease: "power2.inOut",
          }, 10);
          tl.fromTo(slideElements[2], 
              { autoAlpha: 0, y: 30, filter: "blur(10px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
              10.2
          );
        }

        // --- Last slide gentle exit ---
        const lastSlide = slideElements[slideElements.length - 1];
        tl.to(lastSlide, {
            autoAlpha: 0,
            y: -25,
            filter: "blur(6px)",
            duration: 2,
            ease: "power1.inOut",
        }, 15);

    }, containerRef);
    return () => ctx.revert();
  }, [slides]);
  
  return (

    // Wrapper com background igual à seção seguinte (Skills) para que o divisor inferior seja visível durante o pin
    <div className="relative bg-[#ededed] dark:bg-[#0a0a0a] z-20">
      <section id="about" className="about-section py-20 flex items-center bg-[#0a0a0a] relative overflow-visible" ref={containerRef}>
      
      {/* Top Divider */}
      <div className="absolute -top-[48px] md:-top-[98px] left-0 w-full overflow-hidden leading-[0] z-10">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[100px]">
          <path d="M1200 120L0 0 0 120 1200 120z" className="fill-[#0a0a0a]"></path>
        </svg>
      </div>

      {/* Bottom Divider */}
      <div className="absolute -bottom-[49px] md:-bottom-[99px] left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[100px] transform rotate-180">
          <path d="M1200 120L0 0 0 120 1200 120z" className="fill-[#0a0a0a]"></path>
        </svg>
      </div>

      <GeometricShapes />
      <TechnicalGrid />
      
      <div className="container relative z-10 mx-auto px-6 h-full flex flex-col justify-center">
        
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-20 items-center h-full py-20"> 
            {/* Added py-20 to ensure content isn't cut off if screen is short */}
            
            {/* Left Column: 3D Visual Anchor */}
            <div 
              ref={leftColRef}
              className="relative h-[40vh] w-full flex items-center justify-start order-2 lg:order-1"
            >
               <div className="absolute w-[80vw] md:w-[80vw] h-[calc(100%+600px)] -top-[330px] lg:left-[calc(-50vw+50%)] left-[-10vw] z-40 pointer-events-auto">
                  <TechStructure3D />
               </div>
            </div>

            {/* Right Column: Content - Scrolling Slides */}
            <div className="flex flex-col justify-center z-50 order-1 lg:order-2 lg:pl-10 relative h-full min-h-[400px]">
              
               <div className="relative w-full max-w-xl h-64 md:h-80 flex items-center"> 
                 
                 {slides.map((slide, index) => (
                    <div 
                        key={index} 
                        className="about-slide absolute left-0 w-full flex flex-col gap-6"
                    >

                        <h2 className="text-4xl md:text-6xl font-bold text-[#ededed] tracking-tighter text-left drop-shadow-xl leading-[1.05]">
                           {slide.title}
                        </h2>
                        <div className="max-w-lg">
                          <p className="text-lg md:text-xl text-[#a1a1aa] font-normal leading-relaxed text-left border-l-2 border-[#333] pl-6">
                            {slide.description}
                          </p>
                        </div>
                    </div>
                 ))}

              </div>

            </div>
        </div>

      </div>
    </section>
    </div>
  );
};
