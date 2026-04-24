import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { AiInsightsService, AIInsight } from '../../services/ai-insights.service';
import { Transaction, CategorySummary } from '../../models/transaction.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-spend-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spend-analyzer.component.html',
  styleUrl: './spend-analyzer.component.scss'
})
export class SpendAnalyzerComponent {
  transactions: Transaction[] = [];
  categorySummary: CategorySummary[] = [];
  totalSpending = 0;
  totalIncome = 0;
  fileName = '';
  pieChart: any;
  barChart: any;
  aiInsights: AIInsight[] = [];
  loadingInsights = false;

  constructor(
    private transactionService: TransactionService,
    private aiInsightsService: AiInsightsService
  ) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      console.log('File selected:', file.name);
      this.transactionService.parseExcelFile(file)
        .then(() => {
          console.log('File parsed successfully');
          this.loadData();
        })
        .catch(error => {
          console.error('Error parsing file:', error);
          alert('Error parsing file. Please check the console for details.');
        });
    }
  }

  loadData() {
    this.transactions = this.transactionService.getTransactions();
    console.log('Transactions loaded:', this.transactions.length);
    this.categorySummary = this.transactionService.getCategorySummary();
    console.log('Category summary:', this.categorySummary);
    this.totalSpending = this.transactionService.getTotalSpending();
    console.log('Total spending:', this.totalSpending);
    this.totalIncome = this.transactionService.getTotalIncome();
    console.log('Total income:', this.totalIncome);
    this.createCharts();
    this.generateInsights();
  }

  async generateInsights() {
    this.loadingInsights = true;
    try {
      this.aiInsights = await this.aiInsightsService.analyzeTransactions(this.transactions, this.categorySummary);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      this.loadingInsights = false;
    }
  }

  createCharts() {
    if (this.pieChart) this.pieChart.destroy();
    if (this.barChart) this.barChart.destroy();

    const labels = this.categorySummary.map(c => c.category);
    const data = this.categorySummary.map(c => c.total);
    const colors = ['#796df6', '#0f79f3', '#2ed47e', '#ffb264', '#00cae3', '#e74c3c', '#475569', '#919aa3'];

    setTimeout(() => {
      const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
      const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;

      if (pieCanvas && barCanvas) {
        this.pieChart = new Chart(pieCanvas, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'right' },
              title: { display: true, text: 'Spending by Category' }
            }
          }
        });

        this.barChart = new Chart(barCanvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Amount (₹)',
              data: data,
              backgroundColor: '#36A2EB'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Category Breakdown' }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    }, 100);
  }
}
