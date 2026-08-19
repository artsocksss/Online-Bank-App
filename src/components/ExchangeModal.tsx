import React, { useState } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  Download,
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { Currency, FxRate, Transaction } from '../types';
import { formatCurrency, generateFiscalReceiptNumber } from '../utils/formatters';
import { generateBankingReceiptPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  balances: Record<Currency, number>;
  rates: FxRate[];
  onExecuteExchange: (
    tx: Transaction,
    fromCur: Currency,
    toCur: Currency,
    fromAmount: number,
    toAmount: number
  ) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  balances,
  rates,
  onExecuteExchange,
  onShowToast,
}) => {
  const [fromCurrency, setFromCurrency] = useState<Currency>('UAH');
  const [toCurrency, setToCurrency] = useState<Currency>('USD');
  const [fromAmount, setFromAmount] = useState('');
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  // Rate calculation logic
  const getRate = (from: Currency, to: Currency): { rate: number; isDirect: boolean } => {
    if (from === to) return { rate: 1, isDirect: true };

    if (from === 'UAH') {
      const targetRate = rates.find((r) => r.currency === to);
      return { rate: targetRate ? 1 / targetRate.sell : 1, isDirect: false };
    }

    if (to === 'UAH') {
      const sourceRate = rates.find((r) => r.currency === from);
      return { rate: sourceRate ? sourceRate.buy : 1, isDirect: true };
    }

    // Cross rate (e.g. USD to EUR)
    const sourceRate = rates.find((r) => r.currency === from)?.buy || 1;
    const targetRate = rates.find((r) => r.currency === to)?.sell || 1;
    return { rate: sourceRate / targetRate, isDirect: true };
  };

  const { rate } = getRate(fromCurrency, toCurrency);
  const numFrom = parseFloat(fromAmount) || 0;
  const numTo = numFrom * rate;
  const availableBalance = balances[fromCurrency] || 0;

  const handleSwapCurrencies = () => {
    const prevFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prevFrom);
    setError('');
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (numFrom <= 0) {
      setError('Введіть коректну суму для обміну.');
      return;
    }

    if (numFrom > availableBalance) {
      setError(`Недостатньо коштів на рахунку ${fromCurrency} (${formatCurrency(availableBalance, fromCurrency)}).`);
      return;
    }

    const txId = generateFiscalReceiptNumber();
    const newTx: Transaction = {
      id: txId,
      title: `Обмін валют: ${fromCurrency} ➔ ${toCurrency}`,
      merchantName: 'АТ «Райффайзен Банк» Валютний дилінг',
      category: 'Обмін валют',
      amount: fromCurrency === 'UAH' ? -numFrom : numTo,
      currency: fromCurrency === 'UAH' ? 'UAH' : toCurrency,
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: `Рахунок ${fromCurrency}`,
      recipientCardMask: `Рахунок ${toCurrency}`,
      status: 'SUCCESS',
      fee: 0,
      mcc: '6051',
      authCode: 'FX-' + Math.floor(100000 + Math.random() * 900000),
    };

    onExecuteExchange(newTx, fromCurrency, toCurrency, numFrom, numTo);
    setCompletedTx(newTx);
    onShowToast(`Успішно обміняно: ${formatCurrency(numFrom, fromCurrency)} ➔ ${formatCurrency(numTo, toCurrency)}`, 'success');

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleReset = () => {
    setFromAmount('');
    setCompletedTx(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Миттєвий обмін валют</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Курс Raiffeisen Online 24/7 без комісії</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {completedTx ? (
            <div className="text-center py-2 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-black">Валюту успішно конвертовано!</h3>
              <p className="text-xl font-bold text-[#EEAA00] my-2">
                +{numTo.toFixed(2)} {toCurrency}
              </p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
                Кошти зараховано на ваш {toCurrency} рахунок за внутрішнім курсом банку.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => generateBankingReceiptPdf(completedTx)}
                  className="w-full flex items-center justify-center gap-2 bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
                >
                  <Download className="w-4 h-4" /> Завантажити квитанцію FX (PDF)
                </button>
                <button
                  onClick={handleReset}
                  className={`w-full py-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode
                      ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-200'
                      : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  Здійснити ще один обмін
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExecute} className="space-y-4">
              {/* FROM CURRENCY */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Віддаєте</span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Доступно: {formatCurrency(availableBalance, fromCurrency)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="w-full font-black text-xl bg-transparent outline-none text-white"
                    required
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as Currency)}
                    className="font-bold text-sm bg-neutral-900 border border-neutral-700 text-white rounded-xl px-3 py-2 cursor-pointer outline-none"
                  >
                    <option value="UAH">UAH (₴)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="PLN">PLN (zł)</option>
                  </select>
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="p-2.5 rounded-full bg-[#EEAA00] text-black font-bold shadow-lg shadow-[#EEAA00]/30 hover:scale-110 transition cursor-pointer"
                  title="Поміняти напрямок"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </button>
              </div>

              {/* TO CURRENCY */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Отримуєте</span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Поточний: {formatCurrency(balances[toCurrency] || 0, toCurrency)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={numTo > 0 ? numTo.toFixed(2) : '0.00'}
                    className="w-full font-black text-xl bg-transparent outline-none text-[#EEAA00]"
                  />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as Currency)}
                    className="font-bold text-sm bg-neutral-900 border border-neutral-700 text-white rounded-xl px-3 py-2 cursor-pointer outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="UAH">UAH (₴)</option>
                    <option value="PLN">PLN (zł)</option>
                  </select>
                </div>
              </div>

              {/* FX Rate Meta Info */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Курс операції:</span>
                  <span className="font-bold text-white">
                    1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Комісія за конвертацію:</span>
                  <span className="font-semibold text-emerald-400">0.00 ₴ (0%)</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
              >
                <span>Підтвердити обмін коштів</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
