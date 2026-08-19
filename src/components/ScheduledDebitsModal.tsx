import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Plus,
  Power,
  Play,
  Repeat,
  ShieldCheck,
  Sparkles,
  Trash2,
  Tv,
  X,
  Zap,
} from 'lucide-react';
import { ScheduledDebit, BankCard } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ScheduledDebitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  scheduledDebits: ScheduledDebit[];
  activeCard: BankCard;
  onToggleDebit: (id: string) => void;
  onAddDebit: (debit: ScheduledDebit) => void;
  onDeleteDebit: (id: string) => void;
  onTriggerSimulatedDebit: (debit: ScheduledDebit) => void;
  isAutoLoopActive: boolean;
  onToggleAutoLoop: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ScheduledDebitsModal: React.FC<ScheduledDebitsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  scheduledDebits,
  activeCard,
  onToggleDebit,
  onAddDebit,
  onDeleteDebit,
  onTriggerSimulatedDebit,
  isAutoLoopActive,
  onToggleAutoLoop,
  onShowToast,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('Spotify Family Ukraine');
  const [newMerchant, setNewMerchant] = useState('Spotify AB');
  const [newAmount, setNewAmount] = useState('219');
  const [newPeriod, setNewPeriod] = useState<'Щомісяця' | 'Щотижня' | 'Щодня'>('Щомісяця');
  const [newCategory, setNewCategory] = useState<any>('Розваги та ігри');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      onShowToast('Введіть коректну суму автоплатежу', 'error');
      return;
    }

    const newDebit: ScheduledDebit = {
      id: 'debit-' + Date.now(),
      title: newTitle,
      merchant: newMerchant,
      amount: amt,
      currency: 'UAH',
      period: newPeriod,
      nextDebitDate: '28 серпня 2026',
      category: newCategory,
      isActive: true,
      icon: 'Tv',
    };

    onAddDebit(newDebit);
    setShowAddForm(false);
    onShowToast(`Регулярний автоплатіж «${newTitle}» успішно активовано!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-sans">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-amber-500/30 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEAA00] text-black font-black flex items-center justify-center shadow-lg shadow-[#EEAA00]/20">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Регулярні автоплатежі & Dynamic Push</h3>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME SIM
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Автоматичні списання з Push-сповіщеннями у Dynamic Island
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Simulation Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[#EEAA00] animate-bounce shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-white">Демонстраційний модуль списань</p>
              <p className="text-[11px] text-neutral-400">
                Сплачується з картки {activeCard.name} ({activeCard.cardMask})
              </p>
            </div>
          </div>

          <button
            onClick={onToggleAutoLoop}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              isAutoLoopActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAutoLoopActive ? 'Авто-демо [ON (30с)]' : 'Увімкнути Авто-демо'}</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider">
              Активні автоплатежі ({scheduledDebits.length})
            </h4>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-extrabold text-[#EEAA00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Сховати форму' : 'Створити підписку'}</span>
            </button>
          </div>

          {/* Form to Create New Scheduled Debit */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3">
              <h5 className="font-extrabold text-xs text-[#EEAA00] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Додати новий автоплатіж
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">Назва сервісу / підписки</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">Отримувач / Мерчант</label>
                  <input
                    type="text"
                    required
                    value={newMerchant}
                    onChange={(e) => setNewMerchant(e.target.value)}
                    className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">Сума (₴)</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">Периодичність</label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  >
                    <option value="Щомісяця">Щомісяця</option>
                    <option value="Щотижня">Щотижня</option>
                    <option value="Щодня">Щодня</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Активувати підписку
              </button>
            </form>
          )}

          {/* List of Scheduled Debits */}
          <div className="space-y-3">
            {scheduledDebits.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isActive
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#EEAA00] flex items-center justify-center shrink-0">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-white truncate">{item.title}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                          {item.period}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {item.merchant} • Наст. списання: {item.nextDebitDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-auto">
                    <span className="font-mono text-sm font-black text-[#EEAA00]">
                      {formatCurrency(item.amount, item.currency)}
                    </span>

                    {/* Trigger instant simulation button */}
                    <button
                      onClick={() => onTriggerSimulatedDebit(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#EEAA00] text-black font-black text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center gap-1 shadow-md shadow-[#EEAA00]/10"
                      title="Симулювати миттєве списання з Dynamic Island Push"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Списати зараз</span>
                    </button>

                    <button
                      onClick={() => onDeleteDebit(item.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      title="Видалити підписку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
