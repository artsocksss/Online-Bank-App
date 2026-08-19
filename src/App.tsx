import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  ChevronRight,
  Download,
  Filter,
  History,
  LayoutDashboard,
  PieChart,
  Radio,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
  Split,
  Vault,
  Wallet,
} from 'lucide-react';
import {
  BankCard,
  BankJar,
  CardSecuritySettings,
  CardSkin,
  CashbackCategory,
  Currency,
  InstallmentPlan,
  MilitaryBond,
  ScheduledDebit,
  Transaction,
  UserProfile,
} from './types';
import {
  INITIAL_CARDS,
  INITIAL_CASHBACK_CATEGORIES,
  INITIAL_INSTALLMENTS,
  INITIAL_JARS,
  INITIAL_SCHEDULED_DEBITS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  MILITARY_BONDS_LIST,
  FX_RATES,
} from './data/mockData';
import { Header } from './components/Header';
import { CardWidget } from './components/CardWidget';
import { QuickActions } from './components/QuickActions';
import { TransferModal } from './components/TransferModal';
import { ExchangeModal } from './components/ExchangeModal';
import { JarsModal } from './components/JarsModal';
import { CashbackModal } from './components/CashbackModal';
import { UtilitiesModal } from './components/UtilitiesModal';
import { CardSettingsModal } from './components/CardSettingsModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { InstallmentsModal } from './components/InstallmentsModal';
import { MilitaryBondsModal } from './components/MilitaryBondsModal';
import { ShakeToPayModal } from './components/ShakeToPayModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { GoogleDocsModal } from './components/GoogleDocsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CreditSystemModal } from './components/CreditSystemModal';
import { ScheduledDebitsModal } from './components/ScheduledDebitsModal';
import { AddCardModal } from './components/AddCardModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PwaGuideModal } from './components/PwaGuideModal';
import { DynamicIsland, DynamicIslandData } from './components/DynamicIsland';
import { CurrencyRatesWidget } from './components/CurrencyRatesWidget';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import { AuthScreen } from './components/AuthScreen';
import { Toast, ToastMessage } from './components/Toast';
import { formatCurrency } from './utils/formatters';
import { generateBankingReceiptPdf } from './utils/pdfGenerator';

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('raif_auth') === 'true';
  });

  // Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('raif_theme') !== 'light';
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('raif_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Cards State (Multi-card)
  const [cards, setCards] = useState<BankCard[]>(() => {
    const saved = localStorage.getItem('raif_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Active selected currency
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('UAH');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('raif_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Jars state
  const [jars, setJars] = useState<BankJar[]>(() => {
    const saved = localStorage.getItem('raif_jars');
    return saved ? JSON.parse(saved) : INITIAL_JARS;
  });

  // Installments state
  const [installments, setInstallments] = useState<InstallmentPlan[]>(() => {
    const saved = localStorage.getItem('raif_installments');
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENTS;
  });

  // Military Bonds state
  const [militaryBonds, setMilitaryBonds] = useState<MilitaryBond[]>(() => {
    const saved = localStorage.getItem('raif_bonds');
    return saved ? JSON.parse(saved) : MILITARY_BONDS_LIST;
  });

  // Cashback categories state
  const [cashbackCategories, setCashbackCategories] = useState<CashbackCategory[]>(() => {
    const saved = localStorage.getItem('raif_cashback');
    return saved ? JSON.parse(saved) : INITIAL_CASHBACK_CATEGORIES;
  });

  // Scheduled debits state
  const [scheduledDebits, setScheduledDebits] = useState<ScheduledDebit[]>(() => {
    const saved = localStorage.getItem('raif_debits');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_DEBITS;
  });
  const [isScheduledDebitsOpen, setIsScheduledDebitsOpen] = useState(false);

  // Dynamic Island Push State
  const [islandData, setIslandData] = useState<DynamicIslandData>({
    mode: 'compact',
    title: 'MyRaif Core OS',
  });

  // Auto-debit loop simulation state
  const [isAutoLoopActive, setIsAutoLoopActive] = useState(false);

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferInitialMode, setTransferInitialMode] = useState<'CARD' | 'IBAN'>('CARD');
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isJarsOpen, setIsJarsOpen] = useState(false);
  const [isCashbackOpen, setIsCashbackOpen] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [utilitiesCategory, setUtilitiesCategory] = useState<string | undefined>();
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);
  const [isMilitaryBondsOpen, setIsMilitaryBondsOpen] = useState(false);
  const [isShakeToPayOpen, setIsShakeToPayOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isGoogleDocsOpen, setIsGoogleDocsOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCreditSystemOpen, setIsCreditSystemOpen] = useState(false);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Transaction Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('raif_auth', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('raif_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('raif_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddCard = (newCard: BankCard) => {
    setCards((prev) => [newCard, ...prev]);
    setActiveCardIndex(0);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== cardId);
      if (activeCardIndex >= filtered.length) {
        setActiveCardIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
    showToast('Картку успішно видалено / вилучено з акаунту', 'info');
  };

  useEffect(() => {
    localStorage.setItem('raif_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('raif_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('raif_jars', JSON.stringify(jars));
  }, [jars]);

  useEffect(() => {
    localStorage.setItem('raif_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('raif_bonds', JSON.stringify(militaryBonds));
  }, [militaryBonds]);

  useEffect(() => {
    localStorage.setItem('raif_cashback', JSON.stringify(cashbackCategories));
  }, [cashbackCategories]);

  useEffect(() => {
    localStorage.setItem('raif_debits', JSON.stringify(scheduledDebits));
  }, [scheduledDebits]);

  useEffect(() => {
    if (!isAutoLoopActive) return;
    const interval = setInterval(() => {
      if (scheduledDebits.length > 0) {
        const randomDebit = scheduledDebits[Math.floor(Math.random() * scheduledDebits.length)];
        handleTriggerSimulatedDebit(randomDebit);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoLoopActive, scheduledDebits, activeCardIndex]);

  // Active card
  const activeCard = cards[activeCardIndex] || cards[0];

  // Derived balance map for currencies
  const balanceMap: Record<Currency, number> = {
    UAH: cards.filter((c) => c.currency === 'UAH').reduce((sum, c) => sum + c.balance, 0),
    USD: cards.filter((c) => c.currency === 'USD').reduce((sum, c) => sum + c.balance, 0),
    EUR: cards.filter((c) => c.currency === 'EUR').reduce((sum, c) => sum + c.balance, 0),
    PLN: cards.filter((c) => c.currency === 'PLN').reduce((sum, c) => sum + c.balance, 0),
    GBP: 0,
  };

  const totalCashbackAvailable = cashbackCategories.reduce(
    (sum, c) => sum + c.earnedThisMonth,
    0
  );

  // Handlers
  const handleToggleFreezeCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const handleChangeCardSkin = (cardId: string, skin: CardSkin) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, skin } : c))
    );
  };

  const handleUpdateCardSettings = (settings: CardSecuritySettings) => {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIndex
          ? {
              ...c,
              isFrozen: settings.isFrozen,
              internetLimit: settings.internetLimit,
              nfcEnabled: settings.isNfcEnabled,
              atmEnabled: settings.isAtmWithdrawalEnabled,
              dccProtected: settings.isDoubleConversionProtected,
              pinCode: settings.pinCode,
            }
          : c
      )
    );
  };

  const handleExecuteTransfer = (
    tx: Transaction,
    deductedCurrency: Currency,
    amount: number
  ) => {
    setCards((prev) =>
      prev.map((c, idx) => {
        if (idx === activeCardIndex && c.currency === deductedCurrency) {
          return { ...c, balance: c.balance - amount };
        }
        return c;
      })
    );
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleExecuteExchange = (
    tx: Transaction,
    fromCur: Currency,
    toCur: Currency,
    fromAmount: number,
    toAmount: number
  ) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.currency === fromCur) {
          return { ...c, balance: c.balance - fromAmount };
        }
        if (c.currency === toCur) {
          return { ...c, balance: c.balance + toAmount };
        }
        return c;
      })
    );
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleTriggerSimulatedDebit = (debit: ScheduledDebit) => {
    // 1. Deduct from active card
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIndex ? { ...c, balance: Math.max(0, c.balance - debit.amount) } : c
      )
    );

    // 2. Add transaction record
    const newTx: Transaction = {
      id: 'DEBIT-' + Date.now().toString().slice(-6),
      title: debit.title,
      merchantName: debit.merchant,
      category: debit.category,
      amount: -debit.amount,
      currency: debit.currency,
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      fee: 0,
      authCode: 'AUTO-' + Math.floor(100000 + Math.random() * 900000),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Show Dynamic Island Push Notification
    setIslandData({
      mode: 'expanded',
      title: `Автосписання: ${debit.title}`,
      subtitle: `${debit.merchant} • ${activeCard.name}`,
      amount: formatCurrency(-debit.amount, debit.currency),
      icon: 'repeat',
    });

    setTimeout(() => {
      setIslandData({ mode: 'compact', title: 'MyRaif Core OS' });
    }, 5000);

    showToast(`Автосписання ${formatCurrency(debit.amount, debit.currency)} успішно проведене`, 'success');
  };

  const handleToggleDebit = (debitId: string) => {
    setScheduledDebits((prev) =>
      prev.map((d) => (d.id === debitId ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleAddDebit = (newDebit: ScheduledDebit) => {
    setScheduledDebits((prev) => [newDebit, ...prev]);
  };

  const handleDeleteDebit = (debitId: string) => {
    setScheduledDebits((prev) => prev.filter((d) => d.id !== debitId));
  };

  const handleCreditTopUp = (amount: number, title: string) => {
    setCards((prev) =>
      prev.map((c, idx) => (idx === activeCardIndex ? { ...c, balance: c.balance + amount } : c))
    );
    const newTx: Transaction = {
      id: 'CREDIT-' + Date.now().toString().slice(-6),
      title,
      merchantName: 'Raiffeisen Premier Credit',
      category: 'Зарплата',
      amount,
      currency: 'UAH',
      date: 'Сьогодні, ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      fee: 0,
      authCode: 'CRD-' + Math.floor(100000 + Math.random() * 900000),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleTopUpJar = (jarId: string, amount: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.currency === 'UAH' ? { ...c, balance: c.balance - amount } : c
      )
    );
    setJars((prev) =>
      prev.map((j) =>
        j.id === jarId ? { ...j, currentAmount: j.currentAmount + amount } : j
      )
    );

    const jar = jars.find((j) => j.id === jarId);
    const tx: Transaction = {
      id: 'JAR-' + Date.now().toString().slice(-6),
      title: `Поповнення Банки «${jar?.title || 'Скарбничка'}»`,
      merchantName: 'Raiffeisen Скарбничка',
      category: 'Зарплата',
      amount: -amount,
      currency: 'UAH',
      date:
        'Сьогодні, ' +
        new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: activeCard.cardMask,
      status: 'SUCCESS',
      fee: 0,
      authCode: 'JAR-' + Math.floor(100000 + Math.random() * 900000),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleBreakJar = (jarId: string) => {
    const jar = jars.find((j) => j.id === jarId);
    if (!jar) return;

    const returnAmt = jar.currentAmount;
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === 0 ? { ...c, balance: c.balance + returnAmt } : c
      )
    );
    setJars((prev) =>
      prev.map((j) => (j.id === jarId ? { ...j, currentAmount: 0 } : j))
    );

    const tx: Transaction = {
      id: 'JAR-RET-' + Date.now().toString().slice(-6),
      title: `Повернення коштів з Банки «${jar.title}»`,
      merchantName: 'Raiffeisen Скарбничка',
      category: 'Зарплата',
      amount: returnAmt,
      currency: 'UAH',
      date:
        'Сьогодні, ' +
        new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      senderCardMask: 'Банка',
      recipientCardMask: activeCard.cardMask,
      status: 'SUCCESS',
      fee: 0,
      authCode: 'JAR-RET-' + Math.floor(100000 + Math.random() * 900000),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleCreateJar = (newJar: BankJar) => {
    setJars((prev) => [newJar, ...prev]);
  };

  const handleToggleCashbackCategory = (id: string) => {
    const target = cashbackCategories.find((c) => c.id === id);
    if (!target) return;

    const currentlySelectedCount = cashbackCategories.filter((c) => c.selected).length;

    if (!target.selected && currentlySelectedCount >= 2) {
      showToast('Можна обрати щонайбільше 2 категорії кешбеку на місяць', 'error');
      return;
    }

    setCashbackCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleWithdrawCashback = () => {
    const amountToWithdraw = totalCashbackAvailable;
    if (amountToWithdraw <= 0) return;

    setCards((prev) =>
      prev.map((c, idx) =>
        idx === 0 ? { ...c, balance: c.balance + amountToWithdraw } : c
      )
    );

    setCashbackCategories((prev) =>
      prev.map((c) => ({ ...c, earnedThisMonth: 0 }))
    );

    const tx: Transaction = {
      id: 'CB-' + Date.now().toString().slice(-6),
      title: 'Виплата накопиченого кешбеку',
      merchantName: 'Програма лояльності Raiffeisen',
      category: 'Кешбек',
      amount: amountToWithdraw,
      currency: 'UAH',
      date:
        'Сьогодні, ' +
        new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      recipientCardMask: activeCard.cardMask,
      status: 'SUCCESS',
      fee: 0,
      authCode: 'CB-' + Math.floor(100000 + Math.random() * 900000),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleExecutePayment = (tx: Transaction, amount: number) => {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIndex ? { ...c, balance: c.balance - amount } : c
      )
    );
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleBuyMilitaryBonds = (
    bondId: string,
    units: number,
    totalCost: number,
    tx: Transaction
  ) => {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === 0 ? { ...c, balance: c.balance - totalCost } : c
      )
    );
    setMilitaryBonds((prev) =>
      prev.map((b) =>
        b.id === bondId
          ? {
              ...b,
              ownedUnits: b.ownedUnits + units,
              availableUnits: Math.max(0, b.availableUnits - units),
            }
          : b
      )
    );
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleAddNewInstallment = (plan: InstallmentPlan) => {
    setInstallments((prev) => [plan, ...prev]);
  };

  const handlePayOffInstallment = (planId: string) => {
    const plan = installments.find((i) => i.id === planId);
    if (!plan) return;

    setCards((prev) =>
      prev.map((c, idx) =>
        idx === 0 ? { ...c, balance: c.balance - plan.remainingAmount } : c
      )
    );
    setInstallments((prev) => prev.filter((i) => i.id !== planId));
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'ALL' || t.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Transactions eligible for installment conversion
  const eligibleTransactions = transactions.filter(
    (t) => t.amount < -500 && t.currency === 'UAH' && t.canInstallment
  );

  // If user is not logged in, render the secure authentication screen
  if (!isLoggedIn) {
    return (
      <AuthScreen
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          showToast('Ласкаво просимо до Raiffeisen Premier Banking!', 'success');
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0E0F12] text-neutral-100' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      {/* Dynamic Island Header Overlay */}
      <DynamicIsland
        data={islandData}
        onClear={() => setIslandData({ mode: 'compact', title: 'MyRaif Core OS' })}
      />

      {/* Toast Manager */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Main App Header */}
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onLogout={() => {
          setIsLoggedIn(false);
          showToast('Сесію успішно завершено. До зустрічі!', 'info');
        }}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        balances={balanceMap}
        onOpenCardSettings={() => setIsCardSettingsOpen(true)}
        onOpenNotificationsDrawer={() => setIsNotificationsDrawerOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenCreditSystem={() => setIsCreditSystemOpen(true)}
        onOpenProfileModal={() => setIsProfileOpen(true)}
        onOpenPwaGuideModal={() => setIsPwaGuideOpen(true)}
      />

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Section: Card & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left / 3D Multi-Card Widget (5 cols on lg) */}
          <div className="lg:col-span-5 animate-float transition-all duration-500 ease-out">
            <CardWidget
              cards={cards}
              activeCardIndex={activeCardIndex}
              onSelectCard={setActiveCardIndex}
              onToggleFreeze={handleToggleFreezeCard}
              onChangeSkin={handleChangeCardSkin}
              onOpenCardSettings={() => setIsCardSettingsOpen(true)}
              onAddNewCard={() => setIsAddCardOpen(true)}
              onDeleteCard={handleDeleteCard}
              onShowToast={showToast}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Right / Quick Banking Actions (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <QuickActions
              isDarkMode={isDarkMode}
              onOpenTransfer={(mode) => {
                setTransferInitialMode(mode);
                setIsTransferOpen(true);
              }}
              onOpenExchange={() => setIsExchangeOpen(true)}
              onOpenJars={() => setIsJarsOpen(true)}
              onOpenCashback={() => setIsCashbackOpen(true)}
              onOpenUtilities={(cat) => {
                setUtilitiesCategory(cat);
                setIsUtilitiesOpen(true);
              }}
              onOpenInstallments={() => setIsInstallmentsOpen(true)}
              onOpenMilitaryBonds={() => setIsMilitaryBondsOpen(true)}
              onOpenShakeToPay={() => setIsShakeToPayOpen(true)}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              onOpenCardSettings={() => setIsCardSettingsOpen(true)}
              onOpenGoogleDocs={() => setIsGoogleDocsOpen(true)}
              onOpenCreditSystem={() => setIsCreditSystemOpen(true)}
              onOpenScheduledDebits={() => setIsScheduledDebitsOpen(true)}
              cashbackTotalAvailable={totalCashbackAvailable}
              jarsCount={jars.length}
            />

            {/* Currency Rates Bar */}
            <CurrencyRatesWidget
              rates={FX_RATES}
              isDarkMode={isDarkMode}
              onOpenExchange={() => setIsExchangeOpen(true)}
            />
          </div>
        </div>

        {/* Middle Section: Financial Analytics & Transaction Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Analytics Widget (4 cols) */}
          <div className="lg:col-span-4">
            <AnalyticsWidget transactions={transactions} isDarkMode={isDarkMode} />
          </div>

          {/* Right Column: Interactive Transactions Feed (8 cols) */}
          <div className="lg:col-span-8">
            <div
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              {/* Feed Header with Search & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base tracking-tight">Історія операцій</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-800 text-neutral-300">
                      {filteredTransactions.length}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Фіскальний реєстр платежів та квитанцій СЕП
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Пошук за назвою або ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-[#EEAA00] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {[
                  'ALL',
                  'Продукти',
                  'Транспорт',
                  'Кафе та ресторани',
                  'Комунальні послуги',
                  'Перекази',
                  'Благодійність ЗСУ',
                  'Військові облігації',
                  'Зарплата',
                  'Кешбек',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-[#EEAA00] text-black font-bold shadow-xs'
                        : isDarkMode
                        ? 'border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300'
                        : 'border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {cat === 'ALL' ? 'Всі операції' : cat}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  За обраними фільтрами транзакцій не знайдено.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/70">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.amount > 0;
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="py-3.5 flex items-center justify-between group hover:bg-neutral-900/40 px-2 rounded-xl transition cursor-pointer"
                      >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : tx.category === 'Благодійність ЗСУ' || tx.category === 'Військові облігації'
                                ? 'bg-blue-500/15 text-yellow-400 border border-blue-500/30'
                                : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#EEAA00] transition">
                              {tx.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span className="font-semibold text-neutral-300">{tx.category}</span>
                              <span>•</span>
                              <span>{tx.date}</span>
                              <span className="hidden sm:inline font-mono opacity-60">• ID: {tx.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & PDF Trigger */}
                        <div className="text-right shrink-0">
                          <p
                            className={`text-xs sm:text-sm font-black font-mono ${
                              isIncome ? 'text-emerald-400' : 'text-neutral-200'
                            }`}
                          >
                            {formatCurrency(tx.amount, tx.currency, true)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateBankingReceiptPdf(tx);
                              showToast(`Квитанцію ${tx.id} завантажено у форматі PDF`, 'success');
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-[#EEAA00] hover:underline font-semibold mt-0.5 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Чек PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`mt-16 border-t py-8 text-center text-xs transition-colors ${
          isDarkMode
            ? 'bg-neutral-950 border-neutral-800 text-neutral-500'
            : 'bg-neutral-100 border-neutral-200 text-neutral-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="font-extrabold text-[#EEAA00]">RAIFFEISEN PREMIER BANKING</span>
            <span>•</span>
            <span>Ліцензія НБУ №10 від 18.06.2018 р.</span>
            <span>•</span>
            <span>ЄДРПОУ 14305909</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Офіційний захищений сервіс цифрового дистанційного обслуговування. Всі права захищено © 2026.
          </p>
        </div>
      </footer>

      {/* MODALS */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        isDarkMode={isDarkMode}
        initialMode={transferInitialMode}
        balances={balanceMap}
        activeCurrency={activeCard.currency}
        onExecuteTransfer={handleExecuteTransfer}
        onShowToast={showToast}
      />

      <ExchangeModal
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        isDarkMode={isDarkMode}
        balances={balanceMap}
        rates={FX_RATES}
        onExecuteExchange={handleExecuteExchange}
        onShowToast={showToast}
      />

      <JarsModal
        isOpen={isJarsOpen}
        onClose={() => setIsJarsOpen(false)}
        isDarkMode={isDarkMode}
        jars={jars}
        uahBalance={balanceMap.UAH || 0}
        onTopUpJar={handleTopUpJar}
        onBreakJar={handleBreakJar}
        onCreateJar={handleCreateJar}
        onShowToast={showToast}
      />

      <CashbackModal
        isOpen={isCashbackOpen}
        onClose={() => setIsCashbackOpen(false)}
        isDarkMode={isDarkMode}
        categories={cashbackCategories}
        onToggleCategory={handleToggleCashbackCategory}
        onWithdrawCashback={handleWithdrawCashback}
        onShowToast={showToast}
      />

      <UtilitiesModal
        isOpen={isUtilitiesOpen}
        onClose={() => setIsUtilitiesOpen(false)}
        isDarkMode={isDarkMode}
        initialCategory={utilitiesCategory}
        uahBalance={balanceMap.UAH || 0}
        onExecutePayment={handleExecutePayment}
        onShowToast={showToast}
      />

      <InstallmentsModal
        isOpen={isInstallmentsOpen}
        onClose={() => setIsInstallmentsOpen(false)}
        isDarkMode={isDarkMode}
        installments={installments}
        eligibleTransactions={eligibleTransactions}
        onAddNewInstallment={handleAddNewInstallment}
        onPayOffEarly={handlePayOffInstallment}
        onShowToast={showToast}
      />

      <MilitaryBondsModal
        isOpen={isMilitaryBondsOpen}
        onClose={() => setIsMilitaryBondsOpen(false)}
        isDarkMode={isDarkMode}
        bonds={militaryBonds}
        uahBalance={balanceMap.UAH || 0}
        onBuyBonds={handleBuyMilitaryBonds}
        onShowToast={showToast}
      />

      <ShakeToPayModal
        isOpen={isShakeToPayOpen}
        onClose={() => setIsShakeToPayOpen(false)}
        isDarkMode={isDarkMode}
        uahBalance={balanceMap.UAH || 0}
        onSendMoney={handleExecutePayment}
        onShowToast={showToast}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        isDarkMode={isDarkMode}
        user={user}
        transactions={transactions}
        uahBalance={balanceMap.UAH || 0}
      />

      <GoogleDocsModal
        isOpen={isGoogleDocsOpen}
        onClose={() => setIsGoogleDocsOpen(false)}
        isDarkMode={isDarkMode}
        user={user}
        transactions={transactions}
        uahBalance={balanceMap.UAH || 0}
        onShowToast={showToast}
      />

      <NotificationsDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        isDarkMode={isDarkMode}
        onShowToast={showToast}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        isDarkMode={isDarkMode}
        cards={cards}
        transactions={transactions}
        user={user}
        onUpdateCards={setCards}
        onUpdateTransactions={setTransactions}
        onUpdateUser={setUser}
        onShowToast={showToast}
      />

      <CreditSystemModal
        isOpen={isCreditSystemOpen}
        onClose={() => setIsCreditSystemOpen(false)}
        isDarkMode={isDarkMode}
        cards={cards}
        uahBalance={balanceMap.UAH || 0}
        onTopUpBalance={(amt, title) => {
          handleCreditTopUp(amt, title);
        }}
        onShowToast={showToast}
      />

      <ScheduledDebitsModal
        isOpen={isScheduledDebitsOpen}
        onClose={() => setIsScheduledDebitsOpen(false)}
        isDarkMode={isDarkMode}
        scheduledDebits={scheduledDebits}
        activeCard={activeCard}
        onToggleDebit={handleToggleDebit}
        onAddDebit={handleAddDebit}
        onDeleteDebit={handleDeleteDebit}
        onTriggerSimulatedDebit={handleTriggerSimulatedDebit}
        isAutoLoopActive={isAutoLoopActive}
        onToggleAutoLoop={() => setIsAutoLoopActive(!isAutoLoopActive)}
        onShowToast={showToast}
      />

      <CardSettingsModal
        isOpen={isCardSettingsOpen}
        onClose={() => setIsCardSettingsOpen(false)}
        isDarkMode={isDarkMode}
        settings={{
          isFrozen: activeCard.isFrozen,
          internetLimit: activeCard.internetLimit,
          internetLimitMax: 200000,
          isNfcEnabled: activeCard.nfcEnabled,
          isAtmWithdrawalEnabled: activeCard.atmEnabled,
          isDoubleConversionProtected: activeCard.dccProtected,
          is3DSecureActive: true,
          pinCode: activeCard.pinCode,
        }}
        onUpdateSettings={handleUpdateCardSettings}
        onShowToast={showToast}
      />

      <TransactionReceiptModal
        tx={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        isDarkMode={isDarkMode}
        onShowToast={showToast}
      />

      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        isDarkMode={isDarkMode}
        onAddCard={handleAddCard}
        onShowToast={showToast}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isDarkMode={isDarkMode}
        user={user}
        onUpdateUser={setUser}
        onShowToast={showToast}
      />

      <PwaGuideModal
        isOpen={isPwaGuideOpen}
        onClose={() => setIsPwaGuideOpen(false)}
        isDarkMode={isDarkMode}
        onShowToast={showToast}
      />
    </div>
  );
}
