
import { GscQueryRow } from '../gscTypes';

// Placeholder for Client ID - in production this comes from env
const GOOGLE_CLIENT_ID = ""; // process.env.GOOGLE_CLIENT_ID

export class GscClient {
  static isMockMode(): boolean {
    return !GOOGLE_CLIENT_ID;
  }

  static async listSites(accessToken: string): Promise<{ siteUrl: string; permissionLevel: string }[]> {
    if (this.isMockMode()) {
      return [
        { siteUrl: 'sc-domain:techflow.ai', permissionLevel: 'siteOwner' },
        { siteUrl: 'https://app.techflow.ai/', permissionLevel: 'siteFullUser' }
      ];
    }

    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) throw new Error('Failed to list sites');
    const data = await response.json();
    return data.siteEntry || [];
  }

  static async searchAnalyticsQuery(
    accessToken: string, 
    siteUrl: string, 
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query', 'page'],
    rowLimit: number = 25000
  ): Promise<GscQueryRow[]> {
    if (this.isMockMode()) {
      // Mock data is generated in seoOpportunityEngine logic or mockDataService
      // This function specifically handles REAL API calls
      return [];
    }

    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit
      })
    });

    if (!response.ok) throw new Error('Failed to fetch search analytics');
    const data = await response.json();
    return data.rows || [];
  }
}
