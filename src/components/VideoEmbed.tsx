import { useState } from 'react';
import { Play } from 'lucide-react';

type VideoEmbedProps = {
  src: string;
  title: string;
  label: string;
};

/**
 * Click-to-play video: shows a styled poster instead of a raw iframe, and
 * only mounts the player when the user asks for it.
 */
export const VideoEmbed = ({ src, title, label }: VideoEmbedProps) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video bg-black">
        <iframe
          src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full text-left"
    >
      <div className="relative aspect-video overflow-hidden bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,255,204,0.14),transparent_58%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#00ffcc]/40 bg-black/60 text-[#00ffcc] backdrop-blur transition-transform duration-300 group-hover:scale-110">
            <Play size={22} fill="currentColor" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-4 py-3">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/60">{label}</span>
          <span className="inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#00ffcc]">
            <Play size={11} fill="currentColor" />
            Assistir
          </span>
        </div>
      </div>
    </button>
  );
};
