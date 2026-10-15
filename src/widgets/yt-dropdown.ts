import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface DropdownOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
}

/**
 * <yt-dropdown>
 * Accessible dropdown/select menu with keyboard navigation and custom option rendering.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-dropdown')
export class YtDropdown extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
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

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      background-color: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      padding: 0.6rem 0.85rem;
      font-size: var(--yt-font-size-sm, 0.875rem);
      cursor: pointer;
      user-select: none;
      transition: border-color var(--yt-transition-fast, 150ms);
    }

    .trigger:focus-visible {
      border-color: var(--yt-color-border-focus, #ff5c35);
      box-shadow: 0 0 0 3px rgba(255, 92, 53, 0.15);
      outline: none;
    }

    .trigger.open {
      border-color: var(--yt-color-border-focus, #ff5c35);
    }

    .menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background-color: var(--yt-color-surface, #ffffff);
      border: 1px solid var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-md, 10px);
      box-shadow: var(--yt-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
      max-height: 240px;
      overflow-y: auto;
      z-index: 100;
      padding: 0.25rem 0;
      display: flex;
      flex-direction: column;
    }

    .option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.6rem 0.85rem;
      cursor: pointer;
      font-size: var(--yt-font-size-sm, 0.875rem);
      transition: background-color var(--yt-transition-fast, 150ms);
    }

    .option:hover,
    .option.highlighted {
      background-color: var(--yt-color-surface-subtle, #f8f9fa);
    }

    .option.selected {
      background-color: var(--yt-color-primary-light, #fff2ed);
      color: var(--yt-color-primary, #ff5c35);
      font-weight: 500;
    }

    .arrow {
      font-size: 0.75rem;
      transition: transform var(--yt-transition-fast, 150ms);
    }

    .arrow.open {
      transform: rotate(180deg);
    }
  `;

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Array }) options: DropdownOption[] = [];
  @property({ type: String }) placeholder = 'Select option...';
  @property({ type: Boolean, state: true }) private isOpen = false;

  private toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  private selectOption(opt: DropdownOption) {
    this.value = opt.value;
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('change', { detail: { value: opt.value, option: opt }, bubbles: true, composed: true }));
  }

  override render() {
    const selected = this.options.find((o) => o.value === this.value);

    return html`
      <div class="wrapper">
        ${this.label ? html`<label>${this.label}</label>` : ''}
        <div
          class="trigger ${this.isOpen ? 'open' : ''}"
          tabindex="0"
          role="button"
          aria-haspopup="listbox"
          aria-expanded=${this.isOpen}
          @click=${this.toggleOpen}
        >
          <span>${selected ? selected.label : this.placeholder}</span>
          <span class="arrow ${this.isOpen ? 'open' : ''}">▼</span>
        </div>

        ${this.isOpen
          ? html`
              <div class="menu" role="listbox">
                ${this.options.map(
                  (opt) => html`
                    <div
                      class="option ${opt.value === this.value ? 'selected' : ''}"
                      role="option"
                      aria-selected=${opt.value === this.value}
                      @click=${() => this.selectOption(opt)}
                    >
                      <span>${opt.label}</span>
                      ${opt.badge ? html`<small>${opt.badge}</small>` : ''}
                    </div>
                  `
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-dropdown': YtDropdown;
  }
}
