import React, { useState } from 'react';
import {
  Check,
  Download,
  Edit3,
  FileCheck,
  FileText,
  Key,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { BankCard, Transaction, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { generateBankingReceiptPdf } from '../utils/pdfGenerator';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  cards: BankCard[];
  transactions: Transaction[];
  user: UserProfile;
  onUpdateCards: (newCards: BankCard[]) => void;
  onUpdateTransactions: (newTxs: Transaction[]) => void;
  onUpdateUser: (newUser: UserProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  cards,
  transactions,
  user,
  onUpdateCards,
  onUpdateTransactions,
  onUpdateUser,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'TRANSACTIONS' | 'RECEIPTS' | 'API_KEYS'>('BALANCES');

  // Balances state
  const [editingCardId, setEditingCardId] = useState<string>(cards[0]?.id || '');
  const [customBalance, setCustomBalance] = useState<string>('');

  // Custom Transaction & Metadata state
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newTxTitle, setNewTxTitle] = useState('Переказ за послуги Premier');
  const [newTxMerchant, setNewTxMerchant] = useState('Raiffeisen Staff Terminal');
  const [newTxAmount, setNewTxAmount] = useState('1500');
  const [newTxCategory, setNewTxCategory] = useState<any>('Зарплата');
  const [newTxStatus, setNewTxStatus] = useState<'SUCCESS' | 'PENDING' | 'FAILED'>('SUCCESS');
  const [newTxAuthCode, setNewTxAuthCode] = useState('STAFF-994821');

  // Mock Receipt Generator state
  const [receiptTxId, setReceiptTxId] = useState<string>(transactions[0]?.id || '');
  const [customReceiptTitle, setCustomReceiptTitle] = useState('Тестова оплата в Сільпо');
  const [customReceiptMerchant, setCustomReceiptMerchant] = useState('ТОВ Сільпо-Фуд КЕП');
  const [customReceiptAmount, setCustomReceiptAmount] = useState('450.00');
  const [customReceiptAuthCode, setCustomReceiptAuthCode] = useState('AUTH-782109');

  // API Key state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('raif_custom_api_key') || 'RAIF-PROD-LIVE-9824-KEY');

  if (!isOpen) return null;

  const handleSaveBalance = (cardId: string, valueToSet?: number) => {
    const val = valueToSet !== undefined ? valueToSet : parseFloat(customBalance);
    if (isNaN(val)) return;

    const updatedCards = cards.map((c) => (c.id === cardId ? { ...c, balance: val } : c));
    onUpdateCards(updatedCards);
    onShowToast(`Баланс картки оновлено до ${formatCurrency(val, 'UAH')}`, 'success');
    setCustomBalance('');
  };

  const handleAddCustomTransaction = () => {
    const amt = parseFloat(newTxAmount);
    if (isNaN(amt)) return;

    const newTx: Transaction = {
      id: 'STAFF-' + Date.now().toString().slice(-6),
      title: newTxTitle,
      merchantName: newTxMerchant,
      category: newTxCategory,
      amount: amt,
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: newTxStatus,
      fee: 0,
      authCode: newTxAuthCode || ('STAFF-' + Math.floor(100000 + Math.random() * 900000)),
    };

    onUpdateTransactions([newTx, ...transactions]);
    onShowToast(`Транзакцію «${newTxTitle}» додано в реєстр`, 'success');
  };

  const handleDeleteTransaction = (txId: string) => {
    onUpdateTransactions(transactions.filter((t) => t.id !== txId));
    onShowToast('Транзакцію видалено з реєстру', 'info');
  };

  const handleGenerateMockReceipt = () => {
    const selectedTx = transactions.find((t) => t.id === receiptTxId);

    const mockTx: Transaction = selectedTx || {
      id: 'MOCK-' + Date.now().toString().slice(-6),
      title: customReceiptTitle,
      merchantName: customReceiptMerchant,
      category: 'Продукти',
      amount: -Math.abs(parseFloat(customReceiptAmount) || 100),
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      fee: 0,
      authCode: customReceiptAuthCode || 'AUTH-554411',
    };

    generateBankingReceiptPdf(mockTx);
    onShowToast(`Офіційну квитанцію для «${mockTx.title}» згенеровано у PDF!`, 'success');
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('raif_custom_api_key', apiKey);
    onShowToast('API Ключ та конфігурацію збережено!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-sans">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col ${
          isDarkMode ? 'bg-neutral-900 border-amber-500/30 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center shadow-lg shadow-[#EEAA00]/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">Адмін-Панель & Staff Control</h3>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-[#EEAA00] border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Редагування балансів, метаданих транзакцій та генерація квитанцій
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

        {/* Compact Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/70 px-3 gap-1 overflow-x-auto">
          {[
            { id: 'BALANCES', label: 'Баланси', icon: Wallet },
            { id: 'TRANSACTIONS', label: 'Метадані транзакцій', icon: Sliders },
            { id: 'RECEIPTS', label: 'Генератор квитанцій', icon: FileCheck },
            { id: 'API_KEYS', label: 'API Ключі', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3 font-extrabold text-xs flex items-center gap-1.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#EEAA00] text-[#EEAA00] bg-neutral-900/60'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: BALANCES */}
          {activeTab === 'BALANCES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider">
                  Редагування балансу карток
                </h4>
                <span className="text-[10px] text-neutral-500 font-mono">Активних карток: {cards.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cards.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-white">{c.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {c.cardMask} • {c.currency}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-black text-[#EEAA00]">
                        {formatCurrency(c.balance, c.currency)}
                      </span>
                    </div>

                    {/* Quick presets */}
                    <div className="flex gap-1.5 text-[10px] font-mono">
                      <button
                        onClick={() => handleSaveBalance(c.id, c.balance + 10000)}
                        className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 cursor-pointer"
                      >
                        +10k
                      </button>
                      <button
                        onClick={() => handleSaveBalance(c.id, c.balance + 50000)}
                        className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 cursor-pointer"
                      >
                        +50k
                      </button>
                      <button
                        onClick={() => handleSaveBalance(c.id, 100000)}
                        className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 cursor-pointer"
                      >
                        =100k
                      </button>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Введіть точний баланс..."
                        value={editingCardId === c.id ? customBalance : ''}
                        onChange={(e) => {
                          setEditingCardId(c.id);
                          setCustomBalance(e.target.value);
                        }}
                        className="flex-1 text-xs font-mono font-bold py-1.5 px-3 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                      />
                      <button
                        onClick={() => handleSaveBalance(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#EEAA00] text-black font-black text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Зберегти</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS METADATA */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              {/* Form to create / add custom transaction */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#EEAA00] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Додати транзакцію із метаданими
                  </h4>
                  <span className="text-[10px] text-neutral-500">Staff Metadata Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Призначення</label>
                    <input
                      type="text"
                      value={newTxTitle}
                      onChange={(e) => setNewTxTitle(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Мерчант / Отримувач</label>
                    <input
                      type="text"
                      value={newTxMerchant}
                      onChange={(e) => setNewTxMerchant(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Сума (₴)</label>
                    <input
                      type="number"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Категорія</label>
                    <select
                      value={newTxCategory}
                      onChange={(e) => setNewTxCategory(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    >
                      <option value="Зарплата">Зарплата</option>
                      <option value="Перекази">Перекази</option>
                      <option value="Продукти">Продукти</option>
                      <option value="Комунальні послуги">Комунальні послуги</option>
                      <option value="Благодійність ЗСУ">Благодійність ЗСУ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Статус</label>
                    <select
                      value={newTxStatus}
                      onChange={(e) => setNewTxStatus(e.target.value as any)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    >
                      <option value="SUCCESS">SUCCESS (Успішно)</option>
                      <option value="PENDING">PENDING (В обробці)</option>
                      <option value="FAILED">FAILED (Відхилено)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">Код авторизації</label>
                    <input
                      type="text"
                      value={newTxAuthCode}
                      onChange={(e) => setNewTxAuthCode(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddCustomTransaction}
                  className="w-full py-2 rounded-xl bg-[#EEAA00] text-black font-black text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Додати транзакцію
                </button>
              </div>

              {/* Transactions Metadata List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider">
                  Реєстр транзакцій ({transactions.length})
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate">{tx.title}</p>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                              tx.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : tx.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {tx.date} • {tx.merchantName} • Auth: {tx.authCode || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-neutral-200'}`}>
                          {formatCurrency(tx.amount, tx.currency, true)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                          title="Видалити транзакцію"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOCK RECEIPTS GENERATOR */}
          {activeTab === 'RECEIPTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#EEAA00]" /> Генератор банківських квитанцій (PDF)
                  </h4>
                  <span className="text-[10px] text-[#EEAA00] font-mono">Печатка КЕП НБУ №10</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                      Оберіть існуючу транзакцію для друку:
                    </label>
                    <select
                      value={receiptTxId}
                      onChange={(e) => setReceiptTxId(e.target.value)}
                      className="w-full text-xs font-bold py-2 px-3 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                    >
                      {transactions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({formatCurrency(t.amount, t.currency)}) — {t.date}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-neutral-800 pt-3">
                    <p className="text-[11px] font-bold text-neutral-400 mb-2">Або введіть довільні параметри квитанції:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Призначення платежу</label>
                        <input
                          type="text"
                          value={customReceiptTitle}
                          onChange={(e) => setCustomReceiptTitle(e.target.value)}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Мерчант / Отримувач</label>
                        <input
                          type="text"
                          value={customReceiptMerchant}
                          onChange={(e) => setCustomReceiptMerchant(e.target.value)}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Сума (₴)</label>
                        <input
                          type="number"
                          value={customReceiptAmount}
                          onChange={(e) => setCustomReceiptAmount(e.target.value)}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-1">Код авторизації</label>
                        <input
                          type="text"
                          value={customReceiptAuthCode}
                          onChange={(e) => setCustomReceiptAuthCode(e.target.value)}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateMockReceipt}
                    className="w-full py-2.5 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#EEAA00]/10"
                  >
                    <Download className="w-4 h-4" /> Згенерувати та завантажити офіційний PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API KEYS */}
          {activeTab === 'API_KEYS' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider">
                API Ключі та збереження стану
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Забережіть ваші персональні налаштування. При передачі додатка вашим друзям збережені параметри дозволять зберегти модифікований стан додатка.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <label className="text-xs font-bold text-neutral-300 block">Персональний API Ключ Доступу</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 text-xs font-mono font-bold py-2 px-3 rounded-xl border bg-neutral-900 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl bg-[#EEAA00] text-black font-extrabold text-xs hover:bg-[#ffb700] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Зберегти</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
