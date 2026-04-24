import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface MutualFund {
  schemeCode: number;
  schemeName: string;
  nav: number;
  date: string;
  change: number;
  changePercent: number;
  category: string;
  risk: 'low' | 'medium' | 'high';
  oneYearReturn: number;
}

export interface FinancialNews {
  title: string;
  description: string;
  source: string;
  time: string;
  impact: 'positive' | 'negative' | 'neutral';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class MutualFundService {

  // Top popular Indian mutual funds with their MFAPI scheme codes
  private readonly topFunds = [
    { code: 120503, name: 'SBI Bluechip Fund', category: 'Large Cap', risk: 'medium' as const, oneYearReturn: 18.5 },
    { code: 119598, name: 'Mirae Asset Large Cap Fund', category: 'Large Cap', risk: 'medium' as const, oneYearReturn: 19.2 },
    { code: 120505, name: 'SBI Small Cap Fund', category: 'Small Cap', risk: 'high' as const, oneYearReturn: 28.4 },
    { code: 118989, name: 'Axis Midcap Fund', category: 'Mid Cap', risk: 'high' as const, oneYearReturn: 24.1 },
    { code: 120716, name: 'HDFC Balanced Advantage Fund', category: 'Hybrid', risk: 'medium' as const, oneYearReturn: 16.8 },
    { code: 119270, name: 'ICICI Pru Liquid Fund', category: 'Liquid', risk: 'low' as const, oneYearReturn: 7.2 },
    { code: 120594, name: 'Nippon India Gilt Fund', category: 'Debt', risk: 'low' as const, oneYearReturn: 8.1 },
    { code: 125354, name: 'Parag Parikh Flexi Cap Fund', category: 'Flexi Cap', risk: 'medium' as const, oneYearReturn: 22.3 },
  ];

  constructor(private http: HttpClient) {}

  async getLiveFunds(): Promise<MutualFund[]> {
    const results: MutualFund[] = [];

    await Promise.all(this.topFunds.map(async (fund) => {
      try {
        const data: any = await firstValueFrom(
          this.http.get(`https://api.mfapi.in/mf/${fund.code}/latest`)
        );
        if (data?.data?.length >= 2) {
          const latest = parseFloat(data.data[0].nav);
          const prev = parseFloat(data.data[1].nav);
          const change = latest - prev;
          const changePercent = (change / prev) * 100;
          results.push({
            schemeCode: fund.code,
            schemeName: fund.name,
            nav: latest,
            date: data.data[0].date,
            change: parseFloat(change.toFixed(4)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            category: fund.category,
            risk: fund.risk,
            oneYearReturn: fund.oneYearReturn
          });
        }
      } catch {
        // Push with fallback static data if API fails
        results.push({
          schemeCode: fund.code,
          schemeName: fund.name,
          nav: 0,
          date: 'N/A',
          change: 0,
          changePercent: 0,
          category: fund.category,
          risk: fund.risk,
          oneYearReturn: fund.oneYearReturn
        });
      }
    }));

    return results.sort((a, b) => b.oneYearReturn - a.oneYearReturn);
  }

  getFinancialNews(): FinancialNews[] {
    // Curated static financial news relevant to Indian investors
    // In production, replace with a live news API
    return [
      {
        title: 'RBI Holds Repo Rate at 6.5%',
        description: 'Reserve Bank of India maintains repo rate. Debt funds and fixed income instruments remain attractive for conservative investors.',
        source: 'RBI Bulletin',
        time: 'Today',
        impact: 'neutral',
        icon: '🏦'
      },
      {
        title: 'Nifty 50 Hits New High',
        description: 'Indian equity markets rally on strong FII inflows. Large cap and index funds expected to benefit from continued momentum.',
        source: 'NSE India',
        time: 'Today',
        impact: 'positive',
        icon: '📈'
      },
      {
        title: 'SIP Inflows Cross ₹21,000 Crore',
        description: 'Systematic Investment Plans hit record monthly inflows. Mutual fund industry sees strong retail participation.',
        source: 'AMFI',
        time: '1 day ago',
        impact: 'positive',
        icon: '💹'
      },
      {
        title: 'Gold ETFs See Surge in Demand',
        description: 'Global uncertainty drives investors to gold. Gold ETFs and sovereign gold bonds gaining traction as safe haven assets.',
        source: 'MCX',
        time: '2 days ago',
        impact: 'positive',
        icon: '🥇'
      },
      {
        title: 'IT Sector Funds Underperform',
        description: 'Technology sector mutual funds lag broader market due to global slowdown concerns. Diversification advised.',
        source: 'BSE India',
        time: '2 days ago',
        impact: 'negative',
        icon: '⚠️'
      },
      {
        title: 'SEBI Introduces New MF Categories',
        description: 'Market regulator introduces new mutual fund categories for better investor clarity and fund differentiation.',
        source: 'SEBI',
        time: '3 days ago',
        impact: 'neutral',
        icon: '📋'
      }
    ];
  }

  calculateSIP(targetAmount: number, currentAmount: number, months: number, annualReturn: number): number {
    const gap = targetAmount - currentAmount * Math.pow(1 + annualReturn / 12 / 100, months);
    const monthlyRate = annualReturn / 12 / 100;
    return gap / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  projectValue(currentAmount: number, monthlySIP: number, months: number, annualReturn: number): number {
    const monthlyRate = annualReturn / 12 / 100;
    const futurePresent = currentAmount * Math.pow(1 + monthlyRate, months);
    const futureSIP = monthlySIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return futurePresent + futureSIP;
  }
}
