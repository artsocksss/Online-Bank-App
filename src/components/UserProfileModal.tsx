import React, { useState } from 'react';
import { Camera, Check, ShieldCheck, User, X } from 'lucide-react';
import { UserProfile } from '../types';
import { RaifLogo } from './RaifLogo';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  user,
  onUpdateUser,
  onShowToast,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [taxNumber, setTaxNumber] = useState(user.taxNumber);
  const [accountTier, setAccountTier] = useState(user.accountTier);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || AVATAR_PRESETS[1]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      phone,
      email,
      taxNumber,
      accountTier,
      avatarUrl,
    };
    onUpdateUser(updated);
    onShowToast('Профіль клієнта успішно збережено!', 'success');
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
            <h3 className="text-lg font-black tracking-tight">Профіль VIP-Клієнта</h3>
            <p className="text-xs text-neutral-400">Налаштування особистих даних & Дія.Підпис</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Avatar selector */}
          <div>
            <label className="block text-neutral-400 mb-2 font-bold uppercase tracking-wider text-[10px]">
              Аватарка клієнта
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#EEAA00] shadow-md shrink-0"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(p)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      avatarUrl === p ? 'border-[#EEAA00] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Прізвище та ім'я</label>
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
              <label className="block text-neutral-400 mb-1">Телефон</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">РНОКПП (ІПН)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Електронна пошта</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Статус обслуговування</label>
            <select
              value={accountTier}
              onChange={(e) => setAccountTier(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:border-[#EEAA00] outline-none"
            >
              <option value="Premium Elite">Raif Premier Elite (VIP)</option>
              <option value="Gold">Raif Gold Club</option>
              <option value="Black">Raif Black Edition</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Верифікація через Дія.Шеринг
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
              АКТИВНО
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#EEAA00] text-black font-extrabold py-3.5 rounded-2xl text-xs hover:bg-yellow-400 transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
          >
            Зберегти дані профілю
          </button>
        </form>
      </div>
    </div>
  );
};
