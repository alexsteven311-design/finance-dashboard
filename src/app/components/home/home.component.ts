import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  loadingTrends = false;

  monthlyIncome = 179639;
  monthlySpending = 159161;
  editingIncome = false;
  editingSpending = false;
  tempIncome = 0;
  tempSpending = 0;

  get netSavings() { return this.monthlyIncome - this.monthlySpending; }
  get savingsRate() { return this.monthlyIncome > 0 ? (this.netSavings / this.monthlyIncome) * 100 : 0; }

  readonly baseInvestmentValue = 184100;
  readonly investmentReturnRate = 0.188; // 18.8%

  get investmentValue() {
    const investableSurplus = Math.max(0, this.netSavings * 0.2);
    return Math.round(this.baseInvestmentValue + investableSurplus);
  }

  get investmentReturns() {
    return Math.round(this.investmentValue * this.investmentReturnRate);
  }

  get quickStats() {
    return [
      { icon: '💰', label: 'Monthly Income', value: '₹' + this.monthlyIncome.toLocaleString('en-IN'), change: '+5.2%', positive: true, link: '/spend-analyzer', editable: true, field: 'income' },
      { icon: '💸', label: 'Monthly Spending', value: '₹' + this.monthlySpending.toLocaleString('en-IN'), change: '+2.1%', positive: false, link: '/spend-analyzer', editable: true, field: 'spending' },
      { icon: '📈', label: 'Investment Value', value: '₹1,84,100', change: '+18.8%', positive: true, link: '/investment-tracker', editable: false, field: '' },
      { icon: '💵', label: 'Net Savings', value: '₹' + this.netSavings.toLocaleString('en-IN'), change: this.savingsRate.toFixed(1) + '%', positive: this.netSavings >= 0, link: '/spend-analyzer', editable: false, field: '' }
    ];
  }

  startEdit(field: string) {
    if (field === 'income') { this.tempIncome = this.monthlyIncome; this.editingIncome = true; }
    if (field === 'spending') { this.tempSpending = this.monthlySpending; this.editingSpending = true; }
  }

  saveEdit(field: string) {
    if (field === 'income') { this.monthlyIncome = this.tempIncome > 0 ? this.tempIncome : this.monthlyIncome; this.editingIncome = false; }
    if (field === 'spending') { this.monthlySpending = this.tempSpending > 0 ? this.tempSpending : this.monthlySpending; this.editingSpending = false; }
  }

  cancelEdit(field: string) {
    if (field === 'income') this.editingIncome = false;
    if (field === 'spending') this.editingSpending = false;
  }

  isEditing(field: string) {
    return (field === 'income' && this.editingIncome) || (field === 'spending' && this.editingSpending);
  }

  financialSummary = {
    totalIncome: 179639,
    totalSpending: 159161,
    netSavings: 20478,
    investmentValue: 184100,
    investmentReturns: 29100,
    topSpendingCategory: 'Housing & Loans',
    topSpendingAmount: 40250
  };

  recentInsights = [
    { type: 'warning', title: 'High Housing Expenses', message: 'Housing costs are 25% of income. Consider reviewing.' },
    { type: 'success', title: 'Strong Investment Returns', message: 'Your portfolio gained 18.8% this month!' },
    { type: 'info', title: 'Dining Expenses Up', message: 'Food spending increased by ₹3,500 this month.' }
  ];

  topInvestments = [
    { name: 'HDFC Equity Fund', value: 62000, returns: 24 },
    { name: 'Infosys Stock', value: 48000, returns: 20 },
    { name: 'Gold ETF', value: 23500, returns: 17.5 }
  ];

  spendingBreakdown = [
    { category: 'Housing & Loans', amount: 40250, percent: 25.3 },
    { category: 'Food & Dining', amount: 18500, percent: 11.6 },
    { category: 'UPI Transfers', amount: 15000, percent: 9.4 },
    { category: 'Education', amount: 60000, percent: 37.7 }
  ];

  marketTrends = [
    { 
      icon: '🏦', 
      title: 'RBI Rate Cut Expected', 
      description: 'Central bank may reduce rates by 25 bps, positive for debt funds and real estate investments.',
      impact: 'positive',
      change: 2.5,
      timeAgo: '2 hours ago'
    },
    { 
      icon: '💹', 
      title: 'IT Sector Rally', 
      description: 'Tech stocks up 4% on strong Q4 results. Your equity holdings may benefit.',
      impact: 'positive',
      change: 4.2,
      timeAgo: '5 hours ago'
    },
    { 
      icon: '⚠️', 
      title: 'Gold Prices Volatile', 
      description: 'Gold ETFs showing high volatility due to global uncertainty. Consider rebalancing.',
      impact: 'warning',
      change: -1.8,
      timeAgo: '1 day ago'
    },
    { 
      icon: '📊', 
      title: 'Mutual Fund Inflows Strong', 
      description: 'SIP inflows hit record high. Good time to increase systematic investments.',
      impact: 'neutral',
      change: 0.8,
      timeAgo: '3 hours ago'
    }
  ];

  async refreshTrends() {
    this.loadingTrends = true;
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, call AI service to analyze market data
    this.marketTrends = [
      { 
        icon: '🌐', 
        title: 'Global Markets Bullish', 
        description: 'International indices showing strong momentum. Diversify into global funds.',
        impact: 'positive',
        change: 3.1,
        timeAgo: 'Just now'
      },
      ...this.marketTrends.slice(0, 3)
    ];
    
    this.loadingTrends = false;
  }
}
