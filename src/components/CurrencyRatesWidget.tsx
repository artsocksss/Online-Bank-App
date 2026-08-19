import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Calculator,
  DollarSign,
  Euro,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { FxRate } from '../types';

interface CurrencyRatesWidgetProps {
  rates: FxRate[];
  isDarkMode: boolean;
  onOpenExchange: () => void;
}

export const CurrencyRatesWidget: React.FC<CurrencyRatesWidgetProps> = ({
  rates,
  isDarkMode,
  onOpenExchange,
}) => {
  const [activeTab, setActiveTab] = useState<'CARD' | 'NBU'>('CARD');

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Курси валют</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EEAA00]/15 text-[#EEAA00] border border-[#EEAA00]/30">
              Online
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">Офіційні котирування Raiffeisen та НБУ</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('CARD')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'CARD' ? 'bg-[#EEAA00] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Картковий
          </button>
          <button
            onClick={() => setActiveTab('NBU')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              activeTab === 'NBU' ? 'bg-[#EEAA00] text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            НБУ
          </button>
        </div>
      </div>

      {/* Rates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-left">
              <th className="pb-2 font-bold uppercase tracking-wider">Валюта</th>
              {activeTab === 'CARD' ? (
                <>
                  <th className="pb-2 font-bold uppercase tracking-wider text-right">Купівля</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-right">Продаж</th>
                </>
              ) : (
                <th className="pb-2 font-bold uppercase tracking-wider text-right">Офіційний курс НБУ</th>
              )}
              <th className="pb-2 font-bold uppercase tracking-wider text-right">24г</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono">
            {rates.map((r) => (
              <tr key={r.currency} className="hover:bg-neutral-900/40 transition">
                <td className="py-2.5 font-sans font-bold flex items-center gap-2">
                  <span className="text-base">{r.flag}</span>
                  <div>
                    <span className="text-xs text-white">{r.currency}</span>
                    <span className="text-[10px] text-neutral-400 block font-normal">{r.name}</span>
                  </div>
                </td>
                {activeTab === 'CARD' ? (
                  <>
                    <td className="py-2.5 text-right font-bold text-neutral-200">
                      {r.buy.toFixed(2)} ₴
                    </td>
                    <td className="py-2.5 text-right font-black text-[#EEAA00]">
                      {r.sell.toFixed(2)} ₴
                    </td>
                  </>
                ) : (
                  <td className="py-2.5 text-right font-black text-[#EEAA00]">
                    {r.nbu.toFixed(2)} ₴
                  </td>
                )}
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-flex items-center text-[11px] font-bold ${
                      r.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {r.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                    )}
                    {r.change24h >= 0 ? `+${r.change24h}` : r.change24h}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Button to Instant Exchange */}
      <button
        onClick={onOpenExchange}
        className="w-full mt-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-[#EEAA00] transition cursor-pointer flex items-center justify-center gap-2"
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        <span>Обміняти валюту онлайн за курсом банку</span>
      </button>
    </div>
  );
};
