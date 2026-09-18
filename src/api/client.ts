import { CONFIG } from '../config.js';
import { authService } from './auth.js';
import { Card, Device, DisplayIcon, LibraryResponse } from '../models/index.js';
import { dispatchToast } from '../widgets/events.js';

// ==============================================================================
// Yoto REST API Client with Silent Token Refresh
// See: docs/rfcs/006-error-handling-and-toast-notifications.md
//      pkg/yoto/http_client.go in yotocli
// ==============================================================================

export class YotoApiClient {
  private baseUrl: string;

  constructor(baseUrl = CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Internal fetch wrapper with authorization header injection and silent 401 refresh.
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    let session = authService.getSession();
    if (!session) {
      throw new Error('User is not authenticated.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.accessToken}`);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData) && !(options.body instanceof Blob)) {
      headers.set('Content-Type', 'application/json');
    }

    let url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    let response = await fetch(url, { ...options, headers });

    // Silent token refresh on 401 per RFC 006
    if (response.status === 401) {
      const newAccessToken = await authService.refreshToken();
      if (newAccessToken) {
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers });
      } else {
        dispatchToast(window, {
          type: 'warning',
          message: 'Your session has expired. Please sign in again.',
        });
        throw new Error('Session expired.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      const err = new Error(`API Request failed (${response.status}): ${errorText}`);
      dispatchToast(window, {
        type: 'error',
        message: `API Error: ${response.status} ${response.statusText}`,
        errorDetail: errorText,
      });
      throw err;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // --- Library / Cards ---

  public async listCards(): Promise<Card[]> {
    const data = await this.request<LibraryResponse>('/card/family/library');
    return (data.cards || []).map((c) => c.card);
  }

  public async getCard(id: string): Promise<Card> {
    const data = await this.request<{ card: Card }>(`/card/${encodeURIComponent(id)}`);
    return data.card;
  }

  public async deleteCard(id: string): Promise<void> {
    await this.request<void>(`/content/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  public async createCard(card: Card): Promise<void> {
    await this.request<void>('/content', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  public async updateCard(card: Card): Promise<void> {
    await this.request<void>('/content', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  // --- Devices ---

  public async listDevices(): Promise<Device[]> {
    const data = await this.request<{ devices: Device[] }>('/device-v2/devices/mine');
    return data.devices || [];
  }

  // --- Icons ---

  public async getPublicIcons(): Promise<DisplayIcon[]> {
    const data = await this.request<{ displayIcons: DisplayIcon[] }>('/media/displayIcons/user/yoto');
    return data.displayIcons || [];
  }

  public async getUserIcons(): Promise<DisplayIcon[]> {
    const data = await this.request<{ displayIcons: DisplayIcon[] }>('/media/displayIcons/user/me');
    return data.displayIcons || [];
  }

  public async uploadIcon(fileBlob: Blob): Promise<string> {
    const session = authService.getSession();
    if (!session) throw new Error('Not authenticated');

    const url = `${this.baseUrl}/media/displayIcons/user/me/upload?autoConvert=true&filename=icon.png`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'image/png',
      },
      body: fileBlob,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload icon (${response.status})`);
    }

    const res = await response.json();
    return res.displayIcon?.mediaId || res.displayIcon?.displayIconId || res.id;
  }
}

export const yotoApi = new YotoApiClient();
