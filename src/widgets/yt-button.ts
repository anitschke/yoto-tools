import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * <yt-button>
 * Interactive button primitive with variants, sizes, loading spinners, and icon slots.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-button')
export class YtButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
      font-weight: 500;
      border-radius: var(--yt-radius-md, 10px);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background-color var(--yt-transition-fast, 150ms),
                  border-color var(--yt-transition-fast, 150ms),
                  box-shadow var(--yt-transition-fast, 150ms);
      user-select: none;
      white-space: nowrap;
      width: 100%;
      box-sizing: border-box;
      outline: none;
    }

    button:focus-visible {
      box-shadow: 0 0 0 3px rgba(255, 92, 53, 0.35);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Sizes */
    .size-small {
      font-size: var(--yt-font-size-xs, 0.75rem);
      padding: 0.25rem 0.5rem;
      min-height: 28px;
    }

    .size-medium {
      font-size: var(--yt-font-size-sm, 0.875rem);
      padding: 0.5rem 1rem;
      min-height: 38px;
    }

    .size-large {
      font-size: var(--yt-font-size-md, 1rem);
      padding: 0.75rem 1.25rem;
      min-height: 46px;
    }

    /* Variants */
    .variant-primary {
      background-color: var(--yt-color-primary, #ff5c35);
      color: #ffffff;
    }
    .variant-primary:hover:not(:disabled) {
      background-color: var(--yt-color-primary-hover, #e04b25);
    }

    .variant-secondary {
      background-color: var(--yt-color-surface, #ffffff);
      color: var(--yt-color-text, #1a202c);
      border-color: var(--yt-color-border, #e2e8f0);
    }
    .variant-secondary:hover:not(:disabled) {
      background-color: var(--yt-color-surface-subtle, #f8f9fa);
      border-color: #cbd5e1;
    }

    .variant-subtle {
      background-color: transparent;
      color: var(--yt-color-text, #1a202c);
    }
    .variant-subtle:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .variant-danger {
      background-color: var(--yt-color-danger, #ef4444);
      color: #ffffff;
    }
    .variant-danger:hover:not(:disabled) {
      background-color: var(--yt-color-danger-hover, #dc2626);
    }

    /* Spinner */
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 750ms linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: String }) variant: ButtonVariant = 'secondary';
  @property({ type: String }) size: ButtonSize = 'medium';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: String }) type: 'button' | 'submit' | 'reset' = 'button';

  override render() {
    return html`
      <button
        type=${this.type}
        class="variant-${this.variant} size-${this.size}"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? 'true' : 'false'}
      >
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : html`<slot name="leading"></slot>`}
        <slot></slot>
        <slot name="trailing"></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-button': YtButton;
  }
}
