
export class ClarityDeepLinks {
  private static BASE_URL = 'https://clarity.microsoft.com';

  static getHeatmapsUrl(projectId: string): string {
    return `${this.BASE_URL}/projects/view/${projectId}/heatmaps`;
  }

  static getDashboardUrl(projectId: string): string {
    return `${this.BASE_URL}/projects/view/${projectId}/dashboard`;
  }

  static getRecordingsUrl(projectId: string): string {
    return `${this.BASE_URL}/projects/view/${projectId}/recordings`;
  }

  static getSettingsUrl(projectId: string): string {
    return `${this.BASE_URL}/projects/view/${projectId}/settings`;
  }

  static getProjectsUrl(): string {
    return `${this.BASE_URL}/projects`;
  }
}
