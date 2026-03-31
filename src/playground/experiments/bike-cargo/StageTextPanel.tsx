import type { RefObject } from 'react';

import type { BikeStage } from './types';

type StageTextPanelProps = {
  activeStage: BikeStage;
  eyebrowRef: RefObject<HTMLParagraphElement | null>;
  titleWrapRef: RefObject<HTMLDivElement | null>;
  subtitleRef: RefObject<HTMLParagraphElement | null>;
  isCargoStage: boolean;
  isDark: boolean;
};

const StageTextPanel = ({
  activeStage,
  eyebrowRef,
  titleWrapRef,
  subtitleRef,
  isCargoStage,
  isDark,
}: StageTextPanelProps) => (
  <div
    className={`pointer-events-auto relative max-w-none px-1 py-3 transition-all duration-500 sm:px-2 sm:py-4 ${
      isDark
        ? 'w-fit max-w-[78vw] rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(23,16,12,0.34),rgba(16,10,7,0.18))] px-6 py-6 shadow-[0_18px_46px_rgba(0,0,0,0.14)] backdrop-blur-[12px] sm:max-w-[64vw] sm:px-7 sm:py-7 lg:max-w-[56rem]'
        : 'w-fit max-w-[78vw] rounded-[34px] border border-[rgba(188,133,86,0.16)] bg-[linear-gradient(180deg,rgba(255,252,248,0.44),rgba(255,247,239,0.24))] px-6 py-6 shadow-[0_18px_40px_rgba(170,116,61,0.08)] backdrop-blur-[12px] sm:max-w-[64vw] sm:px-7 sm:py-7 lg:max-w-[56rem]'
    }`}
  >
    <div ref={eyebrowRef} />
    <div className="relative mt-4">
      <div
        ref={titleWrapRef}
        className="relative z-10 flex max-w-[96vw] flex-col tracking-tight"
        style={{ lineHeight: 0.72 }}
      >
        {activeStage.titleLines.map((line, index) => (
          <span
            key={`${activeStage.id}-${line}`}
            data-title-line
            className={`block font-black uppercase ${
              (activeStage.id === 'overview' && line === 'ORANGE') ||
              (activeStage.id === 'cargo' && line === 'CARGA') ||
              (activeStage.id === 'frame' && line === 'QUADRO') ||
              (activeStage.id === 'size' && line === 'TAMANHO') ||
              (activeStage.id === 'rear' && line === 'URBANO')
                ? 'text-transparent'
                : ''
            }`}
            style={{
              fontSize: 'clamp(52px, 11.8vw, 118px)',
              lineHeight: 0.78,
              letterSpacing: '-0.06em',
              color:
                  (activeStage.id === 'overview' && line === 'ORANGE') ||
                  (activeStage.id === 'cargo' && line === 'CARGA') ||
                  (activeStage.id === 'frame' && line === 'QUADRO') ||
                  (activeStage.id === 'size' && line === 'TAMANHO') ||
                  (activeStage.id === 'rear' && line === 'URBANO')
                    ? undefined
                  : index === activeStage.accentLine
                    ? isDark
                      ? '#ffd9b8'
                      : '#4a2811'
                    : isDark
                      ? '#fff1e3'
                      : '#120a06',
              textShadow:
                  (activeStage.id === 'overview' && line === 'ORANGE') ||
                  (activeStage.id === 'cargo' && line === 'CARGA') ||
                  (activeStage.id === 'frame' && line === 'QUADRO') ||
                  (activeStage.id === 'size' && line === 'TAMANHO') ||
                  (activeStage.id === 'rear' && line === 'URBANO')
                    ? 'none'
                  : isDark
                    ? '0 12px 30px rgba(0,0,0,0.24)'
                    : '0 12px 30px rgba(92,52,23,0.10)',
              backgroundImage:
                activeStage.id === 'overview' && line === 'ORANGE'
                  ? 'linear-gradient(180deg, #ff9d45 0%, #ef6c0d 48%, #b84300 100%)'
                  : activeStage.id === 'cargo' && line === 'CARGA'
                    ? 'linear-gradient(180deg, #ffbf75 0%, #f08a23 42%, #b94f05 100%)'
                    : activeStage.id === 'frame' && line === 'QUADRO'
                      ? 'linear-gradient(180deg, #ffba68 0%, #ea7b12 46%, #ae4300 100%)'
                      : activeStage.id === 'size' && line === 'TAMANHO'
                        ? 'linear-gradient(180deg, #ffc07a 0%, #ef8d2e 42%, #b94f05 100%)'
                      : activeStage.id === 'rear' && line === 'URBANO'
                        ? 'linear-gradient(180deg, #ffb45d 0%, #e86d09 46%, #9f3900 100%)'
                        : undefined,
              WebkitBackgroundClip:
                  (activeStage.id === 'overview' && line === 'ORANGE') ||
                  (activeStage.id === 'cargo' && line === 'CARGA') ||
                  (activeStage.id === 'frame' && line === 'QUADRO') ||
                  (activeStage.id === 'size' && line === 'TAMANHO') ||
                  (activeStage.id === 'rear' && line === 'URBANO')
                    ? 'text'
                  : undefined,
              backgroundClip:
                  (activeStage.id === 'overview' && line === 'ORANGE') ||
                  (activeStage.id === 'cargo' && line === 'CARGA') ||
                  (activeStage.id === 'frame' && line === 'QUADRO') ||
                  (activeStage.id === 'size' && line === 'TAMANHO') ||
                  (activeStage.id === 'rear' && line === 'URBANO')
                    ? 'text'
                  : undefined,
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
    <p
      ref={subtitleRef}
      className={`mt-6 max-w-[24rem] sm:max-w-[27rem] md:max-w-[30rem] text-base sm:text-lg md:text-[1.2rem] lg:text-[1.45rem] leading-[1.3] ${
        isDark ? 'font-light text-[#eadbce]/80' : 'font-normal text-[#24170f]'
      } sm:pr-2`}
      style={{ color: isDark ? '#eadbce' : '#24170f' }}
    >
      {activeStage.subtitleLines.map((line) => (
        <span key={`${activeStage.id}-${line}`} className="block">
          {line}
        </span>
      ))}
    </p>

    {isCargoStage && (
      <div
        className={`pointer-events-auto absolute left-5 top-full mt-3 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] transition-all duration-500 sm:left-7 ${
          isDark
            ? 'border-[#ffb15a]/20 bg-[rgba(19,10,5,0.74)] text-[#ffd8b7] shadow-[0_16px_32px_rgba(0,0,0,0.16)] backdrop-blur-xl'
            : 'border-[#d88b3e]/20 bg-[rgba(255,248,240,0.92)] text-[#7b4a1f] shadow-[0_14px_28px_rgba(181,120,56,0.10)] backdrop-blur-xl'
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff8a1e] shadow-[0_0_14px_rgba(255,138,30,0.32)]" />
        <span>Carga total 120KG</span>
      </div>
    )}
  </div>
);

export default StageTextPanel;
