import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authService } from '../api/auth.js';
import { yotoApi } from '../api/client.js';
import { Device } from '../models/index.js';
import { dispatchToast } from '../widgets/events.js';
import '../widgets/yt-button.js';
import '../widgets/yt-badge.js';

@customElement('yt-device-view')
export class YtDeviceView extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .header-bar {
      margin-bottom: 2rem;
    }

    h2 {
      margin: 0;
      font-size: var(--yt-font-size-2xl, 1.5rem);
    }

    .device-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .device-card {
      background: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-lg, 16px);
      padding: 1.5rem;
      box-shadow: var(--yt-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

    .device-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .device-name {
      font-size: var(--yt-font-size-lg, 1.125rem);
      font-weight: 600;
      margin: 0;
    }

    .meta-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: var(--yt-font-size-sm, 0.875rem);
      color: var(--yt-color-text-muted, #718096);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--yt-color-text-muted, #718096);
    }
  `;

  @state() private devices: Device[] = [];
  @state() private loading = true;

  override async connectedCallback() {
    super.connectedCallback();
    await this.loadDevices();
  }

  private async loadDevices() {
    this.loading = true;
    try {
      if (authService.isAuthenticated()) {
        this.devices = await yotoApi.listDevices();
      }
    } catch (err) {
      dispatchToast(this, {
        type: 'error',
        message: 'Failed to load devices.',
        errorDetail: err,
      });
    } finally {
      this.loading = false;
    }
  }

  override render() {
    if (!authService.isAuthenticated()) {
      return html`
        <div class="empty-state">
          <h3>Please Sign In</h3>
          <p>Sign in to see and control your Yoto players.</p>
        </div>
      `;
    }

    if (this.loading) {
      return html`<div class="empty-state"><p>Loading devices...</p></div>`;
    }

    return html`
      <div>
        <div class="header-bar">
          <h2>Players & Devices (${this.devices.length})</h2>
        </div>

        ${this.devices.length === 0
          ? html`<div class="empty-state"><p>No Yoto players registered to your account.</p></div>`
          : html`
              <div class="device-grid">
                ${this.devices.map(
                  (device) => html`
                    <div class="device-card">
                      <div class="device-top">
                        <h3 class="device-name">${device.name || 'Yoto Player'}</h3>
                        <yt-badge variant=${device.online ? 'success' : 'neutral'}>
                          ${device.online ? 'Online' : 'Offline'}
                        </yt-badge>
                      </div>
                      <div class="meta-row">
                        <span><strong>Model:</strong> ${device.deviceType || 'Yoto Player'}</span>
                        <span><strong>ID:</strong> ${device.deviceId}</span>
                      </div>
                    </div>
                  `
                )}
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-device-view': YtDeviceView;
  }
}
