import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { TransactionService } from '../../services/transaction.service';
import { Budget } from '../../models/budget.model';

@Component({
  selector: 'app-budget-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-tracker.component.html',
  styleUrl: './budget-tracker.component.scss'
})
export class BudgetTrackerComponent implements OnInit {
  budgets: Budget[] = [];
  totalBudget = 0;
  totalSpent = 0;
  editingCategory: string | null = null;
  tempLimit = 0;

  constructor(
    private budgetService: BudgetService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.budgetService.loadBudgets();
    this.loadBudgets();
  }

  loadBudgets() {
    this.budgets = this.budgetService.getBudgets();
    this.totalBudget = this.budgetService.getTotalBudget();
    this.totalSpent = this.transactionService.getTotalSpending();
  }

  editBudget(category: string, currentLimit: number) {
    this.editingCategory = category;
    this.tempLimit = currentLimit;
  }

  saveBudget(category: string) {
    if (this.tempLimit > 0) {
      this.budgetService.setBudget(category, this.tempLimit);
      this.loadBudgets();
    }
    this.editingCategory = null;
  }

  cancelEdit() {
    this.editingCategory = null;
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    return 'good';
  }

  getStatusText(percentage: number): string {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 80) return 'Near Limit';
    return 'On Track';
  }
}
