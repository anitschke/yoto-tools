import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import { authService } from './api/auth.js';
import './widgets/index.js';
import './views/library-view.js';
import './views/card-view.js';
import './views/device-view.js';
import './views/privacy-view.js';
import './views/callback-view.js';

/**
 * <yt-app>
 * Root Single-Page Application shell with @lit-labs/router navigation.
 * See: docs/rfcs/003-client-spa-and-routing-strategy.md
 */
@customElement('yt-app')
export class YtApp extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: var(--yt-color-surface, #ffffff);
      border-bottom: 1px solid var(--yt-color-border, #e2e8f0);
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--yt-color-primary, #ff5c35);
      cursor: pointer;
      text-decoration: none;
    }

    nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    nav a {
      color: var(--yt-color-text, #1a202c);
      text-decoration: none;
      font-weight: 500;
      font-size: var(--yt-font-size-sm, 0.875rem);
      padding: 0.4rem 0.6rem;
      border-radius: var(--yt-radius-sm, 6px);
      transition: background-color var(--yt-transition-fast, 150ms);
    }

    nav a:hover {
      background-color: var(--yt-color-surface-subtle, #f8f9fa);
    }

    .auth-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    footer {
      background: var(--yt-color-surface, #ffffff);
      border-top: 1px solid var(--yt-color-border, #e2e8f0);
      padding: 1.5rem 2rem;
      text-align: center;
      font-size: var(--yt-font-size-xs, 0.75rem);
      color: var(--yt-color-text-muted, #718096);
    }

    footer a {
      color: var(--yt-color-primary, #ff5c35);
      text-decoration: none;
    }
  `;

  @state() private isAuthenticated = false;

  private router = new Router(this, [
    {
      path: '/',
      render: () => html`<yt-library-view></yt-library-view>`,
    },
    {
      path: '/cards/:id',
      render: ({ id }) => html`<yt-card-view .cardId=${id || ''}></yt-card-view>`,
    },
    {
      path: '/device',
      render: () => html`<yt-device-view></yt-device-view>`,
    },
    {
      path: '/privacy',
      render: () => html`<yt-privacy-view></yt-privacy-view>`,
    },
    {
      path: '/callback',
      render: () => html`<yt-callback-view></yt-callback-view>`,
    },
  ]);

  override connectedCallback() {
    super.connectedCallback();
    this.isAuthenticated = authService.isAuthenticated();
  }

  private navigate(path: string, e?: Event) {
    if (e) e.preventDefault();
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private handleLoginLogout() {
    if (this.isAuthenticated) {
      authService.logout();
      this.isAuthenticated = false;
    } else {
      authService.login();
    }
  }

  override render() {
    return html`
      <header>
        <a class="brand" href="/" @click=${(e: Event) => this.navigate('/', e)}>
          <span>🎵 Yoto Tools</span>
        </a>
        <nav>
          <a href="/" @click=${(e: Event) => this.navigate('/', e)}>Cards</a>
          <a href="/device" @click=${(e: Event) => this.navigate('/device', e)}>Players</a>
          <a href="/privacy" @click=${(e: Event) => this.navigate('/privacy', e)}>Privacy</a>
        </nav>
        <div class="auth-section">
          <yt-button
            variant=${this.isAuthenticated ? 'secondary' : 'primary'}
            size="small"
            @click=${this.handleLoginLogout}
          >
            ${this.isAuthenticated ? 'Sign Out' : 'Sign In'}
          </yt-button>
        </div>
      </header>

      <main>
        ${this.router.outlet()}
      </main>

      <footer>
        <p>
          Yoto Tools — A modern web client for Yoto Players.
          <a href="/privacy" @click=${(e: Event) => this.navigate('/privacy', e)}>Privacy & Transparency</a>
        </p>
      </footer>

      <!-- Global Toast Queue Manager per RFC 006 -->
      <yt-toast-manager></yt-toast-manager>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-app': YtApp;
  }
}
