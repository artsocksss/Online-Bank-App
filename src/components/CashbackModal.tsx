import React from 'react';
import {
  BookOpen,
  Car,
  Check,
  CheckCircle2,
  Coffee,
  Film,
  Fuel,
  Gift,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { CashbackCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface CashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  categories: CashbackCategory[];
  onToggleCategory: (id: string) => void;
  onWithdrawCashback: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CashbackModal: React.FC<CashbackModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  categories,
  onToggleCategory,
  onWithdrawCashback,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const totalEarned = categories.reduce((sum, c) => sum + c.earnedThisMonth, 0);
  const selectedCount = categories.filter((c) => c.selected).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return ShoppingBag;
      case 'Fuel':
        return Fuel;
      case 'Coffee':
        return Coffee;
      case 'BookOpen':
        return BookOpen;
      case 'HeartPulse':
        return HeartPulse;
      case 'Car':
        return Car;
      case 'Film':
        return Film;
      default:
        return Gift;
    }
  };

  const handleWithdraw = () => {
    if (totalEarned < 50) {
      onShowToast('Мінімальна сума для виведення кешбеку: 50.00 ₴', 'info');
      return;
    }
    onWithdrawCashback();
    onShowToast(`Кешбек у розмірі ${formatCurrency(totalEarned, 'UAH')} успішно зараховано на картку!`, 'success');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Програма лояльності & Кешбек</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Обирайте до 2 категорій щомісяця та повертайте до 20% витрат
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Cashback Balance Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#EEAA00]/15 to-yellow-500/10 border border-[#EEAA00]/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Накопичений кешбек</span>
              <p className="text-2xl font-black text-[#EEAA00] font-mono mt-0.5">
                {formatCurrency(totalEarned, 'UAH')}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Податок 19.5% (ПДФО + ВЗ) утримується згідно з ПКУ</p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={totalEarned <= 0}
              className="px-4 py-3 rounded-xl bg-[#EEAA00] text-black font-bold text-xs hover:bg-[#ffb700] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Вивести на картку</span>
            </button>
          </div>

          {/* Category Selector Note */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Категорії на серпень 2026
            </span>
            <span className="text-xs font-semibold text-[#EEAA00]">
              Обрано {selectedCount} з 2
            </span>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => onToggleCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    cat.selected
                      ? 'border-[#EEAA00] bg-[#EEAA00]/10 ring-1 ring-[#EEAA00]'
                      : isDarkMode
                      ? 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/80'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        cat.selected ? 'bg-[#EEAA00] text-black' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{cat.name}</p>
                      <span className="text-[11px] text-[#EEAA00] font-black">{cat.percent}% кешбеку</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      cat.selected ? 'bg-[#EEAA00] border-[#EEAA00] text-black' : 'border-neutral-700'
                    }`}
                  >
                    {cat.selected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
