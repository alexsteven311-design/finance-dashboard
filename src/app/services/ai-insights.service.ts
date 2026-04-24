import { Injectable } from '@angular/core';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Transaction, CategorySummary } from '../models/transaction.model';

export interface AIInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiInsightsService {
  private client: BedrockRuntimeClient | null = null;

  constructor() {
    // Initialize only if credentials are available
    try {
      this.client = new BedrockRuntimeClient({ region: 'us-east-1' });
    } catch (error) {
      console.log('AWS credentials not configured, using local analysis');
    }
  }

  async analyzeTransactions(transactions: Transaction[], categorySummary: CategorySummary[]): Promise<AIInsight[]> {
    if (this.client) {
      return this.analyzeWithAI(transactions, categorySummary);
    } else {
      return this.analyzeLocally(transactions, categorySummary);
    }
  }

  private async analyzeWithAI(transactions: Transaction[], categorySummary: CategorySummary[]): Promise<AIInsight[]> {
    try {
      const prompt = this.buildPrompt(transactions, categorySummary);
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const response = await this.client!.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return this.parseAIResponse(responseBody.content[0].text);
    } catch (error) {
      console.error('AI analysis failed, falling back to local:', error);
      return this.analyzeLocally(transactions, categorySummary);
    }
  }

  private buildPrompt(transactions: Transaction[], categorySummary: CategorySummary[]): string {
    const totalSpending = categorySummary.reduce((sum, cat) => sum + cat.total, 0);
    const topCategories = categorySummary.slice(0, 5);
    
    return `Analyze this financial data and provide 3-4 brief insights in JSON format:

Total Spending: ₹${totalSpending.toFixed(2)}
Number of Transactions: ${transactions.length}
Top Categories: ${topCategories.map(c => `${c.category} (₹${c.total.toFixed(2)}, ${c.percentage.toFixed(1)}%)`).join(', ')}

Provide insights as JSON array with format: [{"type": "warning|info|success", "title": "Short Title", "message": "Brief message"}]
Focus on: spending patterns, unusual expenses, savings opportunities, budget recommendations.`;
  }

  private parseAIResponse(text: string): AIInsight[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response');
    }
    return [];
  }

  private analyzeLocally(transactions: Transaction[], categorySummary: CategorySummary[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const totalSpending = categorySummary.reduce((sum, cat) => sum + cat.total, 0);

    // High spending category
    if (categorySummary.length > 0) {
      const topCategory = categorySummary[0];
      if (topCategory.percentage > 30) {
        insights.push({
          type: 'warning',
          title: 'High Spending Alert',
          message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your spending (₹${topCategory.total.toFixed(2)}). Consider reviewing this category.`
        });
      }
    }

    // Food & Dining analysis
    const foodCategory = categorySummary.find(c => c.category === 'Food & Dining');
    if (foodCategory && foodCategory.total > 5000) {
      insights.push({
        type: 'info',
        title: 'Dining Expenses',
        message: `You spent ₹${foodCategory.total.toFixed(2)} on dining. Cooking at home more often could save ₹${(foodCategory.total * 0.3).toFixed(2)}/month.`
      });
    }

    // UPI transfers
    const upiCategory = categorySummary.find(c => c.category === 'UPI Transfers');
    if (upiCategory && upiCategory.count > 10) {
      insights.push({
        type: 'info',
        title: 'Frequent Transfers',
        message: `${upiCategory.count} UPI transfers detected totaling ₹${upiCategory.total.toFixed(2)}. Track these to understand spending better.`
      });
    }

    // Positive insight
    const groceryCategory = categorySummary.find(c => c.category === 'Groceries');
    if (groceryCategory && groceryCategory.percentage < 15) {
      insights.push({
        type: 'success',
        title: 'Good Grocery Management',
        message: `Your grocery spending is well-controlled at ${groceryCategory.percentage.toFixed(1)}% of total expenses.`
      });
    }

    return insights.slice(0, 4);
  }
}
