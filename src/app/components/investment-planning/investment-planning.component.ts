import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MutualFundService, MutualFund, FinancialNews } from '../../services/mutual-fund.service';
import { InvestmentAiService } from '../../services/investment-ai.service';
import { InvestmentGoal, InvestmentPlan } from '../../models/investment.model';

Chart.register(...registerables);

@Component({
  selector: 'app-investment-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment-planning.component.html',
  styleUrl: './investment-planning.component.scss'
})
export class InvestmentPlanningComponent implements OnInit {
  activeTab: 'funds' | 'news' | 'planner' = 'funds';

  // Live funds
  funds: MutualFund[] = [];
  loadingFunds = false;
  lastUpdated = '';

  // News
  news: FinancialNews[] = [];

  // Planner
  goal: InvestmentGoal = {
    goalName: 'Retirement Fund',
    targetAmount: 1000000,
    currentAmount: 100000,
    timeHorizon: 60,
    riskTolerance: 'medium'
  };
  plan: InvestmentPlan | null = null;
  loadingPlan = false;
  allocationChart: any;
  projectionChart: any;

  constructor(
    private mfService: MutualFundService,
    private investmentAiService: InvestmentAiService
  ) {}

  ngOnInit() {
    this.loadFunds();
    this.news = this.mfService.getFinancialNews();
  }

  async loadFunds() {
    this.loadingFunds = true;
    try {
      this.funds = await this.mfService.getLiveFunds();
      this.lastUpdated = new Date().toLocaleTimeString('en-IN');
    } catch {
      this.funds = [];
    } finally {
      this.loadingFunds = false;
    }
  }

  async generatePlan() {
    this.loadingPlan = true;
    try {
      this.plan = await this.investmentAiService.generateInvestmentPlan(this.goal);
      setTimeout(() => this.createCharts(), 100);
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingPlan = false;
    }
  }

  createCharts() {
    if (!this.plan) return;
    if (this.allocationChart) this.allocationChart.destroy();
    if (this.projectionChart) this.projectionChart.destroy();

    const allocCanvas = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (allocCanvas) {
      this.allocationChart = new Chart(allocCanvas, {
        type: 'doughnut',
        data: {
          labels: this.plan.allocations.map(a => a.fundName),
          datasets: [{ data: this.plan.allocations.map(a => a.allocation), backgroundColor: ['#796df6', '#0f79f3', '#2ed47e', '#ffb264', '#00cae3', '#e74c3c'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'right' } } }
      });
    }

    const projCanvas = document.getElementById('projectionChart') as HTMLCanvasElement;
    if (projCanvas && this.plan) {
      const avgReturn = this.plan.allocations.reduce((s, a) => s + (a.allocation * a.expectedReturn / 100), 0);
      const labels: string[] = [];
      const values: number[] = [];
      for (let m = 0; m <= this.goal.timeHorizon; m += 6) {
        labels.push(`Month ${m}`);
        values.push(Math.round(this.mfService.projectValue(this.goal.currentAmount, this.plan.monthlyInvestment, m, avgReturn)));
      }
      this.projectionChart = new Chart(projCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Projected Value (₹)',
            data: values,
            borderColor: '#796df6',
            backgroundColor: 'rgba(121,109,246,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, title: { display: true, text: 'Portfolio Growth Projection' } },
          scales: { y: { beginAtZero: false, ticks: { callback: (v: any) => '₹' + Number(v).toLocaleString('en-IN') } } }
        }
      });
    }
  }

  getRiskClass(risk: string) {
    return { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[risk] || '';
  }

  getNavClass(change: number) { return change >= 0 ? 'positive' : 'negative'; }
  getImpactClass(impact: string) { return { positive: 'impact-positive', negative: 'impact-negative', neutral: 'impact-neutral' }[impact] || ''; }
}
