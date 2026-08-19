import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Flame,
  Globe,
  HeartHandshake,
  Lightbulb,
  Phone,
  Shield,
  Smartphone,
  Tv,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { Currency, Transaction } from '../types';
import { formatCurrency, generateFiscalReceiptNumber } from '../utils/formatters';
import { generateBankingReceiptPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

interface UtilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialCategory?: string;
  uahBalance: number;
  onExecutePayment: (tx: Transaction, amount: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const UtilitiesModal: React.FC<UtilitiesModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  initialCategory = 'MOBILE',
  uahBalance,
  onExecutePayment,
  onShowToast,
}) => {
  const [selectedService, setSelectedService] = useState<'MOBILE' | 'UTILITIES' | 'ZSU' | 'INTERNET'>(
    initialCategory === 'ЗСУ' ? 'ZSU' : 'MOBILE'
  );

  // Form states
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [amount, setAmount] = useState('100');
  const [provider, setProvider] = useState('Kyivstar');
  const [error, setError] = useState('');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!phoneOrAccount.trim()) {
      setError('Введіть номер телефону або особовий рахунок.');
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Введіть коректну суму оплати.');
      return;
    }
    if (num > uahBalance) {
      setError(`Недостатньо коштів на гривневому рахунку (${formatCurrency(uahBalance, 'UAH')}).`);
      return;
    }

    const txId = generateFiscalReceiptNumber();
    let title = '';
    let category: any = 'Комунальні послуги';

    if (selectedService === 'MOBILE') {
      title = `Поповнення мобільного ${provider} (${phoneOrAccount})`;
      category = 'Комунальні послуги';
    } else if (selectedService === 'UTILITIES') {
      title = `Оплата ${provider} (о/р ${phoneOrAccount})`;
      category = 'Комунальні послуги';
    } else if (selectedService === 'ZSU') {
      title = `Благодійний внесок: ${provider}`;
      category = 'Благодійність ЗСУ';
    } else {
      title = `Оплата інтернету ${provider} (${phoneOrAccount})`;
      category = 'Комунальні послуги';
    }

    const newTx: Transaction = {
      id: txId,
      title: title,
      merchantName: provider,
      category: category,
      amount: -num,
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: '•••• 4024',
      status: 'SUCCESS',
      fee: 0,
      cashbackEarned: selectedService === 'UTILITIES' ? num * 0.01 : undefined,
      mcc: selectedService === 'ZSU' ? '8398' : '4900',
      authCode: 'AUT-' + Math.floor(100000 + Math.random() * 900000),
    };

    onExecutePayment(newTx, num);
    setCompletedTx(newTx);
    onShowToast(`Оплату ${formatCurrency(num, 'UAH')} на користь ${provider} успішно проведено`, 'success');

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleReset = () => {
    setPhoneOrAccount('');
    setAmount('100');
    setCompletedTx(null);
    setError('');
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
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Комуналка та сервіси</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Оплата без черг та комісій</p>
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
              <h3 className="text-lg font-black">Послугу успішно сплачено!</h3>
              <p className="text-xl font-black text-[#EEAA00] my-2 font-mono">
                {formatCurrency(completedTx.amount, 'UAH')}
              </p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
                Квитанція сформована та підписана ЕЦП банку відповідно до вимог НБУ.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => generateBankingReceiptPdf(completedTx)}
                  className="w-full flex items-center justify-center gap-2 bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
                >
                  <Download className="w-4 h-4" /> Завантажити квитанцію про сплату (PDF)
                </button>
                <button
                  onClick={handleReset}
                  className={`w-full py-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode
                      ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-200'
                      : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  Сплатити інший рахунок
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Category Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService('MOBILE');
                    setProvider('Kyivstar');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-[11px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedService === 'MOBILE' ? 'bg-[#EEAA00] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Мобільний
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService('UTILITIES');
                    setProvider('ДТЕК Київські електромережі');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-[11px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedService === 'UTILITIES' ? 'bg-[#EEAA00] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Комуналка
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService('ZSU');
                    setProvider('Фонд «Повернись живим»');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-[11px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedService === 'ZSU' ? 'bg-[#EEAA00] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" /> Донати ЗСУ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService('INTERNET');
                    setProvider('Ланет Інтернет');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-[11px] font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedService === 'INTERNET' ? 'bg-[#EEAA00] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Інтернет
                </button>
              </div>

              {/* SERVICE SPECIFIC FORM */}
              <form onSubmit={handlePay} className="space-y-4">
                {/* Provider Select */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Постачальник / Одержувач
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none cursor-pointer"
                  >
                    {selectedService === 'MOBILE' && (
                      <>
                        <option value="Kyivstar">Київстар (Kyivstar)</option>
                        <option value="Vodafone Україна">Vodafone Україна</option>
                        <option value="lifecell">lifecell</option>
                      </>
                    )}
                    {selectedService === 'UTILITIES' && (
                      <>
                        <option value="ДТЕК Київські електромережі">ДТЕК Київські електромережі (Світло)</option>
                        <option value="Yasno (ТОВ «Київські енергетичні послуги»)">Yasno Електроенергія</option>
                        <option value="ТОВ «ГК «Нафтогаз України»">Нафтогаз України (Газ)</option>
                        <option value="ПрАТ «АК «Київводоканал»">Київводоканал (Вода та водовідведення)</option>
                      </>
                    )}
                    {selectedService === 'ZSU' && (
                      <>
                        <option value="Фонд «Повернись живим»">МБФ «Повернись живим» 🇺🇦</option>
                        <option value="Благодійний фонд Сергія Притули">Фонд Сергія Притули</option>
                        <option value="United24 (Офіційний збір Президента України)">United24 Оборона</option>
                        <option value="Медичний батальйон «Госпітальєри»">Госпітальєри (Такмед)</option>
                      </>
                    )}
                    {selectedService === 'INTERNET' && (
                      <>
                        <option value="Ланет Інтернет">Ланет (Lanet Network)</option>
                        <option value="Київстар Домашній Інтернет">Київстар Домашній Інтернет</option>
                        <option value="Воля Кабель">Воля (Volia Broadband)</option>
                        <option value="Тріолан (Triolan)">Тріолан</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Account / Phone */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    {selectedService === 'MOBILE'
                      ? 'Номер телефону (+380)'
                      : selectedService === 'ZSU'
                      ? 'Призначення внеску'
                      : 'Особовий рахунок / Номер договору'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      selectedService === 'MOBILE'
                        ? '+380 (67) 000-00-00'
                        : selectedService === 'ZSU'
                        ? 'На дрони / ППО'
                        : '1092837491'
                    }
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    required
                  />
                </div>

                {/* Amount with Quick Chips */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Сума до сплати (₴)
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Баланс: {formatCurrency(uahBalance, 'UAH')}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full font-bold text-base py-2.5 px-3.5 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    {['50', '100', '250', '500', '1000'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setAmount(chip)}
                        className="flex-1 py-1 rounded-lg text-xs font-semibold border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                      >
                        {chip} ₴
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 mt-2"
                >
                  Сплатити {amount ? `${amount} ₴` : ''} без комісії
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
