import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../widgets/yt-button.js';

@customElement('yt-privacy-view')
export class YtPrivacyView extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }

    .container {
      background: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-lg, 16px);
      padding: 2.5rem;
      box-shadow: var(--yt-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

    h2 {
      margin-top: 0;
      color: var(--yt-color-text, #1a202c);
    }

    h3 {
      margin-top: 1.5rem;
      color: var(--yt-color-text, #1a202c);
    }

    p, li {
      color: var(--yt-color-text, #1a202c);
      line-height: 1.6;
    }

    .toggle-box {
      margin: 2rem 0;
      padding: 1.5rem;
      background: var(--yt-color-surface-subtle, #f8f9fa);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
  `;

  @state() private telemetryEnabled = true;

  override connectedCallback() {
    super.connectedCallback();
    this.telemetryEnabled = localStorage.getItem('yoto_telemetry_disabled') !== 'true';
  }

  private toggleTelemetry() {
    this.telemetryEnabled = !this.telemetryEnabled;
    if (this.telemetryEnabled) {
      localStorage.removeItem('yoto_telemetry_disabled');
    } else {
      localStorage.setItem('yoto_telemetry_disabled', 'true');
    }
  }

  override render() {
    return html`
      <div class="container">
        <h2>Privacy & Transparency Policy</h2>
        <p>
          <strong>yoto-tools</strong> is a 100% client-side application. We run directly inside your web browser
          and never send your tokens, audio files, or account credentials to any intermediary server.
        </p>

        <div class="toggle-box">
          <div>
            <strong>Anonymous Usage Telemetry</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--yt-color-text-muted, #718096);">
              Status: ${this.telemetryEnabled ? 'Active (Cookieless)' : 'Opted Out / Disabled'}
            </p>
          </div>
          <yt-button
            variant=${this.telemetryEnabled ? 'danger' : 'primary'}
            @click=${this.toggleTelemetry}
          >
            ${this.telemetryEnabled ? 'Disable Telemetry' : 'Enable Telemetry'}
          </yt-button>
        </div>

        <h3>1. Direct Browser-to-Yoto Communication</h3>
        <p>
          All requests made to Yoto's APIs (fetching cards, uploading tracks, controlling devices) travel directly
          from your browser to Yoto's official servers (<code>api.yotoplay.com</code> and AWS S3/IoT).
        </p>

        <h3>2. What We Never Collect</h3>
        <ul>
          <li>Never collect passwords or Auth0 secrets (PKCE authorization is stored strictly in your browser session).</li>
          <li>Never collect audio files, podcast feed contents, or private family recordings.</li>
          <li>Never use tracking cookies or persistent advertising identifiers.</li>
        </ul>

        <h3>3. Minimal Anonymous Telemetry</h3>
        <p>
          We use cookieless Google Analytics 4 Measurement Protocol pings solely to improve the app and understand feature usage. Specifically, we collect:
        </p>
        <ul>
          <li><strong>Page Views & Navigation:</strong> Aggregate visits to application routes (without query parameters or personal IDs).</li>
          <li><strong>Icon Usage:</strong> Icons that you add or set on cards (e.g. icon IDs and search terms, to identify popular icons).</li>
          <li><strong>Podcast RSS Imports:</strong> Podcast RSS URLs you import (to identify popular public feeds and improve feed compatibility).</li>
          <li><strong>Local Audio Imports:</strong> When you import files from your computer (strictly logging the fact that you used the feature and aggregate track counts, but never file names or personal ID3 tags).</li>
          <li><strong>Device Control Actions:</strong> Generic control commands invoked (e.g. play, pause, volume changes, but never device IDs or serial numbers).</li>
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-privacy-view': YtPrivacyView;
  }
}
