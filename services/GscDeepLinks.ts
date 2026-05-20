
export class GscDeepLinks {
  private static BASE_URL = 'https://search.google.com/search-console';

  static getOverviewUrl(resourceId: string): string {
    return `${this.BASE_URL}?resource_id=${encodeURIComponent(resourceId)}`;
  }

  static getPerformanceUrl(resourceId: string): string {
    return `${this.BASE_URL}/performance/search-analytics?resource_id=${encodeURIComponent(resourceId)}`;
  }

  static getUrlInspection(resourceId: string, pageUrl: string): string {
    return `${this.BASE_URL}/inspect?resource_id=${encodeURIComponent(resourceId)}&url=${encodeURIComponent(pageUrl)}`;
  }
}
