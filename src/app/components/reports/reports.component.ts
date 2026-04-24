import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { CategorySummary } from '../../models/transaction.model';

interface Suggestion {
  icon: string;
  category: string;
  issue: string;
  tip: string;
  priority: 'high' | 'medium' | 'low';
}

interface CategoryReport {
  category: string;
  total: number;
  percentage: number;
  count: number;
  avgPerTransaction: number;
  status: 'high' | 'moderate' | 'low';
}

interface AdvisorTip {
  category: string;
  icon: string;
  budgetLimit: number;
  amountSpent: number;
  overBy: number;
  overByPct: number;
  severity: 'critical' | 'warning';
  advice: string[];
  quickWins: string[];
  monthlySaving: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  activeTab: 'report' | 'advisor' = 'report';

  totalIncome = 0;
  totalSpending = 0;
  savingsRate = 0;
  categoryReports: CategoryReport[] = [];
  suggestions: Suggestion[] = [];
  advisorTips: AdvisorTip[] = [];
  hasData = false;
  totalPotentialSaving = 0;

  // Recommended % of income per category
  private readonly benchmarks: Record<string, number> = {
    'Food & Dining': 15,
    'Groceries': 10,
    'Shopping': 10,
    'Transportation': 10,
    'Housing & Loans': 30,
    'Utilities': 5,
    'Entertainment': 5,
    'Healthcare': 5,
    'Education': 10,
    'Other': 5
  };

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.budgetService.loadBudgets();
    this.loadReport();
  }

  loadReport() {
    const transactions = this.transactionService.getTransactions();
    this.hasData = transactions.length > 0;
    if (!this.hasData) return;

    this.totalIncome = this.transactionService.getTotalIncome();
    this.totalSpending = this.transactionService.getTotalSpending();
    this.savingsRate = this.totalIncome > 0
      ? ((this.totalIncome - this.totalSpending) / this.totalIncome) * 100
      : 0;

    const summary: CategorySummary[] = this.transactionService.getCategorySummary();

    this.categoryReports = summary.map(c => ({
      category: c.category,
      total: c.total,
      percentage: c.percentage,
      count: c.count,
      avgPerTransaction: c.total / c.count,
      status: c.percentage > 25 ? 'high' : c.percentage > 12 ? 'moderate' : 'low'
    }));

    this.generateSuggestions(summary);
    this.generateAdvisorTips();
  }

  private generateSuggestions(summary: CategorySummary[]) {
    this.suggestions = [];

    // Savings rate check
    if (this.savingsRate < 0) {
      this.suggestions.push({
        icon: '🚨', category: 'Overall',
        issue: `You're spending ₹${(this.totalSpending - this.totalIncome).toLocaleString()} more than you earn.`,
        tip: 'Immediately cut discretionary spending like dining, shopping and entertainment until expenses fall below income.',
        priority: 'high'
      });
    } else if (this.savingsRate < 20) {
      this.suggestions.push({
        icon: '⚠️', category: 'Overall',
        issue: `Your savings rate is only ${this.savingsRate.toFixed(1)}% — below the recommended 20%.`,
        tip: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Identify your top 2 expense categories and reduce them by 10%.',
        priority: 'high'
      });
    } else {
      this.suggestions.push({
        icon: '✅', category: 'Overall',
        issue: `Savings rate is ${this.savingsRate.toFixed(1)}% — healthy!`,
        tip: 'Consider investing your surplus in SIPs or index funds to grow your wealth over time.',
        priority: 'low'
      });
    }

    // Per-category suggestions
    summary.forEach(c => {
      const benchmark = this.benchmarks[c.category];
      const actualPct = this.totalIncome > 0 ? (c.total / this.totalIncome) * 100 : 0;

      if (c.category === 'Food & Dining' && benchmark && actualPct > benchmark) {
        this.suggestions.push({
          icon: '🍽️', category: c.category,
          issue: `Food & Dining is ${actualPct.toFixed(1)}% of income — above the ${benchmark}% benchmark.`,
          tip: 'Meal prep at home 3–4 days a week. Limit restaurant visits to weekends and use cashback offers on food apps.',
          priority: 'medium'
        });
      }

      if (c.category === 'Shopping' && benchmark && actualPct > benchmark) {
        this.suggestions.push({
          icon: '🛍️', category: c.category,
          issue: `Shopping is ${actualPct.toFixed(1)}% of income — above the ${benchmark}% benchmark.`,
          tip: 'Apply a 48-hour rule before any non-essential purchase. Unsubscribe from promotional emails to reduce impulse buying.',
          priority: 'medium'
        });
      }

      if (c.category === 'Entertainment' && benchmark && actualPct > benchmark) {
        this.suggestions.push({
          icon: '🎬', category: c.category,
          issue: `Entertainment is ${actualPct.toFixed(1)}% of income — above the ${benchmark}% benchmark.`,
          tip: 'Audit your subscriptions (Netflix, Spotify, Prime). Cancel ones you use less than twice a month.',
          priority: 'medium'
        });
      }

      if (c.category === 'Transportation' && benchmark && actualPct > benchmark) {
        this.suggestions.push({
          icon: '🚗', category: c.category,
          issue: `Transportation is ${actualPct.toFixed(1)}% of income — above the ${benchmark}% benchmark.`,
          tip: 'Consider carpooling, monthly metro passes, or switching to a bike for short distances to cut fuel and cab costs.',
          priority: 'medium'
        });
      }

      if (c.category === 'UPI Transfers' && c.percentage > 20) {
        this.suggestions.push({
          icon: '📲', category: c.category,
          issue: `${c.percentage.toFixed(1)}% of spending is untracked UPI transfers.`,
          tip: 'Tag your UPI payments with notes so they can be categorized. Untracked spending is the biggest budget leak.',
          priority: 'high'
        });
      }

      if (c.category === 'Housing & Loans' && benchmark && actualPct > benchmark) {
        this.suggestions.push({
          icon: '🏠', category: c.category,
          issue: `Housing & Loans is ${actualPct.toFixed(1)}% of income — above the ${benchmark}% benchmark.`,
          tip: 'If EMIs exceed 30% of income, consider prepaying loans when possible or refinancing at a lower interest rate.',
          priority: 'high'
        });
      }
    });

    // High frequency small transactions
    const highFreq = summary.filter(c => c.count > 15 && c.category !== 'Income');
    if (highFreq.length > 0) {
      this.suggestions.push({
        icon: '🔁', category: highFreq[0].category,
        issue: `${highFreq[0].count} transactions in "${highFreq[0].category}" — many small frequent spends add up.`,
        tip: 'Batch your small purchases. Instead of buying daily, consolidate into 1–2 larger planned purchases per week.',
        priority: 'medium'
      });
    }

    // Sort by priority
    const order = { high: 0, medium: 1, low: 2 };
    this.suggestions.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  private generateAdvisorTips() {
    const budgets = this.budgetService.getBudgets();
    const breached = budgets.filter(b => b.spent > 0 && b.percentage > 80);

    const adviceMap: Record<string, { icon: string; advice: string[]; quickWins: string[] }> = {
      'Food & Dining': {
        icon: '🍽️',
        advice: [
          'Cook at home at least 4 days a week — home meals cost 60–70% less than ordering out.',
          'Set a weekly dining-out budget and stick to it using a prepaid wallet.',
          'Use Zomato/Swiggy only during offers or cashback days to reduce per-order cost.'
        ],
        quickWins: ['Cancel unused food subscriptions', 'Meal prep on Sundays', 'Use loyalty rewards on food apps']
      },
      'Groceries': {
        icon: '🛒',
        advice: [
          'Make a weekly grocery list before shopping — impulse buys add 20–30% to your bill.',
          'Buy staples like rice, dal, and oil in bulk from wholesale stores to save up to 15%.',
          'Use store-brand products instead of premium brands for everyday items.'
        ],
        quickWins: ['Shop once a week instead of daily', 'Compare prices on BigBasket vs DMart', 'Avoid shopping when hungry']
      },
      'Shopping': {
        icon: '🛍️',
        advice: [
          'Apply the 48-hour rule — wait 2 days before any non-essential purchase to avoid impulse buying.',
          'Unsubscribe from all promotional emails and app notifications from shopping platforms.',
          'Set a fixed monthly shopping allowance and use a separate wallet for it.'
        ],
        quickWins: ['Delete saved cards from shopping apps', 'Uninstall shopping apps temporarily', 'Use wishlists instead of buying immediately']
      },
      'Transportation': {
        icon: '🚗',
        advice: [
          'Switch to monthly metro or bus passes — they cost 40–50% less than daily cab rides.',
          'Combine errands into one trip instead of multiple short rides to save on fuel and cab fares.',
          'Use Rapido bike taxis for short distances instead of Uber/Ola cabs.'
        ],
        quickWins: ['Carpool with colleagues', 'Walk for distances under 1km', 'Compare cab prices before booking']
      },
      'Entertainment': {
        icon: '🎬',
        advice: [
          'Audit all your subscriptions — Netflix, Spotify, Prime, Hotstar. Cancel any you use less than twice a month.',
          'Share subscription plans with family members to split costs.',
          'Use free tiers of apps like YouTube, Spotify free, or Jio Cinema instead of paid plans.'
        ],
        quickWins: ['Cancel one unused subscription today', 'Share Netflix with family', 'Use free streaming platforms']
      },
      'Utilities': {
        icon: '💡',
        advice: [
          'Switch off appliances at the plug when not in use — standby power adds 5–10% to electricity bills.',
          'Use energy-efficient LED bulbs and 5-star rated appliances to reduce electricity costs.',
          'Compare broadband plans annually — better deals are often available for existing customers.'
        ],
        quickWins: ['Set AC temperature to 24°C', 'Fix leaking taps to reduce water bills', 'Switch to a cheaper mobile plan']
      },
      'Healthcare': {
        icon: '🏥',
        advice: [
          'Buy medicines from generic pharmacies like Jan Aushadhi — up to 80% cheaper than branded drugs.',
          'Use government hospitals or CGHS for routine checkups instead of private clinics.',
          'Invest in a health insurance plan to avoid large out-of-pocket medical expenses.'
        ],
        quickWins: ['Buy generic medicines', 'Use teleconsultation apps for minor issues', 'Get annual health checkup packages']
      },
      'Housing & Loans': {
        icon: '🏠',
        advice: [
          'If EMI exceeds 30% of income, make partial prepayments whenever you have surplus to reduce interest burden.',
          'Refinance your home loan if current rates are 0.5% or more below your existing rate.',
          'Negotiate rent with your landlord annually — many landlords prefer stable tenants over hikes.'
        ],
        quickWins: ['Pay one extra EMI per year', 'Check for lower interest rate offers', 'Avoid taking new loans until existing ones are cleared']
      },
      'Education': {
        icon: '📚',
        advice: [
          'Use free platforms like NPTEL, Coursera audit mode, or YouTube for learning instead of paid courses.',
          'Buy second-hand textbooks or borrow from libraries instead of buying new ones.',
          'Look for early-bird discounts or group enrollments for courses.'
        ],
        quickWins: ['Audit free Coursera courses', 'Use library memberships', 'Share course costs with friends']
      },
      'Other': {
        icon: '📦',
        advice: [
          'Review all "Other" transactions and recategorize them — hidden spending often hides here.',
          'Set a monthly miscellaneous budget of no more than 5% of income.',
          'Track every "Other" expense for 30 days to identify patterns.'
        ],
        quickWins: ['Review last 10 "Other" transactions', 'Set a ₹500/week misc limit', 'Use a spending journal']
      },
      'UPI Transfers': {
        icon: '📲',
        advice: [
          'Add notes to every UPI payment so transfers can be categorized properly.',
          'Review all UPI transfers monthly — untracked transfers are the biggest budget leak.',
          'Avoid splitting bills informally — use apps like Splitwise to track shared expenses.'
        ],
        quickWins: ['Add remarks to UPI payments', 'Review UPI history weekly', 'Set UPI transaction limits']
      }
    };

    this.advisorTips = breached.map(b => {
      const overBy = b.spent - b.limit;
      const overByPct = b.percentage - 100;
      const map = adviceMap[b.category] || { icon: '💰', advice: ['Review and reduce spending in this category.'], quickWins: ['Set a stricter limit'] };
      const monthlySaving = Math.round(overBy * 0.6); // realistic 60% reduction target
      return {
        category: b.category,
        icon: map.icon,
        budgetLimit: b.limit,
        amountSpent: b.spent,
        overBy,
        overByPct,
        severity: (b.percentage >= 120 ? 'critical' : 'warning') as 'critical' | 'warning',
        advice: map.advice,
        quickWins: map.quickWins,
        monthlySaving
      };
    }).sort((a, b) => b.overByPct - a.overByPct);

    this.totalPotentialSaving = this.advisorTips.reduce((s, t) => s + t.monthlySaving, 0);
  }

  getSeverityClass(s: string) { return s === 'critical' ? 'severity-critical' : 'severity-warning'; }

  getStatusClass(status: string): string {
    return { high: 'status-high', moderate: 'status-moderate', low: 'status-low' }[status] || '';
  }

  getPriorityClass(priority: string): string {
    return { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' }[priority] || '';
  }

  getBenchmark(category: string): number {
    return this.benchmarks[category] || 0;
  }

  getActualPct(total: number): number {
    return this.totalIncome > 0 ? (total / this.totalIncome) * 100 : 0;
  }
}
