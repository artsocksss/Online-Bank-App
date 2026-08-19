import React, { useState } from 'react';
import {
  Banknote,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Info,
  Loader2,
  Percent,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { BankCard, InstallmentPlan, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CreditSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  cards: BankCard[];
  uahBalance: number;
  onTopUpBalance: (amount: number, title: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CreditSystemModal: React.FC<CreditSystemModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  cards,
  uahBalance,
  onTopUpBalance,
  onShowToast,
}) => {
  const [creditType, setCreditType] = useState<'CASH_LOAN' | 'LIMIT_INCREASE' | 'INSTALLMENT_SPLIT'>('CASH_LOAN');

  // Cash Loan parameters
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanMonths, setLoanMonths] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Monthly payment calculation (0.01% promo rate)
  const monthlyPayment = Math.round((loanAmount * (1 + 0.019 * (loanMonths / 12))) / loanMonths);

  const handleApplyCashLoan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onTopUpBalance(loanAmount, `Кредит готівкою Raiffeisen Premier (${loanAmount} ₴)`);
      onShowToast(`Вітаємо! Кредит на суму ${formatCurrency(loanAmount, 'UAH')} зараховано на картку`, 'success');
      setIsProcessing(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-sans">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#EEAA00] flex items-center justify-center font-extrabold border border-amber-500/30">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Кредитна Система Premier</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Миттєве рішення 1 хв
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Готівкові кредити, розстрочка 0% та управління пільговим лімітом
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-2 gap-2">
          {[
            { id: 'CASH_LOAN', label: 'Кредит готівкою', icon: DollarSign },
            { id: 'LIMIT_INCREASE', label: 'Кредитний ліміт 62 дні', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = creditType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCreditType(tab.id as any)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#EEAA00] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {creditType === 'CASH_LOAN' && (
            <div className="space-y-6">
              {/* Slider for Loan Amount */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-neutral-400">Сума кредиту</span>
                  <span className="text-2xl font-black font-mono text-[#EEAA00]">
                    {formatCurrency(loanAmount, 'UAH')}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#EEAA00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>5 000 ₴</span>
                  <span>250 000 ₴</span>
                  <span>500 000 ₴</span>
                </div>
              </div>

              {/* Loan Term Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-neutral-400 block">Термін кредитування</label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 24, 36].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLoanMonths(m)}
                      className={`py-2.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        loanMonths === m
                          ? 'border-[#EEAA00] bg-[#EEAA00]/10 text-[#EEAA00]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-900'
                      }`}
                    >
                      {m} місяців
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Payment Summary Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-neutral-950 border border-emerald-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">Щомісячний платіж</span>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(monthlyPayment, 'UAH')} / міс
                  </p>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />Без довідок про доходи та застави
                  </p>
                </div>

                <button
                  onClick={handleApplyCashLoan}
                  disabled={isProcessing}
                  className="px-5 py-3 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Отримати кошти</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {creditType === 'LIMIT_INCREASE' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#EEAA00] flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Пільговий період до 62 днів</h4>
                    <p className="text-xs text-neutral-400">0% на будь-які безнаготівкові покупки та перекази</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-white">Поточний ліміт: 100 000.00 ₴</p>
                  <p>Доступне безвідсоткове збільшення до: <strong>250 000.00 ₴</strong></p>
                </div>
                <button
                  onClick={() => {
                    onShowToast('Заявку на збільшення ліміту до 250 000 ₴ схвалено!', 'success');
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer"
                >
                  Підтвердити збільшення ліміту
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
