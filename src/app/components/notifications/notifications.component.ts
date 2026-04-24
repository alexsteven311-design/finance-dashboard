import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { BudgetService } from '../../services/budget.service';


export interface Notification {
  id: number;
  type: 'warning' | 'danger' | 'success' | 'info';
  category: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filter: 'all' | 'unread' | 'warning' | 'danger' | 'success' | 'info' = 'all';

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.budgetService.loadBudgets();
    this.generateAlerts();
  }

  generateAlerts() {
    const alerts: Notification[] = [];
    let id = 1;

    const budgets = this.budgetService.getBudgets();
    const totalSpending = this.transactionService.getTotalSpending();
    const totalIncome = this.transactionService.getTotalIncome();

    // Budget alerts
    budgets.forEach(b => {
      if (b.spent === 0) return;
      if (b.percentage >= 100) {
        alerts.push({
          id: id++, type: 'danger', category: 'Budget',
          title: `Over Budget: ${b.category}`,
          message: `You've exceeded your ₹${b.limit.toLocaleString()} budget for ${b.category}. Spent ₹${b.spent.toLocaleString()} (${b.percentage.toFixed(0)}%).`,
          time: 'Based on latest transactions', read: false
        });
      } else if (b.percentage >= 80) {
        alerts.push({
          id: id++, type: 'warning', category: 'Budget',
          title: `Near Limit: ${b.category}`,
          message: `You've used ${b.percentage.toFixed(0)}% of your ${b.category} budget. ₹${(b.limit - b.spent).toLocaleString()} remaining.`,
          time: 'Based on latest transactions', read: false
        });
      }
    });

    // Savings alert
    if (totalIncome > 0 && totalSpending > 0) {
      const savingsRate = ((totalIncome - totalSpending) / totalIncome) * 100;
      if (savingsRate < 0) {
        alerts.push({
          id: id++, type: 'danger', category: 'Savings',
          title: 'Spending Exceeds Income',
          message: `Your expenses (₹${totalSpending.toLocaleString()}) exceed your income (₹${totalIncome.toLocaleString()}). Review your budget immediately.`,
          time: 'Based on latest transactions', read: false
        });
      } else if (savingsRate < 20) {
        alerts.push({
          id: id++, type: 'warning', category: 'Savings',
          title: 'Low Savings Rate',
          message: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
          time: 'Based on latest transactions', read: false
        });
      } else {
        alerts.push({
          id: id++, type: 'success', category: 'Savings',
          title: 'Healthy Savings Rate',
          message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
          time: 'Based on latest transactions', read: true
        });
      }
    }

    // Investment alerts (static based on tracker data)
    alerts.push({
      id: id++, type: 'success', category: 'Investment',
      title: 'Portfolio Performing Well',
      message: 'Your investment portfolio has gained overall positive returns. HDFC Equity Fund leads with +24% returns.',
      time: 'Investment Tracker data', read: true
    });
    alerts.push({
      id: id++, type: 'info', category: 'Investment',
      title: 'Diversification Tip',
      message: 'Your portfolio is concentrated in Equity. Consider diversifying into Debt or Gold for better risk balance.',
      time: 'Investment Tracker data', read: false
    });

    // No transaction data fallback
    if (totalSpending === 0 && totalIncome === 0) {
      alerts.push({
        id: id++, type: 'info', category: 'General',
        title: 'No Transaction Data',
        message: 'Upload your bank statement in Spend Analyzer to get personalized spending alerts.',
        time: 'Now', read: false
      });
    }

    this.notifications = alerts;
  }

  get filtered(): Notification[] {
    if (this.filter === 'all') return this.notifications;
    if (this.filter === 'unread') return this.notifications.filter(n => !n.read);
    return this.notifications.filter(n => n.type === this.filter);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(id: number) {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
  }

  dismiss(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  countByType(type: string): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  getIcon(type: string): string {
    return { warning: '⚠️', danger: '🚨', success: '✅', info: 'ℹ️' }[type] || 'ℹ️';
  }
}
