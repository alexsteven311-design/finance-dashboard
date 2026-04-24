export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}
