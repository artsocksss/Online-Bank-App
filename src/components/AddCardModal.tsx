import React, { useState } from 'react';
import { CreditCard, Plus, ShieldCheck, X } from 'lucide-react';
import { BankCard, CardSkin, CardTier, Currency } from '../types';
import { RaifLogo } from './RaifLogo';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onAddCard: (card: BankCard) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onAddCard,
  onShowToast,
}) => {
  const [name, setName] = useState('Зарплатна Картка Raif');
  const [tier, setTier] = useState<CardTier>('Premier World Elite');
  const [currency, setCurrency] = useState<Currency>('UAH');
  const [skin, setSkin] = useState<CardSkin>('raif-yellow');
  const [initialBalance, setInitialBalance] = useState('10000');
  const [creditLimit, setCreditLimit] = useState('25000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(initialBalance) || 0;
    const creditLimitNum = parseFloat(creditLimit) || 0;

    // Generate random card number and CVV
    const r1 = Math.floor(1000 + Math.random() * 9000);
    const r2 = Math.floor(1000 + Math.random() * 9000);
    const r3 = Math.floor(1000 + Math.random() * 9000);
    const r4 = Math.floor(1000 + Math.random() * 9000);
    const fullNum = `4149 ${r2} ${r3} ${r4}`;

    const newCard: BankCard = {
      id: 'card-' + Date.now(),
      name,
      tier,
      currency,
      balance: balanceNum,
      creditLimit: creditLimitNum,
      usedCredit: 0,
      gracePeriodDays: 62,
      gracePeriodDate: '25.10.2026',
      iban: `UA89322003000002600${Math.floor(100000000 + Math.random() * 900000000)}`,
      cardNumber: fullNum,
      cardMask: `•••• •••• •••• ${r4}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      expiry: '08/31',
      skin,
      isVirtual: false,
      isDefault: false,
      isFrozen: false,
      applePayAdded: true,
      internetLimit: 50000,
      nfcEnabled: true,
      atmEnabled: true,
      dccProtected: true,
      pinCode: String(Math.floor(1000 + Math.random() * 9000)),
    };

    onAddCard(newCard);
    onShowToast(`Картку «${name}» успішно випущено та активовано!`, 'success');
    onClose();
  };

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
            <h3 className="text-lg font-black tracking-tight">Миттєвий випуск картки</h3>
            <p className="text-xs text-neutral-400">Офіційна картка АТ «Райффайзен Банк»</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-neutral-400 mb-1">Назва картки</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Тип картки</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CardTier)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
              >
                <option value="Premier World Elite">Premier World Elite</option>
                <option value="Visa Infinite">Visa Infinite</option>
                <option value="Raiffeisen Yellow Premier">Raiffeisen Yellow Premier</option>
                <option value="Platinum Credit">Platinum Credit</option>
                <option value="ФОП IT Business">ФОП IT Business</option>
                <option value="єПідтримка">єПідтримка</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Валюта</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
              >
                <option value="UAH">UAH (₴)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="PLN">PLN (zł)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Початковий баланс</label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Кредитний ліміт</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1.5">Дизайн (Скін картки)</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'raif-yellow', label: 'Yellow', color: 'bg-[#EEAA00]' },
                { id: 'gold-titanium', label: 'Gold', color: 'bg-amber-500' },
                { id: 'obsidian-black', label: 'Black', color: 'bg-neutral-800' },
                { id: 'cyber-neon', label: 'Cyber', color: 'bg-indigo-600' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSkin(s.id as CardSkin)}
                  className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${s.color} ${
                    skin === s.id ? 'ring-2 ring-white border-white text-black' : 'border-neutral-700 text-white opacity-80'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2 text-amber-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#EEAA00]" />
            <span>Картка відкривається миттєво з додаванням у Apple Pay / Google Wallet</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#EEAA00] text-black font-extrabold py-3.5 rounded-2xl text-xs hover:bg-yellow-400 transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />Випустити картку
          </button>
        </form>
      </div>
    </div>
  );
};
