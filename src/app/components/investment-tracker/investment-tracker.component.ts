import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Investment {
  id: number;
  name: string;
  type: 'Equity' | 'Debt' | 'Gold' | 'Real Estate' | 'Crypto';
  investedAmount: number;
  currentValue: number;
  returns: number;
  returnsPercent: number;
  purchaseDate: Date;
}

interface Decision {
  signal: 'BUY' | 'HOLD' | 'SELL';
  reason: string;
  confidence: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-investment-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment-tracker.component.html',
  styleUrl: './investment-tracker.component.scss'
})
export class InvestmentTrackerComponent implements OnInit {
  activeTab: 'portfolio' | 'decisions' | 'analysis' = 'portfolio';

  investments: Investment[] = [
    { id: 1, name: 'HDFC Equity Fund', type: 'Equity', investedAmount: 50000, currentValue: 62000, returns: 12000, returnsPercent: 24, purchaseDate: new Date('2023-01-15') },
    { id: 2, name: 'SBI Debt Fund', type: 'Debt', investedAmount: 30000, currentValue: 32100, returns: 2100, returnsPercent: 7, purchaseDate: new Date('2023-03-20') },
    { id: 3, name: 'Gold ETF', type: 'Gold', investedAmount: 20000, currentValue: 23500, returns: 3500, returnsPercent: 17.5, purchaseDate: new Date('2023-06-10') },
    { id: 4, name: 'Infosys Stock', type: 'Equity', investedAmount: 40000, currentValue: 48000, returns: 8000, returnsPercent: 20, purchaseDate: new Date('2023-02-05') },
    { id: 5, name: 'Bitcoin', type: 'Crypto', investedAmount: 15000, currentValue: 18500, returns: 3500, returnsPercent: 23.3, purchaseDate: new Date('2023-08-12') }
  ];

  newInvestment: Partial<Investment> = { type: 'Equity', purchaseDate: new Date() };
  showAddForm = false;
  allocationChart: any;
  performanceChart: any;

  ngOnInit() {
    setTimeout(() => this.createCharts(), 100);
  }

  // ── Totals ──────────────────────────────────────────────
  get totalInvested() { return this.investments.reduce((s, i) => s + i.investedAmount, 0); }
  get totalCurrent() { return this.investments.reduce((s, i) => s + i.currentValue, 0); }
  get totalReturns() { return this.totalCurrent - this.totalInvested; }
  get totalReturnsPercent() { return (this.totalReturns / this.totalInvested) * 100; }

  // ── Portfolio Health Score (0–100) ──────────────────────
  get healthScore(): number {
    let score = 50;
    // Returns contribution
    if (this.totalReturnsPercent > 20) score += 20;
    else if (this.totalReturnsPercent > 10) score += 10;
    else if (this.totalReturnsPercent < 0) score -= 20;
    // Diversification
    const types = new Set(this.investments.map(i => i.type)).size;
    score += Math.min(types * 5, 20);
    // No single holding > 50%
    const maxAlloc = Math.max(...this.investments.map(i => (i.currentValue / this.totalCurrent) * 100));
    if (maxAlloc < 30) score += 10;
    else if (maxAlloc > 50) score -= 10;
    return Math.min(100, Math.max(0, score));
  }

  get healthLabel(): string {
    if (this.healthScore >= 80) return 'Excellent';
    if (this.healthScore >= 60) return 'Good';
    if (this.healthScore >= 40) return 'Fair';
    return 'Needs Attention';
  }

  get healthClass(): string {
    if (this.healthScore >= 80) return 'excellent';
    if (this.healthScore >= 60) return 'good';
    if (this.healthScore >= 40) return 'fair';
    return 'poor';
  }

  // ── Decision Engine ─────────────────────────────────────
  getDecision(inv: Investment): Decision {
    const holdingMonths = (Date.now() - new Date(inv.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);

    // SELL signals
    if (inv.returnsPercent < -10) return { signal: 'SELL', reason: `Down ${Math.abs(inv.returnsPercent).toFixed(1)}% — cut losses before further decline.`, confidence: 'High' };
    if (inv.type === 'Crypto' && inv.returnsPercent > 50) return { signal: 'SELL', reason: 'Crypto up 50%+ — book partial profits, high volatility risk.', confidence: 'Medium' };
    if (inv.returnsPercent > 40 && holdingMonths > 12) return { signal: 'SELL', reason: `Exceptional ${inv.returnsPercent.toFixed(1)}% gain — consider booking profits and rebalancing.`, confidence: 'Medium' };

    // BUY signals
    if (inv.returnsPercent > 15 && inv.type === 'Equity' && holdingMonths > 6) return { signal: 'BUY', reason: `Strong ${inv.returnsPercent.toFixed(1)}% returns — good momentum, consider adding more via SIP.`, confidence: 'High' };
    if (inv.type === 'Debt' && inv.returnsPercent >= 6) return { signal: 'BUY', reason: 'Stable debt returns — good for portfolio stability, increase allocation.', confidence: 'Medium' };
    if (inv.type === 'Gold' && inv.returnsPercent > 10) return { signal: 'BUY', reason: 'Gold performing well as hedge — maintain or slightly increase allocation.', confidence: 'Medium' };

    // HOLD
    if (inv.returnsPercent >= 0 && inv.returnsPercent <= 15) return { signal: 'HOLD', reason: `Moderate ${inv.returnsPercent.toFixed(1)}% returns — performing steadily, continue holding.`, confidence: 'High' };
    if (holdingMonths < 6) return { signal: 'HOLD', reason: 'Investment is less than 6 months old — too early to make a decision.', confidence: 'High' };

    return { signal: 'HOLD', reason: 'No strong signal — monitor performance over next quarter.', confidence: 'Low' };
  }

  // ── Diversification Analysis ────────────────────────────
  get allocationByType(): { type: string; value: number; percent: number; recommended: number; status: string }[] {
    const recommended: Record<string, number> = { Equity: 50, Debt: 20, Gold: 15, 'Real Estate': 10, Crypto: 5 };
    const grouped: Record<string, number> = {};
    this.investments.forEach(i => grouped[i.type] = (grouped[i.type] || 0) + i.currentValue);

    return Object.entries(grouped).map(([type, value]) => {
      const percent = (value / this.totalCurrent) * 100;
      const rec = recommended[type] || 5;
      const diff = percent - rec;
      const status = diff > 15 ? 'Over-allocated' : diff < -15 ? 'Under-allocated' : 'Balanced';
      return { type, value, percent, recommended: rec, status };
    }).sort((a, b) => b.percent - a.percent);
  }

  get riskAlerts(): { icon: string; level: 'high' | 'medium' | 'low'; message: string }[] {
    const alerts = [];
    const cryptoAlloc = this.allocationByType.find(a => a.type === 'Crypto');
    const equityAlloc = this.allocationByType.find(a => a.type === 'Equity');
    const debtAlloc = this.allocationByType.find(a => a.type === 'Debt');

    if (cryptoAlloc && cryptoAlloc.percent > 10) alerts.push({ icon: '🚨', level: 'high' as const, message: `Crypto is ${cryptoAlloc.percent.toFixed(1)}% of portfolio — highly volatile, recommended max is 5%.` });
    if (equityAlloc && equityAlloc.percent > 70) alerts.push({ icon: '⚠️', level: 'medium' as const, message: `Equity at ${equityAlloc.percent.toFixed(1)}% — over-concentrated in stocks, add debt/gold for stability.` });
    if (!debtAlloc || debtAlloc.percent < 10) alerts.push({ icon: '⚠️', level: 'medium' as const, message: 'Low debt allocation — add debt funds for portfolio stability and downside protection.' });
    if (this.investments.length < 3) alerts.push({ icon: '💡', level: 'low' as const, message: 'Portfolio has fewer than 3 investments — diversify across more asset classes.' });
    if (this.totalReturnsPercent > 0) alerts.push({ icon: '✅', level: 'low' as const, message: `Overall portfolio is up ${this.totalReturnsPercent.toFixed(1)}% — review rebalancing every 6 months.` });

    return alerts;
  }

  // ── CRUD ────────────────────────────────────────────────
  addInvestment() {
    if (this.newInvestment.name && this.newInvestment.investedAmount && this.newInvestment.currentValue) {
      const returns = this.newInvestment.currentValue - this.newInvestment.investedAmount;
      this.investments.push({
        id: Date.now(),
        name: this.newInvestment.name,
        type: this.newInvestment.type as any,
        investedAmount: this.newInvestment.investedAmount,
        currentValue: this.newInvestment.currentValue,
        returns,
        returnsPercent: (returns / this.newInvestment.investedAmount) * 100,
        purchaseDate: this.newInvestment.purchaseDate || new Date()
      });
      this.newInvestment = { type: 'Equity', purchaseDate: new Date() };
      this.showAddForm = false;
      setTimeout(() => this.createCharts(), 100);
    }
  }

  deleteInvestment(id: number) {
    this.investments = this.investments.filter(i => i.id !== id);
    setTimeout(() => this.createCharts(), 100);
  }

  // ── Charts ───────────────────────────────────────────────
  createCharts() {
    if (this.allocationChart) this.allocationChart.destroy();
    if (this.performanceChart) this.performanceChart.destroy();

    const allocCanvas = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (allocCanvas) {
      const groups = this.investments.reduce((acc, inv) => { acc[inv.type] = (acc[inv.type] || 0) + inv.currentValue; return acc; }, {} as Record<string, number>);
      this.allocationChart = new Chart(allocCanvas, {
        type: 'doughnut',
        data: { labels: Object.keys(groups), datasets: [{ data: Object.values(groups), backgroundColor: ['#796df6', '#0f79f3', '#ffb264', '#2ed47e', '#00cae3'] }] },
        options: { responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Portfolio Allocation' } } }
      });
    }

    const perfCanvas = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (perfCanvas) {
      this.performanceChart = new Chart(perfCanvas, {
        type: 'bar',
        data: {
          labels: this.investments.map(i => i.name),
          datasets: [{ label: 'Returns %', data: this.investments.map(i => i.returnsPercent), backgroundColor: this.investments.map(i => i.returnsPercent >= 0 ? '#2ed47e' : '#e74c3c') }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Returns by Investment' } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  getSignalClass(signal: string) { return { BUY: 'signal-buy', HOLD: 'signal-hold', SELL: 'signal-sell' }[signal] || ''; }
  getConfidenceClass(c: string) { return { High: 'conf-high', Medium: 'conf-medium', Low: 'conf-low' }[c] || ''; }
  getStatusClass(s: string) { return s === 'Balanced' ? 'status-good' : s === 'Over-allocated' ? 'status-over' : 'status-under'; }
  getAlertClass(l: string) { return { high: 'alert-high', medium: 'alert-medium', low: 'alert-low' }[l] || ''; }
}
