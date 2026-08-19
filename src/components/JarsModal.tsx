import React, { useState } from 'react';
import {
  Check,
  Coins,
  Copy,
  Gift,
  HeartHandshake,
  Laptop,
  Layers,
  Link,
  Plus,
  QrCode,
  Share2,
  Shield,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Vault,
  Wallet,
  X,
} from 'lucide-react';
import { BankJar, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface JarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  jars: BankJar[];
  uahBalance: number;
  onTopUpJar: (jarId: string, amount: number) => void;
  onBreakJar: (jarId: string) => void;
  onCreateJar: (newJar: BankJar) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const JarsModal: React.FC<JarsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  jars,
  uahBalance,
  onTopUpJar,
  onBreakJar,
  onCreateJar,
  onShowToast,
}) => {
  const [selectedJarId, setSelectedJarId] = useState<string>(jars[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New jar form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTarget, setNewTarget] = useState('50000');
  const [newColor, setNewColor] = useState('#EEAA00');
  const [newAutoRule, setNewAutoRule] = useState<'none' | 'roundup-10' | 'percent-5' | 'daily-50'>('roundup-10');

  if (!isOpen) return null;

  const activeJar = jars.find((j) => j.id === selectedJarId) || jars[0];

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJar) return;
    const num = parseFloat(topUpAmount);
    if (isNaN(num) || num <= 0) {
      onShowToast('Введіть коректну суму поповнення', 'error');
      return;
    }
    if (num > uahBalance) {
      onShowToast(`Недостатньо коштів на гривневому рахунку (${formatCurrency(uahBalance, 'UAH')})`, 'error');
      return;
    }

    onTopUpJar(activeJar.id, num);
    onShowToast(`Банку «${activeJar.title}» успішно поповнено на ${formatCurrency(num, 'UAH')}!`, 'success');

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleBreak = () => {
    if (!activeJar) return;
    if (activeJar.currentAmount <= 0) {
      onShowToast('У цій Банці немає накопичених коштів', 'info');
      return;
    }
    const amt = activeJar.currentAmount;
    onBreakJar(activeJar.id);
    onShowToast(`Банку розбито! ${formatCurrency(amt, 'UAH')} повернено на вашу картку`, 'success');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: BankJar = {
      id: 'jar-' + Date.now(),
      title: newTitle,
      description: newDescription || 'Особиста накопичувальна банка',
      targetAmount: parseFloat(newTarget) || 10000,
      currentAmount: 0,
      currency: 'UAH',
      color: newColor,
      icon: 'Target',
      category: 'Особисті',
      createdAt: new Date().toLocaleDateString('uk-UA'),
      contributorsCount: 1,
      autoSaveRule: newAutoRule,
      recentDonations: [],
    };

    onCreateJar(created);
    setSelectedJarId(created.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewTarget('50000');
    onShowToast(`Нову Банку «${created.title}» успішно відкрито!`, 'success');
  };

  const handleShareLink = () => {
    if (!activeJar) return;
    const url = `https://send.raif.ua/jar/${activeJar.id}`;
    navigator.clipboard.writeText(url);
    onShowToast(`Посилання на Банку ${url} скопійовано!`, 'success');
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
              <Vault className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Банка (Скарбничка)</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Накопичуйте на мрії та відкривайте спільні збори
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#EEAA00] text-black font-bold text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Відкрити Банку</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Jars Carousel Selector */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {jars.map((j) => {
              const pct = Math.min(100, Math.round((j.currentAmount / j.targetAmount) * 100));
              const isSelected = j.id === activeJar?.id;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedJarId(j.id)}
                  className={`p-3.5 rounded-2xl border text-left min-w-[200px] transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'border-[#EEAA00] bg-[#EEAA00]/10 ring-1 ring-[#EEAA00]'
                      : isDarkMode
                      ? 'border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold truncate max-w-[130px]">{j.title}</span>
                    <span className="text-[11px] font-black text-[#EEAA00] font-mono">{pct}%</span>
                  </div>
                  <p className="text-sm font-black font-mono">{formatCurrency(j.currentAmount, j.currency)}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Ціль: {formatCurrency(j.targetAmount, j.currency)}</p>
                  <div className="w-full h-1.5 rounded-full bg-neutral-800 mt-2 overflow-hidden">
                    <div className="h-full bg-[#EEAA00] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {activeJar && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Visual 3D Liquid Jar Container (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-48 h-64 rounded-3xl border-4 border-neutral-700/80 bg-neutral-950/90 relative overflow-hidden shadow-2xl p-2 flex flex-col justify-end">
                  {/* Jar Cap */}
                  <div className="absolute top-0 inset-x-8 h-4 rounded-b-xl bg-neutral-700/90 border-b border-neutral-600 shadow" />

                  {/* Dynamic Liquid Wave */}
                  {(() => {
                    const percent = Math.min(100, Math.round((activeJar.currentAmount / activeJar.targetAmount) * 100));
                    return (
                      <div
                        style={{ height: `${Math.max(8, percent)}%` }}
                        className="w-full bg-gradient-to-t from-amber-600 via-[#EEAA00] to-yellow-300 rounded-b-2xl transition-all duration-700 relative overflow-hidden shadow-inner flex items-center justify-center"
                      >
                        {/* Bubbles */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:12px_12px] opacity-40 animate-pulse" />
                        <span className="relative z-10 font-black text-black text-lg font-mono drop-shadow">
                          {percent}%
                        </span>
                      </div>
                    );
                  })()}

                  {/* Coin Drop Slot Marker */}
                  <div className="absolute top-6 inset-x-12 h-1 rounded-full bg-neutral-800" />
                </div>

                <div className="text-center mt-3">
                  <h4 className="font-extrabold text-sm">{activeJar.title}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5 max-w-xs">{activeJar.description}</p>
                </div>
              </div>

              {/* Jar Controls & Details (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Накопичено</span>
                    <p className="text-lg font-black text-[#EEAA00] font-mono mt-0.5">
                      {formatCurrency(activeJar.currentAmount, activeJar.currency)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Залишилось зібрати</span>
                    <p className="text-lg font-black text-white font-mono mt-0.5">
                      {formatCurrency(Math.max(0, activeJar.targetAmount - activeJar.currentAmount), activeJar.currency)}
                    </p>
                  </div>
                </div>

                {/* Auto-Save Rule Banner */}
                <div className="p-3 rounded-2xl bg-[#EEAA00]/10 border border-[#EEAA00]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EEAA00]" />
                    <span>
                      Автонакопичення:{' '}
                      <strong>
                        {activeJar.autoSaveRule === 'roundup-10'
                          ? 'Округлення витрат до 10 ₴'
                          : activeJar.autoSaveRule === 'percent-5'
                          ? '5% від кожної покупки'
                          : 'Вимкнено'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Top Up Form */}
                <form onSubmit={handleTopUp} className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Поповнити зі свого рахунку (Доступно: {formatCurrency(uahBalance, 'UAH')})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="500"
                      className="w-full text-base font-bold font-mono py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    />
                    <span className="absolute right-3.5 top-3 font-bold text-sm text-neutral-400">₴</span>
                  </div>

                  <div className="flex gap-2">
                    {['100', '200', '500', '1000', '5000'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setTopUpAmount(chip)}
                        className="flex-1 py-1 rounded-lg text-xs font-semibold border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                      >
                        +{chip}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Поповнити Банку на {topUpAmount ? `${topUpAmount} ₴` : ''}</span>
                  </button>
                </form>

                {/* Share Link & Break Jar Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleShareLink}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#EEAA00]" />
                    <span>Поділитись посиланням</span>
                  </button>
                  <button
                    onClick={handleBreak}
                    className="px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Розбити банку</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Contributors Feed */}
          {activeJar?.recentDonations && activeJar.recentDonations.length > 0 && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Останні внески в Банку ({activeJar.contributorsCount} донатерів)
              </h5>
              <div className="space-y-2">
                {activeJar.recentDonations.map((d) => (
                  <div key={d.id} className="flex justify-between items-center text-xs py-1">
                    <div>
                      <p className="font-bold text-white">{d.name}</p>
                      {d.comment && <p className="text-[11px] text-[#EEAA00] italic">«{d.comment}»</p>}
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400">+{formatCurrency(d.amount, activeJar.currency)}</span>
                      <p className="text-[10px] text-neutral-500">{d.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW JAR MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-base">Створення нової Банки</h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Назва Банки / Збору
                </label>
                <input
                  type="text"
                  placeholder="Наприклад: Збір на пікап для ЗСУ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Опис або призначення
                </label>
                <input
                  type="text"
                  placeholder="Короткий опис цілі"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Цільова сума (₴)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full font-bold font-mono text-sm py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Правило автоматичного заощадження
                </label>
                <select
                  value={newAutoRule}
                  onChange={(e: any) => setNewAutoRule(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none cursor-pointer"
                >
                  <option value="roundup-10">Округлення кожної витрати до 10 ₴</option>
                  <option value="percent-5">5% від суми кожної покупки</option>
                  <option value="daily-50">50 ₴ щодня на скарбничку</option>
                  <option value="none">Тільки ручне поповнення</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-semibold border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold bg-[#EEAA00] text-black hover:bg-[#ffb700] transition cursor-pointer shadow-md"
                >
                  Відкрити Банку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
