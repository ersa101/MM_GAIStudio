
import { TransactionType } from '../types';

export interface ParsedSMS {
  amount: number;
  type: TransactionType;
  bankName: string;
  accountLast4?: string;
  merchant?: string;
  confidence: number;
}

const BANK_PATTERNS = [
  {
    name: 'HDFC',
    debit: /debited|sent|withdrawn|payment/i,
    credit: /credited|received|deposited/i,
    amount: /Rs\.?\s?([\d,]+\.?\d*)/i,
    account: /A\/c\s\d*(\d{4})/i
  },
  {
    name: 'SBI',
    debit: /debited|transferred/i,
    credit: /credited|received/i,
    amount: /INR\s?([\d,]+\.?\d*)/i,
    account: /XX(\d{4})/i
  }
];

export function parseSMS(text: string): ParsedSMS | null {
  let confidence = 0;
  let amount = 0;
  let type = TransactionType.EXPENSE;
  let bankName = 'Unknown';
  let accountLast4 = '';

  for (const bank of BANK_PATTERNS) {
    if (text.toUpperCase().includes(bank.name)) {
      bankName = bank.name;
      confidence += 30;

      const amountMatch = text.match(bank.amount);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        confidence += 30;
      }

      const accMatch = text.match(bank.account);
      if (accMatch) {
        accountLast4 = accMatch[1];
        confidence += 20;
      }

      if (bank.debit.test(text)) {
        type = TransactionType.EXPENSE;
        confidence += 20;
      } else if (bank.credit.test(text)) {
        type = TransactionType.INCOME;
        confidence += 20;
      }
      break;
    }
  }

  if (confidence < 40) return null;

  return {
    amount,
    type,
    bankName,
    accountLast4,
    confidence
  };
}

export function getCategorySuggestion(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('swiggy') || lower.includes('zomato')) return 'Food';
  if (lower.includes('uber') || lower.includes('ola')) return 'Transport';
  if (lower.includes('salary')) return 'Salary';
  return 'Other';
}
