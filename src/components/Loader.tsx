import { useProgress } from '@react-three/drei';
import { useEffect, useState, useRef, useCallback } from 'react';

export const Loader = () => {
  const { progress, active } = useProgress();
  const [isVisible, setIsVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading');
  const loaderRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barContainerRef = useRef<HTMLDivElement>(null);
  
  const progressRef = useRef(progress);
  
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => {
        setDisplayProgress((prev) => {
            const currentRealProgress = progressRef.current;
            const step = 1;
            if (prev < currentRealProgress) {
                return Math.min(prev + step, currentRealProgress);
            }
            return prev;
        });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // Animação de saída com GSAP-style usando requestAnimationFrame
  const startExitAnimation = useCallback(() => {
    if (phase !== 'loading') return;
    setPhase('exiting');

    const circle = circleRef.current;
    const text = textRef.current;
    const barContainer = barContainerRef.current;
    const loader = loaderRef.current;
    if (!circle || !text || !loader || !barContainer) return;

    // Calcular o raio necessário para cobrir toda a tela
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxRadius = Math.sqrt(vw * vw + vh * vh) / 2;

    // Estado inicial do círculo
    const circleStartSize = 120; // px - tamanho inicial do círculo
    const ringWidth = 3;
    
    // Configurar o círculo no centro exato
    circle.style.width = `${circleStartSize}px`;
    circle.style.height = `${circleStartSize}px`;
    circle.style.borderRadius = '50%';
    circle.style.border = `${ringWidth}px solid rgba(237, 237, 237, 0.6)`;
    circle.style.position = 'absolute';
    circle.style.left = '50%';
    circle.style.top = '50%';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.opacity = '1';
    circle.style.pointerEvents = 'none';
    circle.style.boxSizing = 'border-box';
    circle.style.background = 'transparent';

    const totalDuration = 1400; // ms total
    const circleExpandDelay = 0; // o círculo começa a expandir imediatamente
    const circleExpandDuration = 1000; // ms para expandir
    const textScaleDelay = 100; // letras começam um pouquinho depois do círculo
    const textScaleDuration = 800; // ms para as letras escalarem
    const fadeDelay = 600; // fade começa quando a expansão já está avançada
    const fadeDuration = 600; // ms para o fade
    const barFadeDuration = 300; // barra some mais rápido

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;

      // --- Barra de progresso some rapidamente ---
      if (barContainer) {
        const barProgress = Math.min(1, elapsed / barFadeDuration);
        const barEased = barProgress * barProgress; // ease-in
        barContainer.style.opacity = `${1 - barEased}`;
        barContainer.style.transform = `translateY(${barEased * 10}px)`;
      }

      // --- Círculo se expande ---
      const circleElapsed = Math.max(0, elapsed - circleExpandDelay);
      const circleProgress = Math.min(1, circleElapsed / circleExpandDuration);
      // Ease out cubic
      const circleEased = 1 - Math.pow(1 - circleProgress, 3);
      const currentSize = circleStartSize + (maxRadius * 2.2 - circleStartSize) * circleEased;
      circle.style.width = `${currentSize}px`;
      circle.style.height = `${currentSize}px`;
      // O ring fica mais fino conforme expande
      const currentRing = Math.max(0.5, ringWidth * (1 - circleEased * 0.8));
      circle.style.border = `${currentRing}px solid rgba(237, 237, 237, ${0.6 * (1 - circleEased * 0.7)})`;

      // --- Texto escala + letter-spacing junto com o círculo ---
      const textElapsed = Math.max(0, elapsed - textScaleDelay);
      const textProgress = Math.min(1, textElapsed / textScaleDuration);
      // Ease out cubic
      const textEased = 1 - Math.pow(1 - textProgress, 3);
      const textScale = 1 + textEased * 2.5; // escala de 1x até 3.5x
      const letterSpacing = textEased * 1.2; // letter-spacing de 0 até 1.2em
      const textOpacity = 1 - Math.pow(textProgress, 2); // as letras fazem fade out suavemente
      if (text) {
        text.style.transform = `scale(${textScale})`;
        text.style.letterSpacing = `${letterSpacing}em`;
        text.style.opacity = `${Math.max(0, textOpacity)}`;
      }

      // --- Fade out do fundo ---
      const fadeElapsed = Math.max(0, elapsed - fadeDelay);
      const fadeProgress = Math.min(1, fadeElapsed / fadeDuration);
      const fadeEased = fadeProgress * fadeProgress; // ease-in para fade
      loader.style.opacity = `${1 - fadeEased}`;

      if (elapsed < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        setPhase('done');
        setIsVisible(false);
      }
    };

    requestAnimationFrame(animate);
  }, [phase]);

  useEffect(() => {
    if (progress === 100 && displayProgress >= 100 && phase === 'loading') {
      const timer = setTimeout(() => {
        startExitAnimation();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress, phase, startExitAnimation]);

  // Fallback de segurança
  useEffect(() => {
      const timeout = setTimeout(() => {
          if (progress === 0 && !active && isVisible) {
              setIsVisible(false);
          }
      }, 4000);
      return () => clearTimeout(timeout);
  }, [progress, active, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
      style={{ willChange: 'opacity' }}
    >
      {/* Círculo de expansão - centralizado absoluto */}
      <div
        ref={circleRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 0,
          height: 0,
          borderRadius: '50%',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'width, height, border, opacity',
        }}
      />

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center w-full max-w-sm px-4">
        
        {/* Percentage Text - esse escala e faz fade junto com a expansão */}
        <div
          ref={textRef}
          className="text-8xl font-bold font-mono text-[#ededed] mb-8"
          style={{
            willChange: 'transform, opacity, letter-spacing',
            transformOrigin: 'center center',
          }}
        >
          {Math.round(displayProgress)}%
        </div>

        {/* Progress Bar Container */}
        <div
          ref={barContainerRef}
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="w-full h-[2px] bg-[#333] relative overflow-hidden rounded-full" style={{ width: '320px' }}>
            <div
              className="absolute top-0 left-0 h-full bg-[#ededed] shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-[width] duration-100 ease-linear"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
