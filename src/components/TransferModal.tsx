import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Landmark,
  Lock,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Currency, Transaction } from '../types';
import {
  detectBankFromCard,
  formatCardNumber,
  formatCurrency,
  formatIban,
  generateFiscalReceiptNumber,
  isValidUkrainianIban,
} from '../utils/formatters';
import { generateBankingReceiptPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialMode?: 'CARD' | 'IBAN';
  balances: Record<Currency, number>;
  activeCurrency: Currency;
  onExecuteTransfer: (tx: Transaction, deductedCurrency: Currency, amount: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  initialMode = 'CARD',
  balances,
  activeCurrency,
  onExecuteTransfer,
  onShowToast,
}) => {
  const [tab, setTab] = useState<'CARD' | 'IBAN'>(initialMode);
  
  // Card transfer fields
  const [targetCard, setTargetCard] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(activeCurrency);
  const [comment, setComment] = useState('');
  
  // IBAN transfer fields
  const [targetIban, setTargetIban] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTaxId, setRecipientTaxId] = useState('');
  const [ibanPurpose, setIbanPurpose] = useState('');

  // 2FA Security Step
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [error, setError] = useState('');

  // Success Step
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const currentBalance = balances[currency] || 0;
  const detectedBank = detectBankFromCard(targetCard);
  const numAmount = parseFloat(amount) || 0;

  // Calculate commission: 0 for Raiffeisen, 0.5% for others
  const isRaif = detectedBank.name.includes('Райффайзен');
  const fee = tab === 'CARD' ? (isRaif ? 0 : Math.max(0, numAmount * 0.005)) : 0;
  const totalDeducted = numAmount + fee;

  // Quick favorite contacts
  const quickContacts = [
    { name: 'Марина (Дружина)', card: '5375 4114 8920 1194', bank: 'monobank' },
    { name: 'Сергій К. (ФОП)', card: '5168 7422 9901 3412', bank: 'ПриватБанк' },
    { name: 'Мама', card: '4024 8812 0019 7731', bank: 'Райф' },
  ];

  const handleSelectQuickContact = (card: string, name: string) => {
    setTargetCard(card);
    setComment(`Переказ для ${name}`);
    setError('');
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'CARD') {
      const cleanCard = targetCard.replace(/\s/g, '');
      if (cleanCard.length !== 16) {
        setError('Номер банківської картки повинен містити рівно 16 цифр.');
        return;
      }
    } else {
      if (!isValidUkrainianIban(targetIban)) {
        setError('Введіть коректний рахунок IBAN формату UA + 27 символів.');
        return;
      }
      if (!recipientName.trim()) {
        setError('Вкажіть ПІБ або назву компанії отримувача.');
        return;
      }
    }

    if (numAmount <= 0) {
      setError('Сума переказу повинна бути більше 0.');
      return;
    }

    if (totalDeducted > currentBalance) {
      setError(`Недостатньо коштів на рахунку (${formatCurrency(currentBalance, currency)}).`);
      return;
    }

    // Generate 4-digit 2FA SMS Code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setIsOtpStep(true);
    setOtpTimer(60);

    onShowToast(`📱 [Raif-SMS] Код безпеки 3D-Secure: ${code}`, 'info');
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp !== generatedOtp) {
      setError('Невірний код підтвердження. Спробуйте ще раз або замовте новий.');
      return;
    }

    const txId = generateFiscalReceiptNumber();
    const title =
      tab === 'CARD'
        ? `Переказ на картку ${targetCard.slice(-9)} (${detectedBank.name.split(' ')[0]})`
        : `Платіж за IBAN: ${recipientName}`;

    const newTx: Transaction = {
      id: txId,
      title: comment || title,
      merchantName: tab === 'CARD' ? `Отримувач картки ${targetCard}` : recipientName,
      category: 'Перекази',
      amount: -numAmount,
      currency: currency,
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      recipientCardMask: tab === 'CARD' ? targetCard : undefined,
      recipientIban: tab === 'IBAN' ? targetIban : undefined,
      senderCardMask: '•••• 4024',
      status: 'SUCCESS',
      fee: fee,
      comment: comment || ibanPurpose,
      mcc: '6538',
      authCode: 'AUT-' + Math.floor(100000 + Math.random() * 900000),
    };

    onExecuteTransfer(newTx, currency, totalDeducted);
    setCompletedTx(newTx);
    setIsOtpStep(false);

    // Launch celebratory confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleReset = () => {
    setTargetCard('');
    setAmount('');
    setComment('');
    setTargetIban('');
    setRecipientName('');
    setRecipientTaxId('');
    setIbanPurpose('');
    setIsOtpStep(false);
    setUserOtp('');
    setGeneratedOtp('');
    setCompletedTx(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EEAA00] text-black font-black flex items-center justify-center text-sm shadow-md">
              R
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Платежі та перекази</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Швидкі перекази через СЕП НБУ 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* SUCCESS SCREEN */}
          {completedTx ? (
            <div className="text-center py-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-black">Платіж успішно проведено!</h3>
              <p className="text-2xl font-black text-[#EEAA00] my-2 font-mono">
                {formatCurrency(completedTx.amount, completedTx.currency)}
              </p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
                Кошти списано з рахунку та надіслано отримувачу через систему електронних платежів НБУ.
              </p>

              {/* Fiscal Meta Box */}
              <div
                className={`p-3.5 rounded-2xl border text-left text-xs mb-6 space-y-1.5 ${
                  isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-neutral-400">Номер документа:</span>
                  <span className="font-mono font-bold">{completedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Комісія банку:</span>
                  <span className="font-semibold text-emerald-400">
                    {completedTx.fee > 0 ? formatCurrency(completedTx.fee, completedTx.currency) : '0.00 ₴ (Безкоштовно)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Код авторизації:</span>
                  <span className="font-mono">{completedTx.authCode}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => generateBankingReceiptPdf(completedTx)}
                  className="w-full flex items-center justify-center gap-2 bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
                >
                  <Download className="w-4 h-4" /> Завантажити офіційну квитанцію (PDF)
                </button>
                <button
                  onClick={handleReset}
                  className={`w-full py-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode
                      ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-200'
                      : 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  Здійснити ще один переказ
                </button>
              </div>
            </div>
          ) : isOtpStep ? (
            /* 2FA OTP STEP */
            <form onSubmit={handleConfirmOtp} className="space-y-4 animate-in fade-in">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-[#EEAA00]/15 text-[#EEAA00] rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold">Підтвердження 3D-Secure</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Введіть одноразовий 4-значний код безпеки, надісланий у push-сповіщенні або SMS від Raiffeisen.
                </p>
              </div>

              {/* Demo Auto-Fill Hint */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#EEAA00]" />
                  <span>
                    Ваш тестовий код: <strong className="font-mono text-[#EEAA00] text-sm">{generatedOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUserOtp(generatedOtp)}
                  className="px-2 py-1 rounded bg-[#EEAA00] text-black font-bold text-[10px] hover:bg-[#ffb700] cursor-pointer"
                >
                  Вставити
                </button>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3.5 rounded-2xl border bg-neutral-950 border-neutral-800 text-[#EEAA00] focus:border-[#EEAA00] outline-none"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="w-1/3 py-3 rounded-xl text-xs font-semibold border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={userOtp.length !== 4}
                  className="w-2/3 py-3 rounded-xl text-xs font-bold bg-[#EEAA00] text-black hover:bg-[#ffb700] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Підтвердити списання
                </button>
              </div>
            </form>
          ) : (
            /* INITIAL FORM (Card or IBAN) */
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-xl p-1 bg-neutral-950 border border-neutral-800 mb-5">
                <button
                  type="button"
                  id="tab-transfer-card"
                  onClick={() => {
                    setTab('CARD');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'CARD' ? 'bg-[#EEAA00] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> На картку (P2P)
                </button>
                <button
                  type="button"
                  id="tab-transfer-iban"
                  onClick={() => {
                    setTab('IBAN');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'IBAN' ? 'bg-[#EEAA00] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" /> За реквізитами (IBAN)
                </button>
              </div>

              {tab === 'CARD' ? (
                /* TAB 1: CARD P2P */
                <form onSubmit={handleInitiate} className="space-y-4">
                  {/* Target Card Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Номер картки одержувача
                      </label>
                      {targetCard.replace(/\s/g, '').length >= 6 && (
                        <span className="text-[10px] text-[#EEAA00] font-semibold flex items-center gap-1">
                          Банк: {detectedBank.name}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={targetCard}
                        onChange={(e) => setTargetCard(formatCardNumber(e.target.value))}
                        className={`w-full font-mono text-sm py-3 px-4 rounded-xl border focus:outline-none transition ${
                          isDarkMode
                            ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00]'
                            : 'bg-neutral-50 border-neutral-300 text-black focus:border-[#EEAA00]'
                        }`}
                        required
                      />
                      <CreditCard className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Favorite Contacts Quick Select */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                      Часті контакти
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {quickContacts.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectQuickContact(c.card, c.name)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 text-neutral-300 whitespace-nowrap cursor-pointer transition flex items-center gap-1"
                        >
                          <Users className="w-3 h-3 text-[#EEAA00]" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount & Currency */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Сума</label>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Доступно: {formatCurrency(currentBalance, currency)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full font-bold text-base py-3 px-4 rounded-xl border focus:outline-none transition ${
                          isDarkMode
                            ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00]'
                            : 'bg-neutral-50 border-neutral-300 text-black focus:border-[#EEAA00]'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Валюта
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className={`w-full font-bold text-sm py-3 px-3 rounded-xl border focus:outline-none cursor-pointer ${
                          isDarkMode
                            ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00]'
                            : 'bg-neutral-50 border-neutral-300 text-black'
                        }`}
                      >
                        <option value="UAH">UAH (₴)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="PLN">PLN (zł)</option>
                      </select>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                      Коментар до переказу (необов'язково)
                    </label>
                    <input
                      type="text"
                      placeholder="Наприклад: За спільну вечерю"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`w-full text-xs py-2.5 px-3.5 rounded-xl border focus:outline-none ${
                        isDarkMode
                          ? 'bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00]'
                          : 'bg-neutral-50 border-neutral-300 text-black'
                      }`}
                    />
                  </div>

                  {/* Commission Summary */}
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs space-y-1">
                    <div className="flex justify-between text-neutral-400">
                      <span>Комісія за переказ:</span>
                      <span className="font-semibold text-white">
                        {fee > 0 ? `${fee.toFixed(2)} ${currency} (0.5%)` : '0.00 ₴ (В межах тарифу)'}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-1 border-t border-neutral-800">
                      <span>Разом до списання:</span>
                      <span className="text-[#EEAA00] font-mono">
                        {formatCurrency(totalDeducted, currency)}
                      </span>
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

                  <button
                    type="submit"
                    id="btn-submit-transfer"
                    className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
                  >
                    <span>Перейти до підтвердження 3DS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* TAB 2: IBAN TRANSFER */
                <form onSubmit={handleInitiate} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Рахунок отримувача (IBAN)
                    </label>
                    <input
                      type="text"
                      placeholder="UA21 3808 0500 0002 6000 0000 0000"
                      maxLength={35}
                      value={targetIban}
                      onChange={(e) => setTargetIban(formatIban(e.target.value))}
                      className="w-full font-mono text-xs py-3 px-4 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Отримувач (ПІБ / Компанія)
                      </label>
                      <input
                        type="text"
                        placeholder="ТОВ «Сервіс Плюс»"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Код ЄДРПОУ / ІПН
                      </label>
                      <input
                        type="text"
                        placeholder="14305909"
                        maxLength={10}
                        value={recipientTaxId}
                        onChange={(e) => setRecipientTaxId(e.target.value)}
                        className="w-full font-mono text-xs py-2.5 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Сума (UAH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full font-bold text-base py-3 px-4 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Призначення платежу
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Оплата за послуги згідно з рахунком №128 від 15.08.2026, без ПДВ"
                      value={ibanPurpose}
                      onChange={(e) => setIbanPurpose(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border bg-neutral-950 border-neutral-800 text-white focus:border-[#EEAA00] outline-none resize-none"
                      required
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

                  <button
                    type="submit"
                    className="w-full bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20 flex items-center justify-center gap-2"
                  >
                    <span>Відправити за СЕП НБУ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
