import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ToastNotificationEvent, ToastOptions } from './events.js';
import './yt-toast.js';

interface QueuedToast extends ToastOptions {
  id: string;
}

/**
 * <yt-toast-manager>
 * Top-level notification queue listener and renderer.
 * See: docs/rfcs/005-widgets-and-component-library.md
 *      docs/rfcs/006-error-handling-and-toast-notifications.md
 */
@customElement('yt-toast-manager')
export class YtToastManager extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    yt-toast {
      pointer-events: auto;
    }
  `;

  @state() private toasts: QueuedToast[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(ToastNotificationEvent.EVENT_NAME, this.handleToastEvent as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(ToastNotificationEvent.EVENT_NAME, this.handleToastEvent as EventListener);
  }

  private handleToastEvent = (e: CustomEvent<ToastOptions>) => {
    const detail = e.detail;
    const id = Math.random().toString(36).substring(2, 9);
    const toast: QueuedToast = { ...detail, id };

    // Diagnostic console logging per RFC 006
    if (detail.type === 'error') {
      console.error('[Yoto-Tools Error]', detail.message, detail.errorDetail || '');
    } else if (detail.type === 'warning') {
      console.warn('[Yoto-Tools Warning]', detail.message, detail.errorDetail || '');
    }

    this.toasts = [...this.toasts, toast];

    // Duration timer (0 means persistent)
    const duration = detail.durationMs !== undefined ? detail.durationMs : (detail.type === 'error' ? 0 : 4000);
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  };

  private dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  override render() {
    return html`
      <div role="status" aria-live="polite">
        ${this.toasts.map(
          (t) => html`
            <yt-toast
              .message=${t.message}
              .type=${t.type || 'info'}
              .actionLabel=${t.actionLabel || ''}
              @dismiss=${() => this.dismiss(t.id)}
              @action=${() => {
                if (t.onAction) t.onAction();
                this.dismiss(t.id);
              }}
            ></yt-toast>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-toast-manager': YtToastManager;
  }
}
