import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { authService } from '../api/auth.js';
import { yotoApi } from '../api/client.js';
import { Card } from '../models/index.js';
import { dispatchToast } from '../widgets/events.js';
import '../widgets/yt-button.js';
import '../widgets/yt-badge.js';
import '../widgets/yt-pixel-icon.js';
import '../widgets/yt-dialog.js';
import '../widgets/yt-text-input.js';

@customElement('yt-library-view')
export class YtLibraryView extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    h2 {
      margin: 0;
      font-size: var(--yt-font-size-2xl, 1.5rem);
      color: var(--yt-color-text, #1a202c);
    }

    .search-filter {
      max-width: 320px;
      width: 100%;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .card-item {
      background: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-lg, 16px);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: var(--yt-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
      transition: box-shadow var(--yt-transition-fast, 150ms), transform var(--yt-transition-fast, 150ms);
    }

    .card-item:hover {
      box-shadow: var(--yt-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      transform: translateY(-2px);
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-title {
      font-size: var(--yt-font-size-md, 1rem);
      font-weight: 600;
      margin: 0;
      color: var(--yt-color-text, #1a202c);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      font-size: var(--yt-font-size-xs, 0.75rem);
      color: var(--yt-color-text-muted, #718096);
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid var(--yt-color-border, #e2e8f0);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--yt-color-text-muted, #718096);
    }
  `;

  @state() private cards: Card[] = [];
  @state() private searchQuery = '';
  @state() private loading = true;

  override async connectedCallback() {
    super.connectedCallback();
    await this.loadCards();
  }

  private async loadCards() {
    this.loading = true;
    try {
      if (authService.isAuthenticated()) {
        this.cards = await yotoApi.listCards();
      }
    } catch (err) {
      dispatchToast(this, {
        type: 'error',
        message: 'Failed to load card library.',
        errorDetail: err,
      });
    } finally {
      this.loading = false;
    }
  }

  private onSearch(e: CustomEvent<{ value: string }>) {
    this.searchQuery = e.detail.value.toLowerCase();
  }

  override render() {
    if (!authService.isAuthenticated()) {
      return html`
        <div class="empty-state">
          <h3>Please Sign In</h3>
          <p>Sign in with your Yoto account to access your cards and library.</p>
          <yt-button variant="primary" @click=${() => authService.login()}>Sign In with Yoto</yt-button>
        </div>
      `;
    }

    if (this.loading) {
      return html`<div class="empty-state"><p>Loading library...</p></div>`;
    }

    const filtered = this.cards.filter((c) => (c.title || '').toLowerCase().includes(this.searchQuery));

    return html`
      <div>
        <div class="header-bar">
          <div>
            <h2>My Cards (${this.cards.length})</h2>
          </div>
          <div class="search-filter">
            <yt-text-input
              placeholder="Search cards..."
              clearable
              @input=${this.onSearch}
            ></yt-text-input>
          </div>
        </div>

        ${filtered.length === 0
          ? html`<div class="empty-state"><p>No cards match your search.</p></div>`
          : html`
              <div class="card-grid">
                ${filtered.map((card) => {
                  const firstChapter = card.content?.chapters?.[0];
                  const iconUrl = firstChapter?.display?.icon16x16 || '';
                  const trackCount = card.content?.chapters?.length || 0;

                  return html`
                    <div class="card-item">
                      <div class="card-top">
                        <yt-pixel-icon src=${iconUrl} alt=${card.title} size="md"></yt-pixel-icon>
                        <div style="flex: 1; min-width: 0;">
                          <h4 class="card-title">${card.title}</h4>
                          <span class="card-meta">${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}</span>
                        </div>
                      </div>
                      <div class="card-actions">
                        <yt-button
                          variant="subtle"
                          size="small"
                          @click=${() => {
                            window.history.pushState(null, '', `/cards/${card.cardId}`);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                        >
                          Edit
                        </yt-button>
                      </div>
                    </div>
                  `;
                })}
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-library-view': YtLibraryView;
  }
}
