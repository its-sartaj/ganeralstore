import { CartItem, Invoice, StoreSettings } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
}

export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, return 10 digits
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  // If starts with 0 and has 11 digits, return 10 digits
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly.slice(1);
  }
  // If more than 10 digits, take the last 10
  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }
  return digitsOnly;
}

export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === undefined || num === null) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const wholeNumber = Math.floor(Math.abs(num));
  const decimalPaise = Math.round((Math.abs(num) - wholeNumber) * 100);

  if (wholeNumber === 0 && decimalPaise === 0) return 'Zero Rupees Only';

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const units = a[n % 10];
    return tens + (units ? ' ' + units : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) res += a[hundred] + ' Hundred';
    if (rest > 0) res += (hundred > 0 ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  if (wholeNumber === 0 && decimalPaise > 0) {
    return convertTwoDigits(decimalPaise) + ' Paise Only';
  }

  let words = '';
  const crore = Math.floor(wholeNumber / 10000000);
  const lakh = Math.floor((wholeNumber % 10000000) / 100000);
  const thousand = Math.floor((wholeNumber % 100000) / 1000);
  const remainder = wholeNumber % 1000;

  if (crore > 0) words += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertThreeDigits(thousand) + ' Thousand ';
  if (remainder > 0) words += convertThreeDigits(remainder);

  let finalStr = 'Rupees ' + words.trim();
  if (decimalPaise > 0) {
    finalStr += ' and ' + convertTwoDigits(decimalPaise) + ' Paise';
  }
  return finalStr + ' Only';
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const yr = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `KGS-${yr}${month}${day}-${randomNum}`;
}

export function generateWhatsAppMessage(invoice: Invoice, settings: StoreSettings): string {
  let msg = `🧾 *${settings.storeName.toUpperCase()}* 🧾\n`;
  msg += `📍 ${settings.address}, ${settings.cityState}\n`;
  msg += `📞 Helplines: ${settings.phone1}${settings.phone2 ? ' | ' + settings.phone2 : ''}\n`;
  if (settings.email) {
    msg += `✉️ Email: ${settings.email}\n`;
  }
  msg += `------------------------------------\n`;
  msg += `*TAX INVOICE / CASH BILL*\n`;
  msg += `Invoice No: *${invoice.invoiceNumber}*\n`;
  msg += `Date & Time: ${invoice.dateStr} ${invoice.timeStr}\n`;
  msg += `Customer: *${invoice.customer.name}* (${invoice.customer.phone})\n`;
  if (invoice.customer.address) {
    msg += `Address: ${invoice.customer.address}\n`;
  }
  msg += `Payment Mode: *${invoice.paymentStatus} (${invoice.customer.paymentMethod.toUpperCase()})*\n`;
  msg += `------------------------------------\n`;
  msg += `*ITEM DETAILS:*\n`;

  invoice.items.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}* (${item.unit})\n`;
    msg += `   Qty: ${item.quantity} x ₹${item.rate} = *₹${item.amount}*\n`;
  });

  msg += `------------------------------------\n`;
  msg += `Subtotal: ₹${invoice.subtotal}\n`;
  if (invoice.discount > 0) {
    msg += `Discount / Savings: -₹${invoice.discount}\n`;
  }
  if (invoice.deliveryFee > 0) {
    msg += `Delivery Charge: ₹${invoice.deliveryFee}\n`;
  } else {
    msg += `Delivery: *FREE*\n`;
  }
  msg += `GST / Tax: Included\n`;
  msg += `*GRAND TOTAL: ₹${invoice.totalAmount}*\n`;
  msg += `_(${numberToIndianWords(invoice.totalAmount)})_\n`;
  msg += `------------------------------------\n`;
  if (settings.googleMapsUrl) {
    msg += `📍 Store Location: ${settings.googleMapsUrl}\n`;
  }
  msg += `🙏 *Aapke Vishwas ke Liye Dhanyawaad! Visit Again!* 🙏`;

  return encodeURIComponent(msg);
}
