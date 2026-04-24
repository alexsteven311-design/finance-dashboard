export interface InvestmentGoal {
  targetAmount: number;
  currentAmount: number;
  timeHorizon: number; // months
  riskTolerance: 'low' | 'medium' | 'high';
  goalName: string;
}

export interface FundAllocation {
  fundName: string;
  category: string;
  allocation: number; // percentage
  expectedReturn: number; // annual %
  risk: 'low' | 'medium' | 'high';
  description: string;
}

export interface InvestmentPlan {
  monthlyInvestment: number;
  allocations: FundAllocation[];
  projectedValue: number;
  timeToGoal: number;
  recommendations: string[];
}
