
import { MetricStatus } from '../types/performanceTypes';

export const CWV_THRESHOLDS = {
  lcp: { good: 2.5, poor: 4.0 }, // Seconds
  inp: { good: 200, poor: 500 }, // Milliseconds
  cls: { good: 0.1, poor: 0.25 } // Unitless
};

export const getMetricStatus = (metric: 'lcp' | 'inp' | 'cls', value: number): MetricStatus => {
  const t = CWV_THRESHOLDS[metric];
  if (value <= t.good) return 'good';
  if (value >= t.poor) return 'poor';
  return 'needs_work';
};

export const getStatusColor = (status: MetricStatus) => {
  switch (status) {
    case 'good': return 'text-emerald-500';
    case 'needs_work': return 'text-amber-500';
    case 'poor': return 'text-rose-500';
    default: return 'text-muted-foreground';
  }
};

export const getStatusBg = (status: MetricStatus) => {
  switch (status) {
    case 'good': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'needs_work': return 'bg-amber-500/10 border-amber-500/20';
    case 'poor': return 'bg-rose-500/10 border-rose-500/20';
    default: return 'bg-muted border-border';
  }
};

export const formatMetricValue = (metric: 'lcp' | 'inp' | 'cls', value: number) => {
  if (metric === 'lcp') return `${value.toFixed(1)}s`;
  if (metric === 'inp') return `${Math.round(value)}ms`;
  if (metric === 'cls') return value.toFixed(2);
  return value.toString();
};
