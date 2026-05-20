
import { SeoOpportunity } from '../gscTypes';
import { AiRecommendation, GscTrigger } from '../types/gscRecommendationsTypes';

export class GscRecommendationEngine {
  
  static generate(opportunities: SeoOpportunity[], workspaceId: string): AiRecommendation[] {
    return opportunities.map(op => this.createRecommendation(op, workspaceId));
  }

  private static createRecommendation(op: SeoOpportunity, workspaceId: string): AiRecommendation {
    const trigger: GscTrigger = {
      type: op.type,
      query: op.query,
      page: op.page,
      metrics: {
        clicks: op.clicks,
        impressions: op.impressions,
        ctr: op.ctr,
        position: op.position
      },
      dateRange: { start: 'Last 28 Days', end: 'Today' } // Simulated for now
    };

    const baseRec = {
      id: `rec-${op.id}`,
      workspaceId,
      trigger,
      createdAt: new Date().toISOString(),
      status: 'new' as const,
    };

    switch (op.type) {
      case 'LOW_CTR':
        return {
          ...baseRec,
          category: 'TITLE_META',
          priority: 'High',
          confidence: 75,
          title: `Fix Low Click-Through Rate for "${op.query}"`,
          plainWhy: `Your position is good (#${op.position.toFixed(1)}), but CTR is ${((op.ctr)*100).toFixed(1)}% (below average). Users see you but aren't clicking.`,
          steps: [
            'Analyze top 3 competing titles for emotional hooks.',
            'Rewrite Page Title to be more specific to the intent.',
            'Ensure Meta Description includes a clear value proposition.',
            'Verify the keyword appears early in the title.'
          ],
          optionalAiActions: { canGenerateTitleMeta: true },
          estimatedImpact: {
            metric: 'clicks',
            rangeLow: Math.round(op.impressions * 0.01), // +1% CTR conservative
            rangeHigh: Math.round(op.impressions * 0.03), // +3% CTR optimistic
            timeframeDays: 28,
            disclaimer: 'Based on moving to average CTR for your position.'
          }
        };

      case 'QUICK_WIN':
        return {
          ...baseRec,
          category: 'CONTENT_UPDATE',
          priority: 'Medium',
          confidence: 50,
          title: `Push "${op.query}" to Top 3`,
          plainWhy: `You are ranking #${op.position.toFixed(1)}, known as the "Striking Distance". A small content update often yields a jump to Page 1.`,
          steps: [
            'Add a new H2 section specifically addressing this query.',
            'Add 2-3 internal links from other high-authority pages.',
            'Refresh the publication date after updating.',
            'Check for broken media or slow load times.'
          ],
          optionalAiActions: { canGenerateContentChecklist: true, canGenerateInternalLinks: true },
          estimatedImpact: {
            metric: 'clicks',
            rangeLow: Math.round(op.clicks * 0.5), // 50% increase
            rangeHigh: Math.round(op.clicks * 1.5), // 150% increase
            timeframeDays: 28,
            disclaimer: 'Assumes moving from pos 4-15 to pos 1-3.'
          }
        };

      case 'RISING':
        return {
          ...baseRec,
          category: 'CONTENT_UPDATE',
          priority: 'Medium',
          confidence: 50,
          title: `Capitalize on Momentum for "${op.query}"`,
          plainWhy: `This query is outperforming expectations relative to its position. User intent is strongly matched, but the content might be thin.`,
          steps: [
            'Expand the content depth for this topic.',
            'Create a dedicated sub-page if the current page is too generic.',
            'Add FAQ schema to capture more SERP real estate.'
          ],
          optionalAiActions: { canGenerateContentChecklist: true },
          estimatedImpact: {
            metric: 'clicks',
            rangeLow: Math.round(op.clicks * 0.2),
            rangeHigh: Math.round(op.clicks * 0.8),
            timeframeDays: 28,
            disclaimer: 'Based on maintaining CTR while improving position.'
          }
        };

      case 'MISMATCH':
        return {
          ...baseRec,
          category: 'INTENT_MATCH',
          priority: 'High',
          confidence: 100,
          title: `Fix Cannibalization for "${op.query}"`,
          plainWhy: `Google is ranking ${op.page} instead of your intended target page. This confuses users and dilutes authority.`,
          steps: [
            'De-optimize the wrong page for this keyword.',
            'Add a strong internal link from the wrong page to the correct target.',
            'Consider a canonical tag if the content is very similar.',
            'Check if the wrong page satisfies user intent better (and accept it if so).'
          ],
          optionalAiActions: { canGenerateContentChecklist: true },
          estimatedImpact: {
            metric: 'clicks',
            rangeLow: 0,
            rangeHigh: Math.round(op.clicks * 0.2),
            timeframeDays: 14,
            disclaimer: 'Focus is on quality traffic and conversion, not just raw clicks.'
          }
        };

      default:
        return {
          ...baseRec,
          category: 'TECH_FIX',
          priority: 'Low',
          confidence: 25,
          title: `Optimize "${op.query}"`,
          plainWhy: 'General optimization opportunity detected.',
          steps: ['Review GSC data.', 'Check on-page SEO.'],
          optionalAiActions: {},
          estimatedImpact: {
            metric: 'clicks',
            rangeLow: 0,
            rangeHigh: 10,
            timeframeDays: 28,
            disclaimer: 'General maintenance.'
          }
        };
    }
  }
}
