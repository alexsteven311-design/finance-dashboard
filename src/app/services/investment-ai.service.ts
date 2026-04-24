import { Injectable } from '@angular/core';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { InvestmentGoal, InvestmentPlan, FundAllocation } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentAiService {
  private client: BedrockRuntimeClient | null = null;

  constructor() {
    try {
      this.client = new BedrockRuntimeClient({ region: 'us-east-1' });
    } catch (error) {
      console.log('AWS credentials not configured, using local planning');
    }
  }

  async generateInvestmentPlan(goal: InvestmentGoal): Promise<InvestmentPlan> {
    if (this.client) {
      return this.generateWithAI(goal);
    } else {
      return this.generateLocally(goal);
    }
  }

  private async generateWithAI(goal: InvestmentGoal): Promise<InvestmentPlan> {
    try {
      const prompt = `Create an investment allocation plan for:
Goal: ${goal.goalName}
Target: ₹${goal.targetAmount}
Current: ₹${goal.currentAmount}
Time: ${goal.timeHorizon} months
Risk: ${goal.riskTolerance}

Provide JSON with: {"monthlyInvestment": number, "allocations": [{"fundName": string, "category": string, "allocation": number, "expectedReturn": number, "risk": string, "description": string}], "projectedValue": number, "timeToGoal": number, "recommendations": [string]}`;

      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const response = await this.client!.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return this.parseAIResponse(responseBody.content[0].text);
    } catch (error) {
      console.error('AI planning failed, falling back to local:', error);
      return this.generateLocally(goal);
    }
  }

  private parseAIResponse(text: string): InvestmentPlan {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response');
    }
    throw new Error('Failed to parse AI response');
  }

  private generateLocally(goal: InvestmentGoal): InvestmentPlan {
    const gap = goal.targetAmount - goal.currentAmount;
    const monthlyRequired = gap / goal.timeHorizon;

    const allocations: FundAllocation[] = [];
    
    if (goal.riskTolerance === 'low') {
      allocations.push(
        { fundName: 'Debt Mutual Funds', category: 'Debt', allocation: 60, expectedReturn: 7, risk: 'low', description: 'Stable returns with low volatility' },
        { fundName: 'Liquid Funds', category: 'Debt', allocation: 20, expectedReturn: 5, risk: 'low', description: 'High liquidity for emergencies' },
        { fundName: 'Large Cap Equity', category: 'Equity', allocation: 20, expectedReturn: 12, risk: 'medium', description: 'Moderate growth potential' }
      );
    } else if (goal.riskTolerance === 'medium') {
      allocations.push(
        { fundName: 'Balanced Funds', category: 'Hybrid', allocation: 40, expectedReturn: 10, risk: 'medium', description: 'Mix of equity and debt' },
        { fundName: 'Large Cap Equity', category: 'Equity', allocation: 30, expectedReturn: 12, risk: 'medium', description: 'Established companies' },
        { fundName: 'Mid Cap Equity', category: 'Equity', allocation: 20, expectedReturn: 14, risk: 'medium', description: 'Growth potential' },
        { fundName: 'Debt Funds', category: 'Debt', allocation: 10, expectedReturn: 7, risk: 'low', description: 'Stability component' }
      );
    } else {
      allocations.push(
        { fundName: 'Mid Cap Equity', category: 'Equity', allocation: 35, expectedReturn: 14, risk: 'high', description: 'High growth potential' },
        { fundName: 'Small Cap Equity', category: 'Equity', allocation: 25, expectedReturn: 16, risk: 'high', description: 'Maximum growth' },
        { fundName: 'Large Cap Equity', category: 'Equity', allocation: 25, expectedReturn: 12, risk: 'medium', description: 'Core holdings' },
        { fundName: 'Sectoral Funds', category: 'Equity', allocation: 15, expectedReturn: 15, risk: 'high', description: 'Sector-specific opportunities' }
      );
    }

    const avgReturn = allocations.reduce((sum, a) => sum + (a.allocation * a.expectedReturn / 100), 0);
    const projectedValue = this.calculateFutureValue(goal.currentAmount, monthlyRequired, avgReturn, goal.timeHorizon);

    const recommendations = [
      `Invest ₹${monthlyRequired.toFixed(0)} monthly via SIP for disciplined investing`,
      `Expected portfolio return: ${avgReturn.toFixed(1)}% annually`,
      `Review and rebalance portfolio every 6 months`,
      goal.timeHorizon < 36 ? 'Consider increasing debt allocation for short-term goals' : 'Long-term horizon allows for higher equity exposure'
    ];

    return {
      monthlyInvestment: monthlyRequired,
      allocations,
      projectedValue,
      timeToGoal: goal.timeHorizon,
      recommendations
    };
  }

  private calculateFutureValue(present: number, monthly: number, rate: number, months: number): number {
    const monthlyRate = rate / 12 / 100;
    const futureValuePresent = present * Math.pow(1 + monthlyRate, months);
    const futureValueSIP = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return futureValuePresent + futureValueSIP;
  }
}
