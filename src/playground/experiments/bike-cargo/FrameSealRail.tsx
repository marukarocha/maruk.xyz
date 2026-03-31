import { motion, type Variants } from 'framer-motion';
import { BadgeCheck, Bot, Layers3, Shield } from 'lucide-react';

import { FRAME_SEALS } from './config';
import type { FrameSealId } from './types';

type FrameSealRailProps = {
  isDark: boolean;
  selectedSealId: FrameSealId | null;
  onSelect: (sealId: FrameSealId) => void;
};

const ICONS: Record<FrameSealId, typeof Layers3> = {
  'aluminium-triple': Layers3,
  'weld-reinforcement': Shield,
  'robotic-welds': Bot,
  'high-strength': BadgeCheck,
};

const railVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: 'linear',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'linear',
    },
  },
};

const FrameSealRail = ({ isDark, selectedSealId, onSelect }: FrameSealRailProps) => (
  <motion.div
    variants={railVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="pointer-events-auto grid w-full max-w-[42rem] grid-cols-2 gap-3 sm:gap-4"
  >
      {FRAME_SEALS.map(({ id, label, description }) => {
        const Icon = ICONS[id];
        const isSelected = selectedSealId === id;

        return (
          <motion.button
            key={id}
            type="button"
            variants={itemVariants}
            onClick={() => onSelect(id)}
            className={`group rounded-[24px] border p-4 text-left transition-all duration-300 ${
              isSelected
                ? isDark
                  ? 'border-[#ffb15a]/36 bg-[linear-gradient(180deg,rgba(31,18,11,0.7),rgba(18,11,7,0.46))] shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur-[16px]'
                  : 'border-[#df9d63]/30 bg-[linear-gradient(180deg,rgba(255,252,248,0.82),rgba(255,247,239,0.58))] shadow-[0_12px_26px_rgba(183,118,49,0.10)] backdrop-blur-[16px]'
                : isDark
                  ? 'border-white/8 bg-[linear-gradient(180deg,rgba(20,11,6,0.46),rgba(13,8,5,0.22))] shadow-[0_10px_24px_rgba(0,0,0,0.10)] backdrop-blur-[14px] hover:border-[#ffb15a]/28 hover:bg-[linear-gradient(180deg,rgba(28,16,9,0.6),rgba(16,10,6,0.3))] hover:shadow-[0_12px_26px_rgba(0,0,0,0.14)]'
                  : 'border-[rgba(188,133,86,0.10)] bg-[linear-gradient(180deg,rgba(255,252,248,0.54),rgba(255,247,239,0.32))] shadow-[0_10px_22px_rgba(183,118,49,0.06)] backdrop-blur-[14px] hover:border-[rgba(223,157,99,0.26)] hover:bg-[linear-gradient(180deg,rgba(255,252,248,0.74),rgba(255,248,241,0.48))] hover:shadow-[0_12px_24px_rgba(183,118,49,0.10)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] transition-all duration-300 ${
                  isDark
                    ? isSelected
                      ? 'bg-[#ff9b47]/18 text-[#ffc38f]'
                      : 'bg-[#ff9b47]/10 text-[#ffbe83] group-hover:bg-[#ff9b47]/16'
                    : isSelected
                      ? 'bg-[#ff9e4d]/18 text-[#d96b15]'
                      : 'bg-[#ff9e4d]/10 text-[#cf6715] group-hover:bg-[#ff9e4d]/16'
                }`}
              >
                <Icon size={26} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <span className={`block text-[11px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-[#ffbe83]/72' : 'text-[#b56625]/72'}`}>
                  Processo
                </span>
                <span
                  className={`mt-1 block text-[15px] font-semibold leading-[1.15] transition-colors duration-300 ${
                    isDark ? 'text-[#fff2e4] group-hover:text-[#ffddb9]' : 'text-[#26170f] group-hover:text-[#9f4c0f]'
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>

            <div className={`grid transition-all duration-300 ${isSelected ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className={`border-t pt-3 text-[12px] leading-[1.45] sm:text-[13px] ${isDark ? 'border-white/8 text-[#eadbce]/82' : 'border-[#d8b18c]/24 text-[#5a3b27]/82'}`}>
                  {description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
  </motion.div>
);

export default FrameSealRail;
