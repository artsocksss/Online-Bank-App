import { Currency } from '../types';

export function formatCurrency(amount: number, currency: Currency = 'UAH', showSign = false): string {
  const symbolMap: Record<Currency, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€',
    PLN: 'zł',
    GBP: '£',
  };

  const formattedNum = Math.abs(amount).toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = showSign ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : (amount < 0 ? '−' : '');
  
  if (currency === 'USD' || currency === 'GBP') {
    return `${sign}${symbolMap[currency]}${formattedNum}`;
  }
  return `${sign}${formattedNum} ${symbolMap[currency]}`;
}

export function formatCardNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatIban(value: string): string {
  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 29);
  return clean.replace(/(.{4})(?=.)/g, '$1 ').trim();
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits.startsWith('380')) {
    if (digits.startsWith('0')) {
      const rest = digits.slice(1, 10);
      return `+380 (${rest.slice(0, 2)}) ${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`.trim();
    }
  }
  const clean = digits.slice(0, 12);
  const part1 = clean.slice(3, 5);
  const part2 = clean.slice(5, 8);
  const part3 = clean.slice(8, 10);
  const part4 = clean.slice(10, 12);

  let formatted = '+380';
  if (part1) formatted += ` (${part1}`;
  if (part2) formatted += `) ${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;
  return formatted;
}

export function detectBankFromCard(cardNumber: string): { name: string; color: string; logoText: string } {
  const clean = cardNumber.replace(/\s/g, '');
  const bin = clean.slice(0, 6);

  if (bin.startsWith('4441') || bin.startsWith('5375')) {
    return { name: 'monobank | Universal Bank', color: 'from-gray-900 to-black', logoText: 'mono' };
  }
  if (bin.startsWith('5168') || bin.startsWith('4149') || bin.startsWith('4731')) {
    return { name: 'ПриватБанк (Privat24)', color: 'from-emerald-950 to-green-900', logoText: 'ПБ' };
  }
  if (bin.startsWith('4024') || bin.startsWith('5211') || bin.startsWith('5167')) {
    return { name: 'Райффайзен Банк (Raif)', color: 'from-amber-950 to-neutral-900', logoText: 'Raif' };
  }
  if (bin.startsWith('4314') || bin.startsWith('5355')) {
    return { name: 'Sense Bank (Альфа)', color: 'from-blue-950 to-indigo-950', logoText: 'Sense' };
  }
  if (bin.startsWith('5339') || bin.startsWith('4627')) {
    return { name: 'ПУМБ Онлайн', color: 'from-rose-950 to-red-950', logoText: 'ПУМБ' };
  }
  if (bin.startsWith('5351') || bin.startsWith('4149')) {
    return { name: 'Ощадбанк 24/7', color: 'from-emerald-900 to-teal-950', logoText: 'Ощад' };
  }
  return { name: 'Український банк (НПС ПРОСТІР / Visa / MC)', color: 'from-neutral-900 to-neutral-800', logoText: 'Bank' };
}

export function isValidUkrainianIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (clean.length !== 29) return false;
  if (!clean.startsWith('UA')) return false;
  return /^[A-Z0-9]+$/.test(clean);
}

export function generateFiscalReceiptNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RAIF-UA-${timestamp}-${random}`;
}
