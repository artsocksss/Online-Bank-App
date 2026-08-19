import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  Landmark,
  Percent,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { MilitaryBond, Transaction } from '../types';
import { formatCurrency, generateFiscalReceiptNumber } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface MilitaryBondsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  bonds: MilitaryBond[];
  uahBalance: number;
  onBuyBonds: (bondId: string, units: number, totalCost: number, tx: Transaction) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const MilitaryBondsModal: React.FC<MilitaryBondsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  bonds,
  uahBalance,
  onBuyBonds,
  onShowToast,
}) => {
  const [selectedBondId, setSelectedBondId] = useState<string>(bonds[0]?.id || '');
  const [unitsToBuy, setUnitsToBuy] = useState<number>(5);

  if (!isOpen) return null;

  const activeBond = bonds.find((b) => b.id === selectedBondId) || bonds[0];
  const totalCost = (activeBond?.pricePerUnit || 1000) * unitsToBuy;
  const estimatedProfit = (totalCost * ((activeBond?.yieldRate || 16.5) / 100)).toFixed(2);
  const totalPayout = totalCost + parseFloat(estimatedProfit);

  const totalOwnedUnits = bonds.reduce((sum, b) => sum + b.ownedUnits, 0);
  const totalPortfolioValue = bonds.reduce((sum, b) => sum + b.ownedUnits * b.pricePerUnit, 0);

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBond) return;
    if (unitsToBuy <= 0) {
      onShowToast('Оберіть щонайменше 1 облігацію для купівлі', 'error');
      return;
    }
    if (totalCost > uahBalance) {
      onShowToast(`Недостатньо коштів на гривневому рахунку (${formatCurrency(uahBalance, 'UAH')})`, 'error');
      return;
    }

    const txId = generateFiscalReceiptNumber();
    const newTx: Transaction = {
      id: txId,
      title: `Купівля ОВДП: ${activeBond.title} (${unitsToBuy} шт.)`,
      merchantName: 'Міністерство фінансів України (ОВДП)',
      category: 'Військові облігації',
      amount: -totalCost,
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: '•••• 4024',
      status: 'SUCCESS',
      fee: 0,
      mcc: '6211',
      authCode: 'OVDP-' + Math.floor(100000 + Math.random() * 900000),
    };

    onBuyBonds(activeBond.id, unitsToBuy, totalCost, newTx);
    onShowToast(`Успішно придбано ${unitsToBuy} шт. ${activeBond.title} на суму ${formatCurrency(totalCost, 'UAH')}!`, 'success');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
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
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-yellow-300 font-black flex items-center justify-center text-sm shadow-md">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Військові облігації України (ОВДП)</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Підтримайте економіку та ЗСУ з гарантованою дохідністю до 17.2%
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Portfolio Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/40 border border-blue-500/30">
              <span className="text-[11px] uppercase font-bold text-blue-300">Ваш портфель облігацій</span>
              <p className="text-2xl font-black text-white font-mono mt-0.5">
                {formatCurrency(totalPortfolioValue, 'UAH')}
              </p>
              <p className="text-[10px] text-blue-200 mt-0.5">У власності: {totalOwnedUnits} цінних паперів</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Гарантія держави</span>
              </div>
              <p className="text-xs text-neutral-300">
                Виплати номіналу та прибутку гарантовані Мінфіном. Податок 0% (без ПДФО та ВЗ).
              </p>
            </div>
          </div>

          {/* Bonds Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Доступні випуски облігацій
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bonds.map((bond) => {
                const isSelected = bond.id === selectedBondId;
                return (
                  <button
                    key={bond.id}
                    onClick={() => setSelectedBondId(bond.id)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#EEAA00] bg-[#EEAA00]/10 ring-1 ring-[#EEAA00]'
                        : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-lg">{bond.citySymbol}</span>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {bond.yieldRate}% річних
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-white">{bond.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-1">{bond.description}</p>
                    </div>

                    <div className="flex justify-between items-end pt-3 text-xs border-t border-neutral-800 mt-3 font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Ціна за 1 шт:</span>
                        <span className="font-bold text-[#EEAA00]">1 000.00 ₴</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block">Дата виплати:</span>
                        <span className="font-bold text-neutral-300">{bond.maturityDate}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator & Purchase form */}
          {activeBond && (
            <form onSubmit={handleBuy} className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-sm">Купівля: {activeBond.title}</h5>
                <span className="text-xs text-neutral-400 font-mono">Баланс: {formatCurrency(uahBalance, 'UAH')}</span>
              </div>

              {/* Units selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Кількість облігацій (шт.)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUnitsToBuy(Math.max(1, unitsToBuy - 1))}
                    className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-black text-lg hover:bg-neutral-800 transition cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={unitsToBuy}
                    onChange={(e) => setUnitsToBuy(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center font-mono font-black text-lg py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUnitsToBuy(unitsToBuy + 1)}
                    className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-black text-lg hover:bg-neutral-800 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Calculation Summary Table */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Сума інвестиції:</span>
                  <span className="font-bold text-white">{formatCurrency(totalCost, 'UAH')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Гарантований чистий прибуток:</span>
                  <span className="font-bold text-emerald-400">+{formatCurrency(parseFloat(estimatedProfit), 'UAH')}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-800 pt-2 font-bold">
                  <span className="text-neutral-300">Сума до виплати ({activeBond.maturityDate}):</span>
                  <span className="text-base font-black text-[#EEAA00]">{formatCurrency(totalPayout, 'UAH')}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
              >
                <Landmark className="w-4 h-4" />
                <span>Придбати {unitsToBuy} шт. за {formatCurrency(totalCost, 'UAH')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
