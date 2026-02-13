import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export const Loader = () => {
  const { progress, active, item } = useProgress();
  const [isVisible, setIsVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  
  // Ref para acessar o valor mais recente dentro do intervalo sem resetar o timer
  const progressRef = useRef(progress);
  
  // Atualiza o ref sempre que o progresso real muda
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Loop de animação desacoplado de atualizações de estado
    const interval = setInterval(() => {
        setDisplayProgress((prev) => {
            const currentRealProgress = progressRef.current;
            const step = 1; // Velocidade ajustada (1% por tick de 20ms = 100% em 2s)
            
            // Se o contador visual está atrás do real, avança
            if (prev < currentRealProgress) {
                // Nunca ultrapassa o real + buffer
                // Mas queremos forçar uma animação lenta.
                // Se o real é 100, e prev é 0. Next é 1.
                // Isso garante 2 segundos de loading visual minimo.
                return Math.min(prev + step, currentRealProgress);
            }
            return prev;
        });
    }, 20); // 50fps

    return () => clearInterval(interval);
  }, []); // Dependência vazia: roda uma vez e mantém o ritmo constante

  useEffect(() => {
    // Só inicia a saída quando ambos (visusal e real) estiverem completos
    if (progress === 100 && displayProgress >= 100) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  // Fallback de segurança removido ou aumentado para não matar a animação se for lento
  // Mas mantemos um check se ficar travado no começo pra sempre
  useEffect(() => {
      const timeout = setTimeout(() => {
          if (progress === 0 && !active && isVisible) {
              // Se nada aconteceu em 4s, mata
              setIsVisible(false);
          }
      }, 4000);
      return () => clearTimeout(timeout);
  }, [progress, active, isVisible]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            y: -20,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          <div className="relative flex flex-col items-center w-full max-w-sm px-4">
            
            {/* Percentage Text */}
             <motion.div 
               className="text-8xl font-bold font-mono text-[#ededed] mb-8"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
             >
               {Math.round(displayProgress)}%
             </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full h-[2px] bg-[#333] relative overflow-hidden rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#ededed] shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            {/* Loading Item Text (Optional: shows what's loading) */}
            <motion.p 
                className="mt-4 text-xs font-mono text-[#666] uppercase tracking-widest h-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {active ? (item ? `Loading: ${item.split('/').pop()}` : "Initializing...") : "Ready"}
            </motion.p>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
