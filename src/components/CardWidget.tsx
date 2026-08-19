import React, { useState, useRef } from 'react';
import {
  Apple,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Lock,
  Palette,
  Plus,
  RotateCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  Wifi,
} from 'lucide-react';
import { BankCard, CardSkin } from '../types';
import { formatCurrency, formatIban } from '../utils/formatters';
import { RaifLogo } from './RaifLogo';

interface CardWidgetProps {
  cards: BankCard[];
  activeCardIndex: number;
  onSelectCard: (index: number) => void;
  onToggleFreeze: (cardId: string) => void;
  onChangeSkin: (cardId: string, skin: CardSkin) => void;
  onOpenCardSettings: () => void;
  onAddNewCard?: () => void;
  onDeleteCard?: (cardId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  isDarkMode: boolean;
}

export const CardWidget: React.FC<CardWidgetProps> = ({
  cards,
  activeCardIndex,
  onSelectCard,
  onToggleFreeze,
  onChangeSkin,
  onOpenCardSettings,
  onAddNewCard,
  onDeleteCard,
  onShowToast,
  isDarkMode,
}) => {
  const card = cards[activeCardIndex] || cards[0];

  const [isFlipped, setIsFlipped] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 3D Tilt calculation
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`${label} скопійовано в буфер обміну`, 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Card Skins definition
  const getSkinClasses = (skin: CardSkin) => {
    switch (skin) {
      case 'raif-yellow':
        return 'bg-gradient-to-tr from-yellow-500 via-[#EEAA00] to-amber-200 text-black border-amber-400/60 shadow-amber-500/30';
      case 'titanium-credit':
        return 'bg-gradient-to-tr from-slate-900 via-slate-800 to-zinc-600 text-white border-slate-500/50 shadow-slate-900/40';
      case 'gold-titanium':
        return 'bg-gradient-to-tr from-amber-600 via-[#EEAA00] to-yellow-200 text-black border-amber-300/40 shadow-amber-500/20';
      case 'obsidian-black':
        return 'bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 text-white border-neutral-700/60 shadow-black/40';
      case 'emerald-luxury':
        return 'bg-gradient-to-tr from-emerald-950 via-emerald-800 to-teal-600 text-white border-emerald-400/40 shadow-emerald-900/30';
      case 'patriotic-yellow-blue':
        return 'bg-gradient-to-tr from-blue-900 via-sky-700 to-amber-400 text-white border-sky-400/40 shadow-blue-900/30';
      case 'cyber-neon':
        return 'bg-gradient-to-tr from-purple-950 via-indigo-900 to-cyan-500 text-white border-cyan-400/40 shadow-cyan-900/30';
      default:
        return 'bg-neutral-900 text-white border-neutral-800';
    }
  };

  const isLightSkin = card.skin === 'gold-titanium' || card.skin === 'raif-yellow';

  return (
    <div className="space-y-4">
      {/* Top Cards Switcher Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-[80%]">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                onSelectCard(idx);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                idx === activeCardIndex
                  ? 'bg-[#EEAA00] text-black shadow-md shadow-[#EEAA00]/20'
                  : isDarkMode
                  ? 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400'
                  : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{c.name.split(' ')[0]}</span>
              <span className="opacity-70 font-mono text-[10px]">{c.cardMask.slice(-4)}</span>
            </button>
          ))}

          {onAddNewCard && (
            <button
              onClick={onAddNewCard}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#EEAA00] text-xs font-bold hover:bg-amber-500/20 transition whitespace-nowrap cursor-pointer flex items-center gap-1"
              title="Відкрити нову картку"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Нова</span>
            </button>
          )}
        </div>

        {/* Carousel Prev/Next Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectCard((activeCardIndex - 1 + cards.length) % cards.length)}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Попередня картка"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectCard((activeCardIndex + 1) % cards.length)}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Наступна картка"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D TILT CARD CONTAINER */}
      <div
        style={{ perspective: 1100 }}
        className="w-full relative select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
            transformStyle: 'preserve-3d',
            transition: isFlipped ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.1s ease-out',
          }}
          className={`w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 relative border shadow-2xl transition-shadow duration-300 overflow-hidden ${getSkinClasses(
            card.skin
          )}`}
        >
          {/* Holographic Dynamic Glare */}
          <div
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)`,
            }}
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
          />

          {/* FROZEN OVERLAY */}
          {card.isFrozen && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white p-4 animate-in fade-in">
              <Lock className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
              <p className="font-extrabold text-sm tracking-wide uppercase">Картка тимчасово заблокована</p>
              <p className="text-xs text-neutral-400 mt-1 text-center max-w-xs">
                Усі транзакції та зняття готівки зупинено в цілях безпеки
              </p>
              <button
                onClick={() => onToggleFreeze(card.id)}
                className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
              >
                Розблокувати в 1 клік
              </button>
            </div>
          )}

          {/* FRONT FACE */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={`absolute inset-0 p-6 sm:p-7 flex flex-col justify-between z-10 ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Top row: Brand & Tier & NFC */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight">Raiffeisen</span>
                  <span
                    className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded tracking-widest ${
                      isLightSkin ? 'bg-black text-[#EEAA00]' : 'bg-[#EEAA00] text-black'
                    }`}
                  >
                    PREMIER
                  </span>
                </div>
                <p className="text-[10px] opacity-80 tracking-wider font-semibold mt-0.5">{card.tier}</p>
              </div>

              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 rotate-90 opacity-90" />
                <div
                  className={`w-10 h-7 rounded-md border flex items-center justify-center ${
                    isLightSkin ? 'border-black/30 bg-black/10' : 'border-white/30 bg-white/10'
                  }`}
                >
                  <div className="w-6 h-4 rounded-xs border border-current opacity-70 grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="border border-current rounded-2xs" />
                    <div className="border border-current rounded-2xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle row: Card Number */}
            <div className="space-y-1 my-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-70">Номер картки</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSensitive(!showSensitive);
                  }}
                  className="flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100 transition cursor-pointer"
                >
                  {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSensitive ? 'Сховати' : 'Показати'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between font-mono text-lg sm:text-2xl font-bold tracking-widest">
                <span>{showSensitive ? card.cardNumber : card.cardNumber.replace(/\d{4} \d{4} \d{4}/, '•••• •••• ••••')}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(card.cardNumber.replace(/\s+/g, ''), 'Номер картки');
                  }}
                  className="p-1 rounded-md hover:bg-black/10 transition cursor-pointer"
                  title="Копіювати номер картки"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom row: Cardholder, Expiry, Payment System Logo */}
            <div className="flex justify-between items-end text-xs font-mono">
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-70">Власник</p>
                <p className="font-bold tracking-wider uppercase">{showSensitive ? 'OLEKSANDR KOVALENKO' : 'O••••••• K••••••••'}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-70">Діє до</p>
                <p className="font-bold tracking-wider">{card.expiry}</p>
              </div>

              <div className="flex items-center">
                {card.tier.includes('Visa') ? (
                  <span className="font-black italic text-xl tracking-tighter">VISA</span>
                ) : (
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-red-600/90" />
                    <div className="w-6 h-6 rounded-full bg-amber-400/90" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 flex flex-col justify-between z-10 ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-10 bg-neutral-950 mt-4 shadow-inner" />

            {/* CVV & Signature Area */}
            <div className="px-6 py-2 space-y-2">
              <div className="bg-white/90 text-neutral-900 rounded p-2 flex justify-between items-center font-mono">
                <span className="text-[10px] text-neutral-500 italic">Служба підтримки 0 800 500 500</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase text-neutral-600">CVV2</span>
                  <span className="font-black text-sm tracking-widest text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                    {showSensitive ? card.cvv : '•••'}
                  </span>
                </div>
              </div>

              {/* Custom PIN Code & 3D-Secure Controls on Card Back */}
              <div className="flex items-center justify-between text-[10px] bg-black/40 backdrop-blur-xs p-2 rounded-xl text-white font-mono border border-white/20">
                <span>PIN-код: <strong className="text-[#EEAA00]">{card.pinCode || '4024'}</strong></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCardSettings();
                  }}
                  className="px-2 py-0.5 rounded bg-[#EEAA00] text-black font-extrabold hover:bg-yellow-300 transition cursor-pointer"
                >
                  Змінити PIN / 3DS
                </button>
              </div>

              <p className="text-[9px] opacity-70 text-center mt-1">
                АТ «Райффайзен Банк». Ліцензія НБУ №10 від 18.06.2018. Захищено 3D-Secure 2.0
              </p>
            </div>

            {/* Hologram Stamp */}
            <div className="px-6 pb-5 flex justify-between items-center text-[10px]">
              <span className="font-bold">Authorized Signature</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 opacity-80 flex items-center justify-center font-bold text-[8px] text-black">
                SECURE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD INTERACTIVE CONTROL BAR */}
      <div className="grid grid-cols-4 gap-2">
        {/* Flip Button */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
        >
          <RotateCw className="w-4 h-4 text-[#EEAA00]" />
          <span>{isFlipped ? 'Лицьова' : 'Зворот'}</span>
        </button>

        {/* Change Skin */}
        <button
          onClick={() => setShowSkinPicker(!showSkinPicker)}
          className="p-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
        >
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Скін картки</span>
        </button>

        {/* Apple / Google Pay */}
        <button
          onClick={() => {
            onShowToast('Картку успішно синхронізовано з Apple Pay / Google Wallet', 'success');
          }}
          className="p-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
        >
          <Apple className="w-4 h-4 text-white" />
          <span>Apple Pay</span>
        </button>

        {/* Card Security / Settings */}
        <button
          onClick={onOpenCardSettings}
          className="p-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Безпека</span>
        </button>
      </div>

      {/* SKIN PICKER POPUP */}
      {showSkinPicker && (
        <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-950 animate-in fade-in space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Оберіть скін картки</span>
            <button
              onClick={() => setShowSkinPicker(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Закрити
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[
              { id: 'raif-yellow', name: 'Raif Yellow', color: 'bg-[#EEAA00]' },
              { id: 'gold-titanium', name: 'Gold Titanium', color: 'bg-amber-500' },
              { id: 'obsidian-black', name: 'Obsidian Black', color: 'bg-neutral-900 border border-neutral-700' },
              { id: 'titanium-credit', name: 'Titanium Credit', color: 'bg-slate-700' },
              { id: 'emerald-luxury', name: 'Emerald Luxe', color: 'bg-emerald-600' },
              { id: 'patriotic-yellow-blue', name: 'UA Flag', color: 'bg-gradient-to-r from-blue-600 to-yellow-400' },
              { id: 'cyber-neon', name: 'Cyber Neon', color: 'bg-gradient-to-r from-purple-600 to-cyan-400' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChangeSkin(card.id, s.id as CardSkin);
                  setShowSkinPicker(false);
                  onShowToast(`Скін «${s.name}» встановлено`, 'info');
                }}
                className={`h-8 rounded-xl ${s.color} transition transform hover:scale-105 cursor-pointer relative flex items-center justify-center shadow`}
              >
                {card.skin === s.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BALANCE & CREDIT LIMIT WIDGET */}
      <div
        className={`p-5 rounded-3xl border ${
          isDarkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Доступний баланс</span>
            <p className="text-3xl font-black font-mono text-white mt-0.5">
              {formatCurrency(card.balance, card.currency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(card.iban, 'IBAN')}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono font-bold text-[#EEAA00] transition cursor-pointer flex items-center gap-1.5"
              title="Копіювати повний рахунок IBAN"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>IBAN</span>
            </button>

            {cards.length > 1 && onDeleteCard && (
              <button
                onClick={() => {
                  if (confirm(`Ви впевнені, що хочете видалити/закрити картку ${card.name}?`)) {
                    onDeleteCard(card.id);
                  }
                }}
                className="p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                title="Видалити картку"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Credit Limit & Grace Period (if applicable) */}
        {card.creditLimit > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">
                Кредитний ліміт: <strong className="text-white font-mono">{formatCurrency(card.creditLimit, card.currency)}</strong>
              </span>
              <span className="text-[#EEAA00] font-bold">
                Пільговий період: {card.gracePeriodDays} днів
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-[#EEAA00] rounded-full"
                style={{ width: `${Math.min(100, (card.balance / card.creditLimit) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#EEAA00]" />
              <span>0% річних за умови погашення до {card.gracePeriodDate}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
