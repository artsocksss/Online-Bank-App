import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Radio,
  Send,
  Smartphone,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { RadarContact, Transaction } from '../types';
import { NEARBY_RADAR_CONTACTS } from '../data/mockData';
import { formatCurrency, generateFiscalReceiptNumber } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface ShakeToPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  uahBalance: number;
  onSendMoney: (tx: Transaction, amount: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShakeToPayModal: React.FC<ShakeToPayModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  uahBalance,
  onSendMoney,
  onShowToast,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [contacts, setContacts] = useState<RadarContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<RadarContact | null>(null);
  const [amount, setAmount] = useState('200');
  const [comment, setComment] = useState('За каву ☕');

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setSelectedContact(null);
      const timer = setTimeout(() => {
        setContacts(NEARBY_RADAR_CONTACTS);
        setIsScanning(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      onShowToast('Введіть коректну суму', 'error');
      return;
    }
    if (num > uahBalance) {
      onShowToast(`Недостатньо коштів на балансі (${formatCurrency(uahBalance, 'UAH')})`, 'error');
      return;
    }

    const txId = generateFiscalReceiptNumber();
    const newTx: Transaction = {
      id: txId,
      title: `Переказ поруч (Shake-to-Pay): ${selectedContact.name}`,
      merchantName: selectedContact.name,
      category: 'Перекази',
      amount: -num,
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: '•••• 4024',
      recipientCardMask: selectedContact.cardMask,
      status: 'SUCCESS',
      fee: 0,
      comment: comment,
      mcc: '6536',
      authCode: 'SHK-' + Math.floor(100000 + Math.random() * 900000),
    };

    onSendMoney(newTx, num);
    onShowToast(`Переказ ${formatCurrency(num, 'UAH')} для ${selectedContact.name} успішно надіслано!`, 'success');
    onClose();

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Shake to Pay (Радар поруч)</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Пошук контактів поблизу для миттєвого переказу</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Radar Animation / Scanner */}
          {isScanning ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-[#EEAA00]/40 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full border-2 border-[#EEAA00] flex items-center justify-center bg-[#EEAA00]/10">
                  <Smartphone className="w-8 h-8 text-[#EEAA00] animate-bounce" />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Сканування простору поруч...</p>
                <p className="text-xs text-neutral-400 mt-1">Потрусіть смартфон або зачекайте кілька секунд</p>
              </div>
            </div>
          ) : !selectedContact ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-neutral-400">
                  Знайдено поруч ({contacts.length})
                </span>
                <button
                  onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 900);
                  }}
                  className="text-[#EEAA00] font-bold hover:underline"
                >
                  Оновити радар
                </button>
              </div>

              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-[#EEAA00] transition">
                          {contact.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {contact.bankName} • <span className="text-emerald-400">{contact.distance}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#EEAA00] opacity-0 group-hover:opacity-100 transition">
                      Обрати →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4 animate-in fade-in">
              {/* Selected Contact info */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{selectedContact.name}</p>
                    <p className="text-[11px] text-neutral-400">{selectedContact.bankName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Змінити
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Сума переказу (₴)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-base font-bold font-mono py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {['100', '200', '500', '1000'].map((chip) => (
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

              {/* Comment */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Коментар до переказу
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="За каву ☕"
                  className="w-full text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Надіслати {amount ? `${amount} ₴` : ''} без комісії</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
