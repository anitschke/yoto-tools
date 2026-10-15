import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <yt-text-input>
 * Encapsulated text and search input field with clear buttons and label.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-text-input')
export class YtTextInput extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font-size: var(--yt-font-size-sm, 0.875rem);
      font-weight: 500;
      color: var(--yt-color-text, #1a202c);
    }

    .input-container {
      display: flex;
      align-items: center;
      background-color: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      padding: 0 0.75rem;
      transition: border-color var(--yt-transition-fast, 150ms),
                  box-shadow var(--yt-transition-fast, 150ms);
    }

    .input-container:focus-within {
      border-color: var(--yt-color-border-focus, #ff5c35);
      box-shadow: 0 0 0 3px rgba(255, 92, 53, 0.15);
    }

    .input-container.error {
      border-color: var(--yt-color-danger, #ef4444);
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.6rem 0;
      font-size: var(--yt-font-size-sm, 0.875rem);
      font-family: inherit;
      color: var(--yt-color-text, #1a202c);
      outline: none;
      width: 100%;
    }

    input::placeholder {
      color: var(--yt-color-text-muted, #718096);
    }

    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--yt-color-text-muted, #718096);
      font-size: 1rem;
      padding: 0 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .clear-btn:hover {
      color: var(--yt-color-text, #1a202c);
    }

    .error-msg {
      font-size: var(--yt-font-size-xs, 0.75rem);
      color: var(--yt-color-danger, #ef4444);
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) type = 'text';
  @property({ type: Boolean }) clearable = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'aria-label' }) accessibleLabel = '';

  private inputId = `yt-input-${Math.random().toString(36).substring(2, 9)}`;

  private onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private clear() {
    this.value = '';
    this.dispatchEvent(new CustomEvent('input', { detail: { value: '' }, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent('change', { detail: { value: '' }, bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <div class="wrapper">
        ${this.label ? html`<label for=${this.inputId}>${this.label}</label>` : ''}
        <div class="input-container ${this.error ? 'error' : ''}">
          <slot name="leading"></slot>
          <input
            id=${this.inputId}
            type=${this.type}
            .value=${this.value}
            placeholder=${this.placeholder}
            aria-label=${this.accessibleLabel || this.label || this.placeholder || 'Text input'}
            ?disabled=${this.disabled}
            @input=${this.onInput}
            @change=${this.onChange}
          />
          ${this.clearable && this.value && !this.disabled
            ? html`
                <button
                  type="button"
                  class="clear-btn"
                  @click=${this.clear}
                  aria-label="Clear input"
                >
                  ✕
                </button>
              `
            : ''}
          <slot name="trailing"></slot>
        </div>
        ${this.error ? html`<div class="error-msg">${this.error}</div>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-text-input': YtTextInput;
  }
}
