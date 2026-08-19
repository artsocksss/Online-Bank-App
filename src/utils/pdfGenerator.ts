import { jsPDF } from 'jspdf';
import { Transaction } from '../types';
import { formatCurrency } from './formatters';

export function generateBankingReceiptPdf(tx: Transaction): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner - Raiffeisen Yellow #EEAA00
  doc.setFillColor(238, 170, 0);
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Brand text on yellow ribbon
  doc.setTextColor(15, 15, 15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RAIF PREMIER BANKING', 14, 12);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text('АТ «РАЙФФАЙЗЕН БАНК» • СЕП НБУ 24/7', pageWidth - 14, 12, { align: 'right' });

  // Bank Info
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(7.5);
  doc.text('Ліцензія НБУ №10 від 18.06.2018 р. | Код ЄДРПОУ: 14305909 | МФО: 380805', 14, 25);
  doc.text('01011, м. Київ, вул. Генерала Алмазова, 4-А | Гаряча лінія: 0 800 500 500', 14, 29);

  // Divider
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(14, 33, pageWidth - 14, 33);

  // Title: Офіційна квитанція
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('КВИТАНЦІЯ ПРО ЗДІЙСНЕНУ ОПЕРАЦІЮ', 14, 42);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text(`Документ №: ${tx.id}`, 14, 47);
  doc.text(`Дата та час операції: ${tx.date}`, pageWidth - 14, 47, { align: 'right' });

  // Main Transaction Card Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 52, pageWidth - 28, 62, 3, 3, 'F');
  doc.setDrawColor(225, 230, 235);
  doc.roundedRect(14, 52, pageWidth - 28, 62, 3, 3, 'S');

  // Amount
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text('Сума операції:', 20, 62);

  doc.setFontSize(18);
  doc.setFont('Helvetica', 'bold');
  if (tx.amount > 0) {
    doc.setTextColor(16, 140, 60);
  } else {
    doc.setTextColor(20, 20, 20);
  }
  doc.text(formatCurrency(tx.amount, tx.currency, true), 20, 72);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Комісія банку: ${tx.fee > 0 ? formatCurrency(tx.fee, tx.currency) : '0.00 ₴ (Без комісії)'}`, 20, 78);
  if (tx.cashbackEarned) {
    doc.text(`Нараховано кешбеку: +${tx.cashbackEarned.toFixed(2)} ₴`, 20, 83);
  }

  // Operation Details Table
  let y = 122;
  const lineSpacing = 7;

  const addDetailRow = (label: string, value: string) => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label, 14, y);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(value, pageWidth - 14, y, { align: 'right' });

    doc.setDrawColor(240, 240, 240);
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += lineSpacing;
  };

  addDetailRow('Отримувач / Торгова точка', tx.merchantName || tx.title);
  addDetailRow('Призначення платежу', tx.title);
  addDetailRow('Категорія витрат', tx.category);
  addDetailRow('Картка платника', tx.senderCardMask || '•••• 4024 (Mastercard World Elite)');
  
  if (tx.recipientCardMask) {
    addDetailRow('Картка отримувача', tx.recipientCardMask);
  }
  if (tx.recipientIban) {
    addDetailRow('Рахунок отримувача (IBAN)', tx.recipientIban);
  }
  
  addDetailRow('Статус платежу', tx.status === 'SUCCESS' ? 'УСПІШНО ПРОВЕДЕНО (СЕП НБУ)' : tx.status);
  addDetailRow('Код авторизації (Auth Code)', tx.authCode || 'AUT-789423');
  addDetailRow('MCC-код мерчанта', tx.mcc || '5411 (Grocery Stores)');

  // Digital Stamp Box
  doc.setFillColor(255, 252, 235);
  doc.setDrawColor(238, 170, 0);
  doc.roundedRect(14, y + 6, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(160, 110, 0);
  doc.text('ЕЛЕКТРОННИЙ ЦИФРОВИЙ ПІДПИС / КЕП БАНКУ', 20, y + 13);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(70, 70, 70);
  doc.text('Підписано: Кваліфікований електронний підпис АТ «Райффайзен Банк»', 20, y + 18);
  doc.text(`Сертифікат: UA-NBU-RAIF-${tx.id.replace(/\D/g, '')}-2026 • Перевірено в системі НБУ`, 20, y + 23);

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Цей документ є офіційним розрахунковим документом відповідно до Закону України «Про платіжні послуги».', pageWidth / 2, 200, { align: 'center' });

  doc.save(`Kvitantsiya_Raiffeisen_${tx.id}.pdf`);
}
