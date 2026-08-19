import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Percent,
  Plus,
  RotateCcw,
  Sparkles,
  Split,
  X,
} from 'lucide-react';
import { InstallmentPlan, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface InstallmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  installments: InstallmentPlan[];
  eligibleTransactions: Transaction[];
  onAddNewInstallment: (plan: InstallmentPlan) => void;
  onPayOffEarly: (planId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const InstallmentsModal: React.FC<InstallmentsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  installments,
  eligibleTransactions,
  onAddNewInstallment,
  onPayOffEarly,
  onShowToast,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(6);

  if (!isOpen) return null;

  const totalMonthlyLoad = installments.reduce((sum, i) => sum + i.monthlyPayment, 0);
  const totalRemainingDebt = installments.reduce((sum, i) => sum + i.remainingAmount, 0);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    const absAmount = Math.abs(selectedTx.amount);
    const monthly = absAmount / selectedMonths;

    const newPlan: InstallmentPlan = {
      id: 'inst-' + Date.now(),
      title: selectedTx.title,
      merchant: selectedTx.merchantName || 'Оплата частинами 0%',
      totalAmount: absAmount,
      monthlyPayment: monthly,
      monthsTotal: selectedMonths,
      monthsPaid: 1,
      nextPaymentDate: '25 вересня 2026',
      remainingAmount: absAmount - monthly,
    };

    onAddNewInstallment(newPlan);
    setSelectedTx(null);
    onShowToast(`Покупку «${newPlan.title}» успішно переведено в розстрочку на ${selectedMonths} міс.`, 'success');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleEarlyPay = (plan: InstallmentPlan) => {
    onPayOffEarly(plan.id);
    onShowToast(`Розстрочку «${plan.title}» на суму ${formatCurrency(plan.remainingAmount, 'UAH')} успішно достроково закрито!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Оплата частинами & Розстрочка 0%</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Купуйте зараз, сплачуйте рівними частинами без переплат
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] uppercase font-bold text-neutral-400">Щомісячний платіж</span>
              <p className="text-xl font-black text-[#EEAA00] font-mono mt-0.5">
                {formatCurrency(totalMonthlyLoad, 'UAH')}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Списання 25-го числа щомісяця</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] uppercase font-bold text-neutral-400">Залишок боргу</span>
              <p className="text-xl font-black text-white font-mono mt-0.5">
                {formatCurrency(totalRemainingDebt, 'UAH')}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">0.00 ₴ відсотків (Чесна розстрочка)</p>
            </div>
          </div>

          {/* ACTIVE INSTALLMENT PLANS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Ваші активні договори ({installments.length})
            </h4>

            {installments.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Немає активних розстрочок.</p>
            ) : (
              <div className="space-y-3">
                {installments.map((inst) => {
                  const progressPct = Math.round((inst.monthsPaid / inst.monthsTotal) * 100);
                  return (
                    <div
                      key={inst.id}
                      className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-sm text-white">{inst.title}</h5>
                          <p className="text-xs text-neutral-400">{inst.merchant}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-[#EEAA00]">
                            {formatCurrency(inst.monthlyPayment, 'UAH')}/міс
                          </span>
                          <p className="text-[10px] text-neutral-400">Наступний: {inst.nextPaymentDate}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-neutral-400">
                          <span>
                            Сплачено {inst.monthsPaid} з {inst.monthsTotal} платежів
                          </span>
                          <span className="font-bold text-white font-mono">
                            Залишок: {formatCurrency(inst.remainingAmount, 'UAH')}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-[#EEAA00] rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleEarlyPay(inst)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Погасити достроково</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CONVERT PAST PURCHASE TO INSTALLMENT */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-950 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EEAA00]" />
              <h4 className="font-bold text-sm">Перевести минулу покупку в Розстрочку</h4>
            </div>
            <p className="text-xs text-neutral-400">
              Оберіть нещодавню оплату від 500 ₴ та розбийте її на зручну кількість платежів
            </p>

            {eligibleTransactions.length === 0 ? (
              <p className="text-xs text-neutral-500">Немає доступних покупок для переведення.</p>
            ) : (
              <div className="space-y-2">
                {eligibleTransactions.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(isSelected ? null : tx)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'border-[#EEAA00] bg-[#EEAA00]/10 ring-1 ring-[#EEAA00]'
                          : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/80'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{tx.title}</p>
                        <p className="text-[10px] text-neutral-400">{tx.date}</p>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#EEAA00]">
                        {formatCurrency(Math.abs(tx.amount), tx.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedTx && (
              <form onSubmit={handleConvert} className="pt-2 space-y-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Кількість місяців
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 12, 24].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMonths(m)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          selectedMonths === m
                            ? 'bg-[#EEAA00] border-[#EEAA00] text-black shadow-md'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {m} міс
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Щомісячний платіж:</span>
                  <span className="font-mono font-black text-sm text-[#EEAA00]">
                    {formatCurrency(Math.abs(selectedTx.amount) / selectedMonths, 'UAH')}/міс
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
                >
                  Оформити розстрочку під 0%
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
