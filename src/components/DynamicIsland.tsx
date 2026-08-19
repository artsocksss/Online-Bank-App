import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, ShieldAlert, Zap, Repeat } from 'lucide-react';

export interface DynamicIslandData {
  mode: 'compact' | 'expanded' | 'push' | 'secure-otp';
  title: string;
  subtitle?: string;
  amount?: string;
  icon?: 'bell' | 'check' | 'repeat' | 'shield';
}

interface DynamicIslandProps {
  data: DynamicIslandData;
  onClear: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ data, onClear }) => {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
      <AnimatePresence mode="wait">
        {data.mode === 'compact' ? (
          <motion.div
            key="compact"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="h-7 px-3.5 bg-black/90 border border-neutral-800 text-white rounded-full flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl cursor-pointer"
            onClick={onClear}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EEAA00] animate-pulse" />
              <span className="text-[10px] font-black tracking-tight text-neutral-300">MyRaif OS</span>
            </div>
            <span className="text-[10px] font-mono text-[#EEAA00] font-bold">24/7 Core</span>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ y: -20, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -20, scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-80 sm:w-96 p-3.5 bg-black/95 border border-amber-500/40 text-white rounded-[26px] shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 cursor-pointer"
            onClick={onClear}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#EEAA00] text-black font-black flex items-center justify-center shrink-0 shadow-lg shadow-[#EEAA00]/20">
                {data.icon === 'check' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : data.icon === 'shield' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-white truncate">{data.title}</h4>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-[#EEAA00]">
                    PUSH
                  </span>
                </div>
                {data.subtitle && (
                  <p className="text-[11px] text-neutral-300 truncate mt-0.5">{data.subtitle}</p>
                )}
              </div>
            </div>

            {data.amount && (
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-black text-[#EEAA00] block">
                  {data.amount}
                </span>
                <span className="text-[9px] text-neutral-500 block font-mono">Списано</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
