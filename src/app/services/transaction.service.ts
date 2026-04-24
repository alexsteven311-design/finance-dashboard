import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Transaction, CategorySummary } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactions: Transaction[] = [];

  parseExcelFile(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          let jsonData: any[];

          if (isCSV) {
            const text = e.target.result as string;
            const workbook = XLSX.read(text, { type: 'string', raw: false });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
          } else {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
          }

          if (!jsonData.length) { reject('No data found in file'); return; }

          // Normalize all keys to lowercase trimmed for flexible matching
          jsonData = jsonData.map(row => {
            const normalized: any = {};
            Object.keys(row).forEach(k => normalized[k.trim()] = row[k]);
            return normalized;
          });

          this.transactions = jsonData
            .map(row => this.mapToTransaction(row))
            .filter(t => t !== null && t.amount > 0) as Transaction[];

          resolve(this.transactions);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = reject;
      isCSV ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    });
  }

  private findColumn(row: any, candidates: string[]): string {
    const keys = Object.keys(row);
    for (const candidate of candidates) {
      const match = keys.find(k => k.toLowerCase().trim() === candidate.toLowerCase());
      if (match) return String(row[match] || '').trim();
    }
    return '';
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    dateStr = dateStr.trim();

    // dd/mm/yyyy or dd-mm-yyyy or dd/mm/yy
    const dmy = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
      return new Date(`${year}-${month}-${day}`);
    }

    // yyyy-mm-dd
    const ymd = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymd) return new Date(`${ymd[1]}-${ymd[2].padStart(2,'0')}-${ymd[3].padStart(2,'0')}`);

    // mm/dd/yyyy (US format)
    const mdy = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (mdy) return new Date(`${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`);

    // Try native parse as fallback (handles "Jan 01, 2025", "01 Jan 2025" etc.)
    const native = new Date(dateStr);
    return isNaN(native.getTime()) ? new Date() : native;
  }

  private mapToTransaction(row: any): Transaction | null {
    // --- Description ---
    const description = this.findColumn(row, [
      'narration', 'description', 'particulars', 'details',
      'transaction details', 'remarks', 'transaction narration', 'txn narration'
    ]);

    if (!description) return null;

    // --- Date ---
    const dateStr = this.findColumn(row, [
      'date', 'transaction date', 'txn date', 'value date', 'posting date', 'trans date'
    ]);
    const date = this.parseDate(dateStr);

    // --- Amount: try debit/credit split first, then single amount column ---
    let debitAmount = 0;
    let creditAmount = 0;

    const debitStr = this.findColumn(row, [
      'debit amount', 'debit', 'withdrawal amount', 'withdrawal', 'dr amount', 'dr', 'debit(inr)', 'withdrawals'
    ]);
    const creditStr = this.findColumn(row, [
      'credit amount', 'credit', 'deposit amount', 'deposit', 'cr amount', 'cr', 'credit(inr)', 'deposits'
    ]);

    debitAmount = parseFloat(debitStr.replace(/,/g, '')) || 0;
    creditAmount = parseFloat(creditStr.replace(/,/g, '')) || 0;

    // Single amount column (negative = debit, positive = credit)
    if (debitAmount === 0 && creditAmount === 0) {
      const amountStr = this.findColumn(row, ['amount', 'transaction amount', 'txn amount']);
      const amount = parseFloat(amountStr.replace(/,/g, '')) || 0;
      if (amount < 0) debitAmount = Math.abs(amount);
      else if (amount > 0) creditAmount = amount;
    }

    const amount = debitAmount > 0 ? debitAmount : creditAmount;
    const type: 'debit' | 'credit' = debitAmount > 0 ? 'debit' : 'credit';

    if (amount === 0) return null;

    return {
      date,
      description,
      amount,
      category: this.categorizeTransaction(description),
      type
    };
  }

  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase();

    if (desc.includes('salary') || desc.includes('payroll') || desc.includes('income') || desc.includes('neft cr') || desc.includes('credit interest')) return 'Income';
    if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant') || desc.includes('food') || desc.includes('cafe') || desc.includes('nandhana') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('hotel') || desc.includes('bakery')) return 'Food & Dining';
    if (desc.includes('blinkit') || desc.includes('bbnow') || desc.includes('grocery') || desc.includes('supermarket') || desc.includes('bigbasket') || desc.includes('dmart') || desc.includes('more store') || desc.includes('reliance fresh')) return 'Groceries';
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping') || desc.includes('retail') || desc.includes('myntra') || desc.includes('meesho') || desc.includes('ajio')) return 'Shopping';
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') || desc.includes('petrol') || desc.includes('fuel') || desc.includes('metro') || desc.includes('bus') || desc.includes('irctc') || desc.includes('train') || desc.includes('flight') || desc.includes('indigo') || desc.includes('air india')) return 'Transportation';
    if (desc.includes('rent') || desc.includes('emi') || desc.includes('loan') || desc.includes('mortgage') || desc.includes('housing')) return 'Housing & Loans';
    if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('utility') || desc.includes('bill') || desc.includes('broadband') || desc.includes('gas') || desc.includes('jio') || desc.includes('airtel') || desc.includes('bsnl') || desc.includes('vi ')) return 'Utilities';
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('entertainment') || desc.includes('movie') || desc.includes('hotstar') || desc.includes('youtube') || desc.includes('bookmyshow')) return 'Entertainment';
    if (desc.includes('pharma') || desc.includes('hospital') || desc.includes('medical') || desc.includes('doctor') || desc.includes('health') || desc.includes('clinic') || desc.includes('apollo') || desc.includes('medplus') || desc.includes('netmeds')) return 'Healthcare';
    if (desc.includes('college') || desc.includes('school') || desc.includes('education') || desc.includes('fee') || desc.includes('tuition') || desc.includes('course') || desc.includes('udemy') || desc.includes('coursera')) return 'Education';
    if (desc.includes('ach d-') || desc.includes('bank charge') || desc.includes('annual fee') || desc.includes('service charge') || desc.includes('gst')) return 'Bank Charges';
    if (desc.includes('upi') || desc.includes('neft') || desc.includes('imps') || desc.includes('rtgs') || desc.includes('transfer')) return 'UPI Transfers';

    return 'Other';
  }

  getCategorySummary(): CategorySummary[] {
    const categoryMap = new Map<string, { total: number; count: number }>();
    let totalSpending = 0;

    this.transactions
      .filter(t => t.type === 'debit')
      .forEach(t => {
        const current = categoryMap.get(t.category) || { total: 0, count: 0 };
        current.total += t.amount;
        current.count += 1;
        categoryMap.set(t.category, current);
        totalSpending += t.amount;
      });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        percentage: (data.total / totalSpending) * 100,
        count: data.count
      }))
      .sort((a, b) => b.total - a.total);
  }

  getTransactions(): Transaction[] { return this.transactions; }

  getTotalSpending(): number {
    return this.transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalIncome(): number {
    return this.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  }
}
