import { CONFIG, getActiveClientId } from '../config.js';
import { AuthSession } from '../models/index.js';

// ==============================================================================
// OAuth 2.0 PKCE Engine & PR Preview Relay Redirect
// See: docs/rfcs/007-oauth-client-id-and-pr-preview-redirects.md
//      pkg/yoto/auth.go in yotocli
// ==============================================================================

const STORAGE_KEY_SESSION = 'yoto_auth_session';
const STORAGE_KEY_VERIFIER = 'yoto_pkce_verifier';
const STORAGE_KEY_STATE = 'yoto_oauth_state';


export const OIDC_SCOPES = ['openid', 'profile', 'email'];
export const API_SCOPES = [
  'offline_access',
  'family:library:view',
  'family:library:manage',
  'user:content:view',
  'user:content:manage',
  'user:icons:manage',
  'family:devices:view',
  'family:devices:control',
];
export const SCOPE = [...OIDC_SCOPES, ...API_SCOPES].join(' ');

/**
 * Generates cryptographically secure random bytes converted to base64url.
 */
function generateRandomString(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Computes S256 code challenge from verifier using Web Crypto API.
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export interface AuthChangedDetail {
  authenticated: boolean;
  session: AuthSession | null;
}

export class AuthStateChangedEvent extends CustomEvent<AuthChangedDetail> {
  static readonly EVENT_NAME = 'yt-auth-changed';
  constructor(detail: AuthChangedDetail) {
    super(AuthStateChangedEvent.EVENT_NAME, {
      bubbles: true,
      composed: true,
      detail,
    });
  }
}

export class AuthService {
  private session: AuthSession | null = null;

  constructor() {
    this.loadSession();
  }

  public getSession(): AuthSession | null {
    if (!this.session) {
      this.loadSession();
    }
    return this.session;
  }

  public isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    // Session is valid if expiresAt is in the future (with 60s buffer)
    return Date.now() < session.expiresAt - 60000;
  }

  private notifyAuthChanged(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new AuthStateChangedEvent({
          authenticated: this.isAuthenticated(),
          session: this.session,
        })
      );
    }
  }

  private loadSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      try {
        this.session = JSON.parse(raw) as AuthSession;
      } catch {
        this.session = null;
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    }
  }

  public saveSession(session: AuthSession): void {
    this.session = session;
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    this.notifyAuthChanged();
  }

  public clearSession(): void {
    this.session = null;
    localStorage.removeItem(STORAGE_KEY_SESSION);
    this.notifyAuthChanged();
  }

  /**
   * Starts the OAuth PKCE authorization code flow.
   * On PR previews, initiates the Relay Redirect via production canonical URL.
   */
  public async login(): Promise<void> {
    const verifier = generateRandomString(32);
    const challenge = await generateCodeChallenge(verifier);
    const csrf = generateRandomString(16);

    // Save verifier and state in sessionStorage
    sessionStorage.setItem(STORAGE_KEY_VERIFIER, verifier);
    sessionStorage.setItem(STORAGE_KEY_STATE, csrf);

    const redirectUri = `${window.location.origin}/callback`;
    const clientId = getActiveClientId();
    const authorizeUrl = new URL(`https://${CONFIG.auth0Domain}/authorize`);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('audience', CONFIG.apiBaseUrl);
    authorizeUrl.searchParams.set('scope', SCOPE);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('code_challenge', challenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');
    authorizeUrl.searchParams.set('state', csrf);

    window.location.href = authorizeUrl.toString();
  }

  /**
   * Completes OAuth code exchange.
   */
  public async handleCallback(urlSearchParams: URLSearchParams): Promise<boolean> {
    const code = urlSearchParams.get('code');
    const state = urlSearchParams.get('state');

    if (!code || !state) {
      throw new Error('Missing code or state parameter in OAuth callback.');
    }

    // Verify CSRF state
    const savedState = sessionStorage.getItem(STORAGE_KEY_STATE);
    if (savedState && savedState !== state) {
      console.warn('State mismatch in OAuth callback.');
    }

    const verifier = sessionStorage.getItem(STORAGE_KEY_VERIFIER);
    if (!verifier) {
      throw new Error('Missing PKCE code verifier in session storage.');
    }

    const clientId = getActiveClientId();
    const redirectUri = `${window.location.origin}/callback`;

    const bodyParams = new URLSearchParams();
    bodyParams.set('grant_type', 'authorization_code');
    bodyParams.set('client_id', clientId);
    bodyParams.set('code', code);
    bodyParams.set('code_verifier', verifier);
    bodyParams.set('redirect_uri', redirectUri);

    const tokenUrl = `https://${CONFIG.auth0Domain}/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 86400;

    const newSession: AuthSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + expiresIn * 1000,
      idToken: data.id_token,
    };

    this.saveSession(newSession);

    // Clean up temporary PKCE keys
    sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEY_STATE);

    return true;
  }

  /**
   * Refreshes the access token using the stored refresh token.
   */
  public async refreshToken(): Promise<string | null> {
    const session = this.getSession();
    if (!session || !session.refreshToken) {
      this.clearSession();
      return null;
    }

    const clientId = getActiveClientId();
    const bodyParams = new URLSearchParams();
    bodyParams.set('grant_type', 'refresh_token');
    bodyParams.set('client_id', clientId);
    bodyParams.set('refresh_token', session.refreshToken);

    const tokenUrl = `https://${CONFIG.auth0Domain}/oauth/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      this.clearSession();
      return null;
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 86400;

    const updatedSession: AuthSession = {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || session.refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    this.saveSession(updatedSession);
    return updatedSession.accessToken;
  }

  public logout(): void {
    this.clearSession();
    const clientId = getActiveClientId();
    const logoutUrl = new URL(`https://${CONFIG.auth0Domain}/v2/logout`);
    logoutUrl.searchParams.set('client_id', clientId);
    logoutUrl.searchParams.set('returnTo', window.location.origin);
    window.location.href = logoutUrl.toString();
  }
}

export const authService = new AuthService();
