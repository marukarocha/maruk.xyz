import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const StoryTelling = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null); // Wrapper for the mask
  const textRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null); // The scrolling content

  const { t } = useLanguage();

  const themes = ["light", "dark", "dark", "light"];

  const storyCards = (t.storytelling?.cards || []).map((card: any, index: number) => ({
    ...card,
    theme: themes[index % themes.length]
  }));

  useLayoutEffect(() => {
    if (!storyCards.length) return; // Prevent animation if no cards

    const ctx = gsap.context(() => {
    // ... animation code ...
      const mm = gsap.matchMedia();

      // Common Setup
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=4000",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        }
      });

      // 1. Reveal Animation
      const introTl = gsap.timeline();
      
      // Hide content initially
      gsap.set(".story-card-content", { opacity: 0 });

      introTl.to(textRef.current, {
        opacity: 0,
        scale: 1.1,
        letterSpacing: "100px", // Increased massive spacing effect
        duration: 1, 
        ease: "power1.out"
      })
      .to(maskRef.current, {
        clipPath: "circle(150% at 50% 50%)",
        duration: 3, 
        ease: "power2.inOut"
      }, "<");

      tl.add(introTl);
      tl.addLabel("introEnd"); // Mark the end of the intro (3s mark)

      // Reveal Card Content - Start right at the beginning
      tl.to(".story-card-content", {
        opacity: 1,
        duration: 0.5,
        stagger: 0.05
      }, "introEnd-=3"); // Start exactly when intro starts

      
      // 2. Horizontal Scroll Logic
      
      // Desktop
      mm.add("(min-width: 768px)", () => {
        // Initial setup for Desktop: Shift track to center the first card (White) under the mask center
        gsap.set(trackRef.current, { x: "25vw" }); 
        gsap.set(maskRef.current, { clipPath: "circle(0% at 50% 50%)" });

        tl.to(trackRef.current, {
          x: "-125vw", // Move to show the end
          ease: "none",
          duration: 6 
        }, "introEnd-=1.5"); // Start scroll significantly earlier while mask is opening
      });

      // Mobile
      mm.add("(max-width: 767px)", () => {
         // Mobile doesn't need shift as 100vw card is already centered
         gsap.set(trackRef.current, { x: "0px" });
         gsap.set(maskRef.current, { clipPath: "circle(0% at 50% 50%)" });

         tl.to(trackRef.current, {
          x: "-300vw", 
          ease: "none",
          duration: 6
        }, "introEnd-=1.5"); 
      });

    }, containerRef);

    return () => ctx.revert();
  }, [storyCards]); // Update dependency

  return (
    <section ref={containerRef} id="process" className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden z-40">
      
      {/* Intro Text - Lives above the mask */}
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none mix-blend-difference">
        <h2 
          ref={textRef} 
          className="text-5xl md:text-9xl font-bold text-white whitespace-nowrap tracking-tighter"
        >
          {t.storytelling?.processTitle || "Nosso Processo"}
        </h2>
      </div>

      {/* Mask Wrapper - Fixed to viewport size, handles the circle reveal */}
      <div 
        ref={maskRef}
        className="w-full h-full absolute inset-0 z-10"
        // Clip path sets the "window" into the content
        style={{ clipPath: "circle(0px at 50% 50%)" }} 
      >
        {/* Horizontal Scroll Track - Slides BEHIND the mask window */}
        <div 
          ref={trackRef}
          className="h-full flex flex-row w-[400vw] md:w-[200vw]"
        >
          {storyCards.map((card: any, index: number) => (
            <div
              key={index}
              className={`w-screen md:w-[50vw] h-full flex flex-col justify-center p-12 md:p-24 border-r border-black/5 ${
                card.theme === 'light' ? 'bg-[#f0f0f0] text-black' : 'bg-[#111] text-white'
              }`}
            >
              <div className="flex flex-col gap-8 max-w-4xl story-card-content">
                <span className="text-6xl md:text-8xl font-light opacity-50 font-mono tracking-tighter">
                  {card.id}
                </span>
                <h3 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.9]">
                  {card.title}
                </h3>
                <p className={`text-xl md:text-2xl mt-8 max-w-xl leading-relaxed ${
                  card.theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
