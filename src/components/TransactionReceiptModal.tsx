import React from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { generateBankingReceiptPdf } from '../utils/pdfGenerator';

interface TransactionReceiptModalProps {
  tx: Transaction | null;
  onClose: () => void;
  isDarkMode: boolean;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  tx,
  onClose,
  isDarkMode,
  onShowToast,
}) => {
  if (!tx) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(tx.id);
    onShowToast(`Номер документа ${tx.id} скопійовано в буфер`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header Ribbon */}
        <div className="bg-[#EEAA00] text-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-base">Raiffeisen</span>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 bg-black text-[#EEAA00] rounded">
              Квитанція
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-black hover:bg-black/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          {/* Main Amount */}
          <div className="text-center py-2">
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Сума транзакції</p>
            <p
              className={`text-3xl font-black font-mono mt-1 ${
                tx.amount > 0 ? 'text-emerald-400' : isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {formatCurrency(tx.amount, tx.currency, true)}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Проведено через СЕП НБУ</span>
            </div>
          </div>

          {/* Details Table */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
              isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Номер документа:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                <span>{tx.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-0.5 text-neutral-400 hover:text-[#EEAA00] transition cursor-pointer"
                  title="Копіювати"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-400">Дата та час:</span>
              <span className="font-semibold">{tx.date}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-400">Отримувач / Мерчант:</span>
              <span className="font-bold text-right max-w-[200px] truncate">{tx.merchantName || tx.title}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-400">Категорія:</span>
              <span className="font-semibold text-[#EEAA00]">{tx.category}</span>
            </div>

            {tx.recipientIban && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Рахунок (IBAN):</span>
                <span className="font-mono text-[11px] truncate max-w-[190px]">{tx.recipientIban}</span>
              </div>
            )}

            {tx.recipientCardMask && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Картка одержання:</span>
                <span className="font-mono">{tx.recipientCardMask}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-400">Комісія банку:</span>
              <span className="font-semibold text-emerald-400">
                {tx.fee > 0 ? formatCurrency(tx.fee, tx.currency) : '0.00 ₴'}
              </span>
            </div>

            {tx.cashbackEarned && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Нараховано кешбеку:</span>
                <span className="font-bold text-[#EEAA00]">+{tx.cashbackEarned.toFixed(2)} ₴</span>
              </div>
            )}

            <div className="flex justify-between border-t border-neutral-800 pt-2 text-[11px]">
              <span className="text-neutral-500">Код авторизації:</span>
              <span className="font-mono text-neutral-400">{tx.authCode || 'AUT-789234'}</span>
            </div>
          </div>

          {/* Electronic Stamp Badge */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#EEAA00] shrink-0" />
            <p className="text-neutral-300">
              Документ завірено кваліфікованим електронним підписом (КЕП) АТ «Райффайзен Банк».
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => generateBankingReceiptPdf(tx)}
              className="w-full flex items-center justify-center gap-2 bg-[#EEAA00] text-black font-bold py-3.5 rounded-xl text-xs hover:bg-[#ffb700] transition cursor-pointer shadow-lg shadow-[#EEAA00]/20"
            >
              <Download className="w-4 h-4" /> Завантажити офіційний чек (PDF)
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDarkMode ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
              }`}
            >
              Закрити квитанцію
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
