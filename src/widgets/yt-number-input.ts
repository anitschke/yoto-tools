import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <yt-number-input>
 * Numeric input with stepper buttons and min/max clamping.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-number-input')
export class YtNumberInput extends LitElement {
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

    .stepper-container {
      display: inline-flex;
      align-items: center;
      background-color: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      overflow: hidden;
      width: 100%;
      max-width: 180px;
    }

    .stepper-container:focus-within {
      border-color: var(--yt-color-border-focus, #ff5c35);
      box-shadow: 0 0 0 3px rgba(255, 92, 53, 0.15);
    }

    button {
      background-color: var(--yt-color-surface-subtle, #f8f9fa);
      border: none;
      width: 38px;
      height: 38px;
      font-size: 1.1rem;
      cursor: pointer;
      color: var(--yt-color-text, #1a202c);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--yt-transition-fast, 150ms);
    }

    button:hover:not(:disabled) {
      background-color: #e2e8f0;
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      text-align: center;
      font-size: var(--yt-font-size-sm, 0.875rem);
      font-family: inherit;
      color: var(--yt-color-text, #1a202c);
      outline: none;
      -moz-appearance: textfield;
      width: 40px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: Boolean }) disabled = false;

  private updateValue(val: number) {
    const clamped = Math.max(this.min, Math.min(this.max, val));
    if (clamped !== this.value) {
      this.value = clamped;
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
    }
  }

  private stepDown() {
    this.updateValue(this.value - this.step);
  }

  private stepUp() {
    this.updateValue(this.value + this.step);
  }

  private onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const num = parseInt(input.value, 10);
    if (!isNaN(num)) {
      this.updateValue(num);
    }
  }

  override render() {
    return html`
      <div class="wrapper">
        ${this.label ? html`<label>${this.label}</label>` : ''}
        <div class="stepper-container">
          <button
            type="button"
            @click=${this.stepDown}
            ?disabled=${this.disabled || this.value <= this.min}
            aria-label="Decrease"
          >
            -
          </button>
          <input
            type="number"
            .value=${String(this.value)}
            min=${this.min}
            max=${this.max}
            step=${this.step}
            ?disabled=${this.disabled}
            @change=${this.onInput}
          />
          <button
            type="button"
            @click=${this.stepUp}
            ?disabled=${this.disabled || this.value >= this.max}
            aria-label="Increase"
          >
            +
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-number-input': YtNumberInput;
  }
}
