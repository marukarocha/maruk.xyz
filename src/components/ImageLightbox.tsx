import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';

export type LightboxImage = {
  src: string;
  caption?: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  startIndex?: number;
  onClose: () => void;
};

export const ImageLightbox = ({ images, startIndex = 0, onClose }: ImageLightboxProps) => {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setIndex(startIndex);
    setZoomed(false);
  }, [startIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') {
        setIndex((current) => (current + 1) % images.length);
        setZoomed(false);
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => (current - 1 + images.length) % images.length);
        setZoomed(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [images.length, onClose]);

  const current = images[index];

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/95" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/50">
          {current?.caption ?? 'imagem'} · {index + 1}/{images.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((value) => !value)}
            className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
          >
            {zoomed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {zoomed ? 'Ajustar' : 'Zoom'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="border border-white/15 p-1.5 text-white/60 transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto p-3 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={current?.src}
          alt={current?.caption ?? ''}
          onClick={() => setZoomed((value) => !value)}
          className={
            zoomed
              ? 'mx-auto block max-w-none cursor-zoom-out'
              : 'mx-auto block max-h-[calc(100vh-90px)] max-w-full cursor-zoom-in object-contain'
          }
        />
      </div>
    </div>
  );
};
