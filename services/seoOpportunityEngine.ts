
import { GscQueryRow, SeoOpportunity, SeoOpportunityState } from '../gscTypes';
import { Query } from '../types';

export class SeoOpportunityEngine {
  
  private static getExpectedCtr(position: number): number {
    if (position <= 1) return 0.28;
    if (position <= 2) return 0.15;
    if (position <= 3) return 0.11;
    if (position <= 4) return 0.08;
    if (position <= 5) return 0.06;
    if (position <= 10) return 0.03;
    if (position <= 15) return 0.015;
    if (position <= 20) return 0.01;
    return 0.005;
  }

  static analyze(
    rows: GscQueryRow[], 
    trackedQueries: Query[], 
    minImpressions: number
  ): SeoOpportunity[] {
    const opportunities: SeoOpportunity[] = [];
    
    // Map tracked queries for fast lookup
    // Normalize query text: lowercase, trimmed
    const trackedMap = new Map<string, Query>();
    trackedQueries.forEach(q => trackedMap.set(q.text.toLowerCase().trim(), q));

    rows.forEach(row => {
      const query = row.keys[0];
      const page = row.keys[1];
      const { impressions, ctr, position, clicks } = row;

      if (!query || !page) return;

      const normQuery = query.toLowerCase().trim();
      const trackedQ = trackedMap.get(normQuery);

      // 1. LOW CTR (High impressions, good position, low clickthrough)
      // Criteria: Impressions >= max(min, 200), Pos <= 20, CTR < 70% of baseline
      if (impressions >= Math.max(minImpressions, 200) && position <= 20) {
        const expected = this.getExpectedCtr(Math.round(position));
        if (ctr < expected * 0.7) {
          const score = Math.min(100, Math.round((Math.log10(impressions) * 10) + ((expected - ctr) / expected * 40)));
          opportunities.push({
            id: `low-ctr-${query}-${page}`,
            type: 'LOW_CTR',
            query, page, clicks, impressions, ctr, position, score,
            why: `Ranked #${position.toFixed(1)} but only ${(ctr * 100).toFixed(1)}% CTR. Baseline is ${(expected * 100).toFixed(1)}%.`,
            recommendedAction: 'Rewrite title & meta description to match intent. Add "power words" or brackets.',
            trackedQuestionId: trackedQ?.id
          });
        }
      }

      // 2. QUICK WIN (Position 4-15)
      // Criteria: Impressions >= max(min, 100), Pos 4-15
      if (impressions >= Math.max(minImpressions, 100) && position >= 4 && position <= 15) {
        const score = Math.min(100, Math.round(100 - (position * 4) + (Math.log10(clicks + 1) * 5)));
        opportunities.push({
          id: `win-${query}-${page}`,
          type: 'QUICK_WIN',
          query, page, clicks, impressions, ctr, position, score,
          why: `Within striking distance of top 3. Current: #${position.toFixed(1)}.`,
          recommendedAction: 'Refresh content, add a new H2 section, or build 2-3 internal links.',
          trackedQuestionId: trackedQ?.id
        });
      }

      // 3. MISMATCH (Wrong page ranking)
      // Criteria: Tracked query has targetUrl, but GSC ranking page differs
      if (trackedQ && trackedQ.targetUrl) {
        // Simple string inclusion check to handle clean URLs vs params
        if (!page.includes(trackedQ.targetUrl) && !trackedQ.targetUrl.includes(page)) {
           // Ensure meaningful traffic
           if (impressions > 50) {
             opportunities.push({
               id: `mis-${query}-${page}`,
               type: 'MISMATCH',
               query, page, clicks, impressions, ctr, position, score: 85,
               why: `Google ranks ${page} instead of your target page.`,
               recommendedAction: 'Check intent alignment. Canonicalize duplicate content or improve internal linking to target.',
               trackedQuestionId: trackedQ.id,
               expectedTargetUrl: trackedQ.targetUrl,
               actualTopUrl: page
             });
           }
        }
      }
    });

    // 4. RISING (Momentum) - *Note: In a real implementation this requires comparing two date ranges.
    // For this implementation, we will simulate "Rising" detection based on a mock "velocity" property 
    // or by assuming high CTR > expected for lower positions implies momentum.
    // Simplifying for single-pass logic: High CTR (> 1.5x expected) + Pos > 10
    rows.forEach(row => {
      const query = row.keys[0];
      const page = row.keys[1];
      const { impressions, ctr, position, clicks } = row;
      
      if (!query) return;

      const expected = this.getExpectedCtr(Math.round(position));
      if (position > 10 && ctr > expected * 1.5 && impressions > 100) {
         opportunities.push({
            id: `rise-${query}`,
            type: 'RISING',
            query, page: page || '', clicks, impressions, ctr, position, score: 75,
            why: `Outperforming expected CTR for position #${position.toFixed(1)}. Users want this content.`,
            recommendedAction: 'Create dedicated page or expand content section to capture demand.',
         });
      }
    });

    // Deduplicate: Keep highest score per type per query
    const uniqueMap = new Map<string, SeoOpportunity>();
    opportunities.forEach(op => {
      const key = `${op.type}-${op.query}`;
      if (!uniqueMap.has(key) || uniqueMap.get(key)!.score < op.score) {
        uniqueMap.set(key, op);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);
  }
}