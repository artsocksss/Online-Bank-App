export type Currency = 'UAH' | 'USD' | 'EUR' | 'PLN' | 'GBP';

export type CardTier = 'Premier World Elite' | 'Visa Infinite' | 'єПідтримка' | 'ФОП IT Business' | 'Platinum Credit';
export type CardSkin = 'gold-titanium' | 'obsidian-black' | 'cyber-neon' | 'patriotic-yellow-blue' | 'emerald-luxury';

export interface BankCard {
  id: string;
  name: string;
  tier: CardTier;
  currency: Currency;
  balance: number;
  creditLimit: number;
  usedCredit: number;
  gracePeriodDays: number;
  gracePeriodDate: string;
  iban: string;
  cardNumber: string;
  cardMask: string;
  cvv: string;
  expiry: string;
  skin: CardSkin;
  isVirtual: boolean;
  isDefault: boolean;
  isFrozen: boolean;
  applePayAdded: boolean;
  internetLimit: number;
  nfcEnabled: boolean;
  atmEnabled: boolean;
  dccProtected: boolean;
  pinCode: string;
}

export type TransactionCategory =
  | 'Продукти'
  | 'Транспорт'
  | 'Кафе та ресторани'
  | 'Комунальні послуги'
  | 'Перекази'
  | 'Зарплата'
  | 'Кешбек'
  | 'Благодійність ЗСУ'
  | 'Військові облігації'
  | 'Оплата частинами'
  | 'Розваги та ігри'
  | 'Здоров\'я та аптеки'
  | 'Покупки та одяг'
  | 'Обмін валют';

export interface Transaction {
  id: string;
  title: string;
  merchantName: string;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  date: string;
  timestamp: number;
  recipientIban?: string;
  recipientCardMask?: string;
  senderCardMask?: string;
  status: 'SUCCESS' | 'PENDING' | 'DECLINED';
  fee: number;
  cashbackEarned?: number;
  comment?: string;
  mcc?: string;
  authCode?: string;
  cardId?: string;
  canInstallment?: boolean;
}

export interface JarContributor {
  id: string;
  name: string;
  amount: number;
  time: string;
  comment?: string;
  avatar?: string;
}

export interface BankJar {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  color: string;
  icon: string;
  category: string;
  createdAt: string;
  contributorsCount: number;
  recentDonations: JarContributor[];
  autoSaveRule?: 'none' | 'roundup-10' | 'percent-5' | 'daily-50';
}

export interface CashbackCategory {
  id: string;
  name: string;
  icon: string;
  percent: number;
  selected: boolean;
  earnedThisMonth: number;
}

export interface InstallmentPlan {
  id: string;
  title: string;
  merchant: string;
  totalAmount: number;
  monthlyPayment: number;
  monthsTotal: number;
  monthsPaid: number;
  nextPaymentDate: string;
  remainingAmount: number;
}

export interface MilitaryBond {
  id: string;
  title: string;
  citySymbol: string;
  yieldRate: number; // e.g. 16.5%
  pricePerUnit: number; // 1000 UAH
  currency: Currency;
  maturityDate: string;
  availableUnits: number;
  ownedUnits: number;
  description: string;
}

export interface RadarContact {
  id: string;
  name: string;
  phone: string;
  cardMask: string;
  distance: string;
  avatar: string;
  bankName: string;
}

export interface CardSecuritySettings {
  isFrozen: boolean;
  internetLimit: number;
  internetLimitMax: number;
  isNfcEnabled: boolean;
  isAtmWithdrawalEnabled: boolean;
  isDoubleConversionProtected: boolean;
  is3DSecureActive: boolean;
  pinCode: string;
}

export interface AccountBalance {
  currency: Currency;
  amount: number;
  iban: string;
  cardMask: string;
}

export interface FxRate {
  currency: Currency;
  flag: string;
  name: string;
  buy: number;
  sell: number;
  nbu: number;
  change24h: number;
}

export interface UserProfile {
  name: string;
  taxNumber: string; // РНОКПП (ІПН)
  phone: string;
  email: string;
  accountTier: 'Premium Elite' | 'Gold' | 'Black';
  diiaVerified: boolean;
  cyberScore: number;
  personalManager: {
    name: string;
    phone: string;
    avatar: string;
  };
}
