import type { RefObject } from 'react';

type CargoStackProps = {
  cargoStackRef: RefObject<HTMLDivElement | null>;
  isCargoStage: boolean;
  isDark: boolean;
};

const CargoStack = ({ cargoStackRef, isCargoStage, isDark }: CargoStackProps) => (
  <div
    ref={cargoStackRef}
    className="absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top,opacity] duration-500"
    style={{ left: 0, top: 0, opacity: 0 }}
    aria-hidden="true"
  >
    <span
      className={`absolute left-0 top-0 h-10 w-10 rounded-[10px] border transition-all duration-700 ${
        isCargoStage
          ? 'translate-x-0 translate-y-0 rotate-[-4deg] opacity-100'
          : 'translate-x-5 translate-y-6 rotate-[8deg] opacity-0'
      } ${
        isDark
          ? 'border-[#ffd1a2]/26 bg-[linear-gradient(180deg,rgba(255,182,108,0.44),rgba(170,84,15,0.32))] shadow-[0_18px_36px_rgba(0,0,0,0.18)]'
          : 'border-[#cf7a2d]/24 bg-[linear-gradient(180deg,rgba(255,204,154,0.92),rgba(229,146,67,0.74))] shadow-[0_16px_28px_rgba(185,118,51,0.16)]'
      }`}
      style={{ transitionDelay: isCargoStage ? '80ms' : '0ms' }}
    />
    <span
      className={`absolute left-7 top-3 h-11 w-11 rounded-[10px] border transition-all duration-700 ${
        isCargoStage
          ? 'translate-x-0 translate-y-0 rotate-[6deg] opacity-100'
          : 'translate-x-7 translate-y-7 rotate-[12deg] opacity-0'
      } ${
        isDark
          ? 'border-[#ffe2c4]/28 bg-[linear-gradient(180deg,rgba(255,210,168,0.52),rgba(182,103,31,0.34))] shadow-[0_18px_38px_rgba(0,0,0,0.20)]'
          : 'border-[#d58b42]/24 bg-[linear-gradient(180deg,rgba(255,221,186,0.96),rgba(241,165,93,0.78))] shadow-[0_18px_30px_rgba(193,122,53,0.16)]'
      }`}
      style={{ transitionDelay: isCargoStage ? '180ms' : '0ms' }}
    />
    <span
      className={`absolute left-16 top-0 h-9 w-9 rounded-[10px] border transition-all duration-700 ${
        isCargoStage
          ? 'translate-x-0 translate-y-0 rotate-[11deg] opacity-100'
          : 'translate-x-9 translate-y-5 rotate-[16deg] opacity-0'
      } ${
        isDark
          ? 'border-[#fff0db]/26 bg-[linear-gradient(180deg,rgba(255,230,204,0.42),rgba(191,117,43,0.30))] shadow-[0_14px_28px_rgba(0,0,0,0.16)]'
          : 'border-[#e0a76e]/22 bg-[linear-gradient(180deg,rgba(255,232,206,0.94),rgba(245,183,121,0.72))] shadow-[0_14px_26px_rgba(200,134,67,0.14)]'
      }`}
      style={{ transitionDelay: isCargoStage ? '280ms' : '0ms' }}
    />
  </div>
);

export default CargoStack;
