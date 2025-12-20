export interface ErrorDistribution {
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalErrors: number;
}

export interface ErrorTrend {
  period: string;
  byType: Record<string, number>;
  totalErrors: number;
  startDate: string;
}

export interface WeakArea {
  errorType: string;
  errorCategory: string;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
  lastOccurrence: string;
}

export interface TopError {
  errorType: string;
  errorCategory: string;
  count: number;
  lastOccurrence: string;
}

export interface ErrorAnalytics {
  distribution: ErrorDistribution;
  topErrors: TopError[];
  recentTrend: ErrorTrend;
  weakAreas: WeakArea[];
}
