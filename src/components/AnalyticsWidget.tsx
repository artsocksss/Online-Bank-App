import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AnalyticsWidgetProps {
  transactions: Transaction[];
  isDarkMode: boolean;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  transactions,
  isDarkMode,
}) => {
  // Compute total spent and income for this month
  const expenses = transactions
    .filter((t) => t.amount < 0 && t.currency === 'UAH')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const income = transactions
    .filter((t) => t.amount > 0 && t.currency === 'UAH')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.amount < 0 && t.currency === 'UAH')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
    });

  const categories = Object.entries(categoryMap)
    .map(([cat, amt]) => ({
      name: cat,
      amount: amt,
      percent: expenses > 0 ? Math.round((amt / expenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const categoryColors = [
    'from-amber-500 to-yellow-400',
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-teal-400',
    'from-purple-500 to-indigo-400',
  ];

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Фінансова аналітика</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Витрати та доходи за серпень 2026</p>
        </div>
        <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[#EEAA00]">
          <PieChart className="w-4 h-4" />
        </div>
      </div>

      {/* Income & Expense Summary Pills */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span>Надходження</span>
          </div>
          <p className="text-base font-black font-mono text-white">
            +{formatCurrency(income, 'UAH')}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Витрати</span>
          </div>
          <p className="text-base font-black font-mono text-white">
            −{formatCurrency(expenses, 'UAH')}
          </p>
        </div>
      </div>

      {/* Categorized Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <span>Топ категорії витрат</span>
          <span>Частка</span>
        </div>

        {categories.map((c, idx) => (
          <div key={c.name} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-neutral-300">{c.name}</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(c.amount, 'UAH')} ({c.percent}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${categoryColors[idx % categoryColors.length]} rounded-full`}
                style={{ width: `${c.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
