import React from 'react';
import {
  ArrowLeftRight,
  Bot,
  CreditCard,
  FileText,
  Gift,
  HeartHandshake,
  Landmark,
  Radio,
  Receipt,
  RotateCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  Split,
  Vault,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  isDarkMode: boolean;
  onOpenTransfer: (mode: 'CARD' | 'IBAN') => void;
  onOpenExchange: () => void;
  onOpenJars: () => void;
  onOpenCashback: () => void;
  onOpenUtilities: (category?: string) => void;
  onOpenInstallments: () => void;
  onOpenMilitaryBonds: () => void;
  onOpenShakeToPay: () => void;
  onOpenAiAssistant: () => void;
  onOpenCardSettings: () => void;
  onOpenGoogleDocs?: () => void;
  onOpenCreditSystem?: () => void;
  cashbackTotalAvailable: number;
  jarsCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  isDarkMode,
  onOpenTransfer,
  onOpenExchange,
  onOpenJars,
  onOpenCashback,
  onOpenUtilities,
  onOpenInstallments,
  onOpenMilitaryBonds,
  onOpenShakeToPay,
  onOpenAiAssistant,
  onOpenCardSettings,
  onOpenGoogleDocs,
  onOpenCreditSystem,
  cashbackTotalAvailable,
  jarsCount,
}) => {
  const actions = [
    {
      id: 'p2p',
      label: 'На картку',
      sub: 'P2P переказ',
      icon: CreditCard,
      onClick: () => onOpenTransfer('CARD'),
      badge: '0%',
      color: 'text-[#EEAA00]',
    },
    {
      id: 'iban',
      label: 'За IBAN',
      sub: 'СЕП НБУ 24/7',
      icon: Landmark,
      onClick: () => onOpenTransfer('IBAN'),
      color: 'text-amber-400',
    },
    {
      id: 'exchange',
      label: 'Обмін валют',
      sub: 'FX онлайн',
      icon: ArrowLeftRight,
      onClick: onOpenExchange,
      color: 'text-emerald-400',
    },
    {
      id: 'jars',
      label: 'Банка',
      sub: `${jarsCount} активні цілі`,
      icon: Vault,
      onClick: onOpenJars,
      badge: `${jarsCount}`,
      color: 'text-yellow-400',
    },
    {
      id: 'installments',
      label: 'Розстрочка',
      sub: 'Частинами 0%',
      icon: Split,
      onClick: onOpenInstallments,
      badge: '0.01%',
      color: 'text-purple-400',
    },
    {
      id: 'creditSystem',
      label: 'Кредити',
      sub: 'Готівкою за 1 хв',
      icon: CreditCard,
      onClick: () => onOpenCreditSystem?.(),
      badge: 'ТОП',
      color: 'text-emerald-400',
    },
    {
      id: 'bonds',
      label: 'Облігації',
      sub: 'ОВДП 17.2%',
      icon: Shield,
      onClick: onOpenMilitaryBonds,
      badge: '17.2%',
      color: 'text-blue-400',
    },
    {
      id: 'shake',
      label: 'Shake-to-Pay',
      sub: 'Радар поруч',
      icon: Radio,
      onClick: onOpenShakeToPay,
      color: 'text-pink-400',
    },
    {
      id: 'cashback',
      label: 'Кешбек',
      sub: cashbackTotalAvailable > 0 ? `${cashbackTotalAvailable.toFixed(2)} ₴` : 'до 20%',
      icon: Gift,
      onClick: onOpenCashback,
      badge: cashbackTotalAvailable > 0 ? `${cashbackTotalAvailable.toFixed(0)} ₴` : undefined,
      color: 'text-rose-400',
    },
    {
      id: 'utilities',
      label: 'Комуналка',
      sub: 'Yasno, ДТЕК, Газ',
      icon: Zap,
      onClick: () => onOpenUtilities('UTILITIES'),
      color: 'text-orange-400',
    },
    {
      id: 'zsu',
      label: 'Донати ЗСУ',
      sub: 'Повернись живим',
      icon: HeartHandshake,
      onClick: () => onOpenUtilities('ЗСУ'),
      badge: '🇺🇦',
      color: 'text-sky-400',
    },
    {
      id: 'ai',
      label: 'Raif AI',
      sub: 'Кіберасистент',
      icon: Bot,
      onClick: onOpenAiAssistant,
      badge: 'AI',
      color: 'text-cyan-400',
    },
    {
      id: 'security',
      label: 'Безпека',
      sub: 'Ліміти та PIN',
      icon: ShieldCheck,
      onClick: onOpenCardSettings,
      color: 'text-emerald-400',
    },
    {
      id: 'googleDocs',
      label: 'Google Docs',
      sub: 'Виписки & Звіти',
      icon: FileText,
      onClick: () => onOpenGoogleDocs?.(),
      badge: 'Docs',
      color: 'text-blue-400',
    },
  ];

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Швидкі операції</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Миттєві фінансові послуги в 1 клік</p>
        </div>
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between group cursor-pointer relative ${
                isDarkMode
                  ? 'border-neutral-800/80 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-700'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              {/* Badge if present */}
              {action.badge && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#EEAA00] text-black shadow-xs">
                  {action.badge}
                </span>
              )}

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition transform group-hover:scale-110 ${
                  isDarkMode ? 'bg-neutral-950' : 'bg-white shadow-xs'
                }`}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>

              <div className="w-full text-center">
                <p className="text-xs font-bold leading-tight group-hover:text-[#EEAA00] transition truncate">
                  {action.label}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{action.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
