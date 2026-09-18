import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { yotoApi } from '../api/client.js';
import { Card } from '../models/index.js';
import { dispatchToast } from '../widgets/events.js';
import '../widgets/yt-button.js';
import '../widgets/yt-badge.js';
import '../widgets/yt-pixel-icon.js';
import '../widgets/yt-text-input.js';

@customElement('yt-card-view')
export class YtCardView extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .card-editor {
      background: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-lg, 16px);
      padding: 2rem;
      box-shadow: var(--yt-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }

    h2 {
      margin: 0;
      font-size: var(--yt-font-size-2xl, 1.5rem);
    }

    .track-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .track-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      background: var(--yt-color-surface-subtle, #f8f9fa);
    }

    .track-title {
      flex: 1;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--yt-color-text-muted, #718096);
    }
  `;

  @property({ type: String }) cardId = '';
  @state() private card: Card | null = null;
  @state() private loading = true;

  override async connectedCallback() {
    super.connectedCallback();
    await this.loadCard();
  }

  private async loadCard() {
    if (!this.cardId) return;
    this.loading = true;
    try {
      this.card = await yotoApi.getCard(this.cardId);
    } catch (err) {
      dispatchToast(this, {
        type: 'error',
        message: 'Failed to load card details.',
        errorDetail: err,
      });
    } finally {
      this.loading = false;
    }
  }

  override render() {
    if (this.loading) {
      return html`<div class="empty-state"><p>Loading card...</p></div>`;
    }

    if (!this.card) {
      return html`<div class="empty-state"><p>Card not found.</p></div>`;
    }

    const chapters = this.card.content?.chapters || [];

    return html`
      <div class="card-editor">
        <div class="header-row">
          <div>
            <h2>${this.card.title}</h2>
            <small style="color: var(--yt-color-text-muted, #718096);">ID: ${this.card.cardId}</small>
          </div>
          <yt-button
            variant="secondary"
            @click=${() => {
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            ← Back to Library
          </yt-button>
        </div>

        <h3>Tracks (${chapters.length})</h3>
        <div class="track-list">
          ${chapters.map(
            (chap, index) => html`
              <div class="track-item">
                <span style="font-weight: 600; min-width: 24px;">${index + 1}</span>
                <yt-pixel-icon src=${chap.display?.icon16x16 || ''} alt=${chap.title} size="sm"></yt-pixel-icon>
                <div class="track-title">${chap.title}</div>
                ${chap.duration ? html`<small>${Math.floor(chap.duration)}s</small>` : ''}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-card-view': YtCardView;
  }
}
