// ==============================================================================
// Application Configuration Module
// See: docs/rfcs/007-oauth-client-id-and-pr-preview-redirects.md
//      docs/rfcs/019-secrets-management-and-ci-cd-credentials.md
// ==============================================================================

export interface AppConfig {
  yotoClientId: string;
  gaMeasurementId: string;
  auth0Domain: string;
  apiBaseUrl: string;
  mqttBrokerUrl: string;
  corsProxyUrl: string;
}

export const CONFIG: AppConfig = {
  // Public Auth0 Client ID (RFC 007, RFC 019).
  // Injected by Vite from env vars or defaults to public registered SPA client ID.
  yotoClientId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_YOTO_CLIENT_ID) ||
    'GCSGaMOObJ0SHBS5dT56dOJoVXw5ep4A',

  // Public GA4 Measurement ID (RFC 015, RFC 019).
  gaMeasurementId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
    'G-N62YNCXWPS',

  // Yoto Auth0 & REST API endpoints
  auth0Domain: 'login.yotoplay.com',
  apiBaseUrl: 'https://api.yotoplay.com',

  // AWS IoT Core MQTT broker endpoint (RFC 018)
  mqttBrokerUrl: 'wss://aqrphjqbp3u2z-ats.iot.eu-west-2.amazonaws.com/mqtt',

  // Free public CORS Proxy for RSS podcast feeds (RFC 009)
  corsProxyUrl: 'https://corsproxy.io/?url=',
} as const;

/**
 * Returns the effective client ID, taking into account any custom client ID
 * provided by the user in Settings (localStorage).
 */
export function getActiveClientId(): string {
  const customId = localStorage.getItem('yoto_custom_client_id');
  if (customId && customId.trim() !== '') {
    return customId.trim();
  }
  return CONFIG.yotoClientId;
}
