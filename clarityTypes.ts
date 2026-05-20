
export interface ClarityIntegrationSettings {
  enabled: boolean;
  projectId: string;
  websiteDomain: string;
  consentModeEnabled: boolean;
  embedPreference: 'embed' | 'link';
  verifiedAt?: string;
  lastViewedAt?: string;
}

export type ClaritySetupStep = 'create' | 'install' | 'verify' | 'complete';
