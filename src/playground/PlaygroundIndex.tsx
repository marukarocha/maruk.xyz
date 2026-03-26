import { Link } from 'react-router-dom';
import { experiments } from './registry';
import { ArrowUpRight } from 'lucide-react';

const statusColors = {
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  wip: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concept: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const statusLabels = {
  live: 'Live',
  wip: 'WIP',
  concept: 'Concept',
};

export const PlaygroundIndex = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="mb-16">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30 mb-4">
          &#47;&#47; lab
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-4">
          Playground
        </h1>
        <p className="text-lg text-white/40 max-w-xl leading-relaxed font-light">
          Experimentos, protótipos e ideias visuais. Um espaço para explorar 
          tecnologias e conceitos sem compromisso com perfeição.
        </p>
      </div>

      {/* Experiment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            to={`/playground/${exp.id}`}
            className="group relative border border-white/[0.06] rounded-lg p-6 hover:border-white/[0.15] transition-all duration-500 bg-white/[0.02] hover:bg-white/[0.04]"
          >
            {/* Status badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[exp.status]}`}>
                {statusLabels[exp.status]}
              </span>
              <span className="text-[10px] font-mono text-white/20">
                {exp.date}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white/80 group-hover:text-white transition-colors mb-2 flex items-center gap-2">
              {exp.title}
              <ArrowUpRight
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-0.5 translate-x-0.5 group-hover:translate-y-0 group-hover:translate-x-0"
              />
            </h3>

            {/* Description */}
            <p className="text-sm text-white/35 leading-relaxed mb-4">
              {exp.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Link>
        ))}

        {/* Placeholder card for future experiments */}
        <div className="border border-dashed border-white/[0.06] rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3">
            <span className="text-white/20 text-lg">+</span>
          </div>
          <p className="text-xs font-mono text-white/15 uppercase tracking-widest">
            Em breve
          </p>
        </div>
      </div>
    </div>
  );
};
