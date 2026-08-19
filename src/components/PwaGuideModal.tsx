import React from 'react';
import { Apple, CheckCircle2, Download, Key, Share, ShieldCheck, Smartphone, Zap, X } from 'lucide-react';
import { RaifLogo } from './RaifLogo';

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative overflow-hidden ${
          isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-800/20 transition text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <RaifLogo size="md" />
          <div>
            <h3 className="text-lg font-black tracking-tight">Додати на екран iPhone</h3>
            <p className="text-xs text-neutral-400">Нативний iOS PWA додаток • 150 FPS Fluid Engine</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* iOS Steps */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EEAA00] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-bold text-white text-sm">Відкрийте в браузері Safari на iPhone</p>
                <p className="text-neutral-400 mt-0.5">
                  Переконайтеся, що ви відкрили посилання в оглядачі Safari для належної підтримки PWA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EEAA00] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-1.5">
                  Натисніть кнопку «Поширити» <Share className="w-4 h-4 text-sky-400 inline" />
                </p>
                <p className="text-neutral-400 mt-0.5">
                  У нижньому меню Safari оберіть стандартну іконку поділитися.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#EEAA00] text-black font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-bold text-white text-sm">Оберіть «На початковий екран»</p>
                <p className="text-neutral-400 mt-0.5">
                  Додаток з'явиться на робочому столі вашого iPhone з іконкою MyRaif та нативним запуском без рамок.
                </p>
              </div>
            </div>
          </div>

          {/* Engine & Key security details */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#EEAA00]" /> Hardware 150 FPS Acceleration
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#EEAA00] text-[10px]">
                АКТИВОВАНО
              </span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Підтримка ProMotion 120Hz/150Hz апаратного прискорення для надплавних анімацій свайпів та Dynamic Island.
            </p>
          </div>

          <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between font-bold text-sky-300">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-sky-400" /> API Keys & Vault Sync
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">
                АВТОЗБЕРЕЖЕННЯ
              </span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Усі API ключі, баланси, створені картки та історія сесій зберігаються у вашому ізольованому локальному зашифрованому сховищі.
            </p>
          </div>

          <button
            onClick={() => {
              onShowToast('PWA конфігурацію збережено. Додавайте додаток на екран!', 'success');
              onClose();
            }}
            className="w-full bg-[#EEAA00] text-black font-extrabold py-3.5 rounded-2xl text-xs hover:bg-yellow-400 transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
          >
            Зрозуміло, зберегти конфігурацію
          </button>
        </div>
      </div>
    </div>
  );
};
