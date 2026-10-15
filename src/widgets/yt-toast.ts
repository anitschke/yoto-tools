import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * <yt-toast>
 * Toast presentation view for info, success, warning, and error notifications.
 * See: docs/rfcs/005-widgets-and-component-library.md
 *      docs/rfcs/006-error-handling-and-toast-notifications.md
 */
@customElement('yt-toast')
export class YtToast extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--yt-radius-md, 10px);
      box-shadow: var(--yt-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
      background-color: var(--yt-color-surface, #ffffff);
      color: var(--yt-color-text, #1a202c);
      border-left: 4px solid var(--yt-color-neutral, #64748b);
      min-width: 280px;
      max-width: 440px;
      font-size: var(--yt-font-size-sm, 0.875rem);
      animation: slideIn var(--yt-transition-normal, 250ms) ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .toast.type-info {
      border-left-color: #3b82f6;
    }

    .toast.type-success {
      border-left-color: var(--yt-color-success, #10b981);
    }

    .toast.type-warning {
      border-left-color: var(--yt-color-warning, #f59e0b);
    }

    .toast.type-error {
      border-left-color: var(--yt-color-danger, #ef4444);
    }

    .content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-sm, 6px);
      padding: 0.2rem 0.5rem;
      font-size: var(--yt-font-size-xs, 0.75rem);
      font-weight: 500;
      cursor: pointer;
    }

    .action-btn:hover {
      background-color: var(--yt-color-surface-subtle, #f8f9fa);
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--yt-color-text-muted, #718096);
      font-size: 1rem;
      padding: 0.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: var(--yt-color-text, #1a202c);
    }
  `;

  @property({ type: String }) message = '';
  @property({ type: String }) type: ToastType = 'info';
  @property({ type: String }) actionLabel = '';

  private onClose() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }

  private onAction() {
    this.dispatchEvent(new CustomEvent('action', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <div class="toast type-${this.type}">
        <div class="content">
          <span>${this.message}</span>
        </div>
        <div class="actions">
          ${this.actionLabel
            ? html`<button type="button" class="action-btn" @click=${this.onAction}>${this.actionLabel}</button>`
            : ''}
          <button type="button" class="close-btn" @click=${this.onClose} aria-label="Dismiss">✕</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-toast': YtToast;
  }
}
