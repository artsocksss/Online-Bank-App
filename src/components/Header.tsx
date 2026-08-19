import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  LogOut,
  Moon,
  PhoneCall,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { Currency, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  user: UserProfile;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  selectedCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  balances: Record<Currency, number>;
  onOpenCardSettings: () => void;
  onOpenNotificationsDrawer: () => void;
  onOpenAdminPanel: () => void;
  onOpenCreditSystem: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isDarkMode,
  onToggleTheme,
  onLogout,
  selectedCurrency,
  onSelectCurrency,
  balances,
  onOpenCardSettings,
  onOpenNotificationsDrawer,
  onOpenAdminPanel,
  onOpenCreditSystem,
}) => {
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Зараховано кешбек за категорією «АЗС»: +55.50 ₴', time: '10 хв тому' },
    { id: 2, text: 'Успішне підтвердження 3D Secure для покупки в «Сільпо»', time: '14:15' },
    { id: 3, text: 'Курс USD оновлено на сьогодні: 41.35 / 41.85 ₴', time: '09:00' },
  ];

  return (
    <>
      <header
        id="bank-main-header"
        className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          isDarkMode
            ? 'bg-neutral-950/90 border-neutral-800/80 text-white'
            : 'bg-white/90 border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Bank Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#EEAA00] text-black font-black text-xl flex items-center justify-center rounded-xl shadow-lg shadow-[#EEAA00]/20 select-none">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">Raiffeisen</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#EEAA00]/15 text-[#EEAA00] border border-[#EEAA00]/30 uppercase tracking-wide">
                  Premier
                </span>
              </div>
              <p className={`text-[11px] font-medium leading-none mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Офіційний веб-банкінг • НБУ №10
              </p>
            </div>
          </div>

          {/* Quick Currency Bar (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl border bg-neutral-900/40 border-neutral-800">
            {(['UAH', 'USD', 'EUR', 'PLN'] as Currency[]).map((cur) => {
              const isSelected = selectedCurrency === cur;
              return (
                <button
                  key={cur}
                  id={`btn-currency-${cur}`}
                  onClick={() => onSelectCurrency(cur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#EEAA00] text-black shadow-sm'
                      : isDarkMode
                      ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>{cur}</span>
                  <span className="text-[11px] opacity-80 font-mono">
                    {formatCurrency(balances[cur] || 0, cur)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-2.5">
            {/* Personal Manager Button */}
            <button
              id="btn-personal-manager"
              onClick={() => setShowManagerModal(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 text-neutral-300'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Персональний банкір"
            >
              <img
                src={user.personalManager.avatar}
                alt="Manager"
                className="w-5 h-5 rounded-full object-cover border border-[#EEAA00]/40"
              />
              <span className="hidden lg:inline font-semibold">Менеджер: {user.personalManager.name.split(' ')[0]}</span>
            </button>

            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotificationsDrawer}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 text-neutral-300'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Центр сповіщень (Свайп-видалення)"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EEAA00] rounded-full animate-pulse" />
            </button>

            {/* Admin Panel Trigger Pill */}
            <button
              id="btn-admin-panel"
              onClick={onOpenAdminPanel}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-[#EEAA00] border border-amber-500/30 text-xs font-black hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1"
              title="Адмін-панель керування"
            >
              <span>АДМІН</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 text-amber-400'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Перемкнути тему (Світла / Темна)"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Pill */}
            <div
              className={`flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border ${
                isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/90 text-white'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-900'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#EEAA00] to-amber-300 text-black flex items-center justify-center font-bold text-xs shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] text-[#EEAA00] font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> {user.accountTier}
                </p>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                title="Вийти з банкінгу"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Personal Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl relative ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <img
                  src={user.personalManager.avatar}
                  alt={user.personalManager.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#EEAA00] shadow-lg shadow-[#EEAA00]/20"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
              </div>
              <h3 className="text-base font-bold">{user.personalManager.name}</h3>
              <p className="text-xs text-[#EEAA00] font-semibold mt-0.5">Персональний преміум-банкір</p>
              <p className="text-xs text-neutral-400 mt-2 px-2">
                Допомога у відкритті валютних рахунків, розміщенні депозитів, SWIFT/SEPA переказах та VIP-обслуговуванні.
              </p>

              <div className="mt-5 space-y-2.5">
                <a
                  href={`tel:${user.personalManager.phone.replace(/\D/g, '')}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#EEAA00] text-black font-bold py-3 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-md"
                >
                  <PhoneCall className="w-4 h-4" /> Зателефонувати менеджеру
                </a>
                <button
                  onClick={() => setShowManagerModal(false)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
