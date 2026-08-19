import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: UserProfile;
  transactions: Transaction[];
  uahBalance: number;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  user,
  transactions,
  uahBalance,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Вітаю, ${user.name}! Я ваш персональний фінансовий та кіберасистент Raif Premier. Чим можу допомогти щодо аналітики витрат, безпеки рахунків або інвестицій?`,
      timestamp: 'Щойно',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('безпек') || lower.includes('ризик') || lower.includes('кібер')) {
        reply = `🛡️ **Аудит кібербезпеки вашого акаунту (98% / Відмінно)**:
• Двоетапна автентифікація 3D-Secure 2.0: **Активна**
• Біометричний вхід (FaceID / TouchID): **Увімкнено**
• Захист від подвійної конвертації (DCC): **Працює**
• Добовий ліміт онлайн-платежів: **50 000 ₴**
Всі сесії авторизовані через захищений шлюз NBU SEP.`;
      } else if (lower.includes('витрат') || lower.includes('продукт') || lower.includes('сільпо') || lower.includes('супермаркет')) {
        const foodExpenses = transactions
          .filter((t) => t.category === 'Продукти' && t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        reply = `🛒 **Аналітика витрат на продукти за серпень 2026**:
Ви витратили **${formatCurrency(foodExpenses || 1420.5, 'UAH')}** на покупки в категоріях Продукти та супермаркети.
Нараховано кешбеку: **+${(foodExpenses * 0.02).toFixed(2)} ₴** (2%). Витрати в межах вашого звичайного місячного ліміту!`;
      } else if (lower.includes('прогноз') || lower.includes('залишок') || lower.includes('кінець місяця')) {
        reply = `📈 **Фінансовий прогноз до 31 серпня**:
Поточний баланс: **${formatCurrency(uahBalance, 'UAH')}**.
Середньодобові витрати: ~850 ₴.
Очікуваний залишок на кінець місяця: **${formatCurrency(Math.max(0, uahBalance - 11050), 'UAH')}**.
Рекомендую відкласти 10% у «Банку» на подушку безпеки під депозитні відсотки.`;
      } else if (lower.includes('облігац') || lower.includes('овдп') || lower.includes('інвест')) {
        reply = `🇺🇦 **Військові облігації (ОВДП України)**:
Найбільш дохідні випуски зараз:
1. **«Ялта»** — 17.2% річних (виплата 2028 р.)
2. **«Бахмут»** — 16.5% річних (виплата 2027 р.)
Дохід на 100% гарантований державою та не оподатковується. Ви можете придбати їх у розділі «Облігації» за 1 клік!`;
      } else {
        reply = `Я проаналізував ваш запит. Наразі ваші рахунки активні, баланс складає ${formatCurrency(
          uahBalance,
          'UAH'
        )}, а всі операції підтверджені електронним цифровим підписом. Бажаєте сформувати офіційну PDF-виписку?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-none">Raif Cyber AI Асистент</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">Розумний фінансовий радник та кібермоніторинг</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-neutral-800 text-[#EEAA00] flex items-center justify-center shrink-0 border border-neutral-700">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#EEAA00] text-black font-semibold rounded-br-xs'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-xs whitespace-pre-line'
                }`}
              >
                {m.text}
                <span
                  className={`block text-[9px] mt-1.5 opacity-60 text-right ${
                    m.sender === 'user' ? 'text-black' : 'text-neutral-500'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 text-[#EEAA00] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                Raif AI аналізує виписку та формує звіт...
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0 space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              '🛒 Скільки витрачено на продукти?',
              '🛡️ Перевір мою кібербезпеку',
              '📈 Спрогнозуй залишок на кінець місяця',
              '🇺🇦 Як придбати військові облігації?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-medium text-neutral-300 whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Запитайте AI про витрати, безпеку чи заощадження..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs py-3 px-4 rounded-xl border bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#EEAA00] outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-[#EEAA00] text-black font-bold rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
