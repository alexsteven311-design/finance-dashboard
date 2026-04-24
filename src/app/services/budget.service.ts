import { Injectable } from '@angular/core';
import { Budget } from '../models/budget.model';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgets: Map<string, number> = new Map();

  constructor(private transactionService: TransactionService) {
    this.initializeDefaultBudgets();
  }

  private initializeDefaultBudgets() {
    const defaults = {
      'Food & Dining': 10000,
      'Groceries': 8000,
      'Shopping': 5000,
      'Transportation': 3000,
      'Housing & Loans': 15000,
      'Utilities': 2000,
      'Entertainment': 2000,
      'Healthcare': 3000,
      'Education': 5000,
      'Other': 5000
    };
    Object.entries(defaults).forEach(([cat, limit]) => this.budgets.set(cat, limit));
  }

  setBudget(category: string, limit: number) {
    this.budgets.set(category, limit);
    this.saveBudgets();
  }

  getBudgets(): Budget[] {
    const categorySummary = this.transactionService.getCategorySummary();
    return Array.from(this.budgets.entries()).map(([category, limit]) => {
      const spent = categorySummary.find(c => c.category === category)?.total || 0;
      return {
        category,
        limit,
        spent,
        percentage: limit > 0 ? (spent / limit) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  getTotalBudget(): number {
    return Array.from(this.budgets.values()).reduce((sum, limit) => sum + limit, 0);
  }

  private saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(Array.from(this.budgets.entries())));
  }

  loadBudgets() {
    const saved = localStorage.getItem('budgets');
    if (saved) {
      this.budgets = new Map(JSON.parse(saved));
    }
  }
}
