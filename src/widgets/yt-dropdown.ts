import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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
@customElement("yt-dropdown")
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

  @property({ type: String }) label = "";
  @property({ type: String }) value = "";
  @property({ type: Array }) options: DropdownOption[] = [];
  @property({ type: String }) placeholder = "Select option...";

  @state() private isOpen = false;
  @state() private highlightedIndex = -1;

  private menuId = `yt-dropdown-menu-${Math.random().toString(36).substring(2, 9)}`;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("click", this.onDocumentClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("click", this.onDocumentClick);
  }

  private onDocumentClick = (e: MouseEvent) => {
    if (!this.isOpen) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.closeMenu();
    }
  };

  private toggleOpen() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  private openMenu() {
    this.isOpen = true;
    const selectedIdx = this.options.findIndex((o) => o.value === this.value);
    this.highlightedIndex = selectedIdx >= 0 ? selectedIdx : 0;
  }

  private closeMenu() {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  private selectOption(opt: DropdownOption) {
    this.value = opt.value;
    this.closeMenu();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: opt.value, option: opt },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!this.isOpen) {
          this.openMenu();
        } else if (this.options.length > 0) {
          this.highlightedIndex =
            (this.highlightedIndex + 1) % this.options.length;
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!this.isOpen) {
          this.openMenu();
        } else if (this.options.length > 0) {
          this.highlightedIndex =
            (this.highlightedIndex - 1 + this.options.length) %
            this.options.length;
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (!this.isOpen) {
          this.openMenu();
        } else if (
          this.highlightedIndex >= 0 &&
          this.highlightedIndex < this.options.length
        ) {
          const opt = this.options[this.highlightedIndex];
          if (opt) {
            this.selectOption(opt);
          }
        }
        break;

      case "Escape":
        if (this.isOpen) {
          e.preventDefault();
          this.closeMenu();
        }
        break;

      case "Home":
        if (this.isOpen && this.options.length > 0) {
          e.preventDefault();
          this.highlightedIndex = 0;
        }
        break;

      case "End":
        if (this.isOpen && this.options.length > 0) {
          e.preventDefault();
          this.highlightedIndex = this.options.length - 1;
        }
        break;
    }
  }

  override render() {
    const selected = this.options.find((o) => o.value === this.value);
    const activeDescendant =
      this.isOpen && this.highlightedIndex >= 0
        ? `${this.menuId}-opt-${this.highlightedIndex}`
        : undefined;

    return html`
      <div class="wrapper">
        ${this.label ? html`<label id="${this.menuId}-label">${this.label}</label>` : ""}
        <div
          class="trigger ${this.isOpen ? "open" : ""}"
          tabindex="0"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded=${this.isOpen}
          aria-controls=${this.menuId}
          aria-labelledby=${this.label ? `${this.menuId}-label` : undefined}
          aria-activedescendant=${activeDescendant || ""}
          @click=${this.toggleOpen}
          @keydown=${this.onKeyDown}
        >
          <span>${selected ? selected.label : this.placeholder}</span>
          <span class="arrow ${this.isOpen ? "open" : ""}">▼</span>
        </div>

        ${
          this.isOpen
            ? html`
                <div id=${this.menuId} class="menu" role="listbox">
                  ${this.options.map(
                    (opt, idx) => html`
                      <div
                        id="${this.menuId}-opt-${idx}"
                        class="option ${opt.value === this.value ? "selected" : ""} ${idx === this.highlightedIndex ? "highlighted" : ""}"
                        role="option"
                        aria-selected=${opt.value === this.value}
                        @mouseenter=${() => {
                          this.highlightedIndex = idx;
                        }}
                        @click=${() => this.selectOption(opt)}
                      >
                        <span>${opt.label}</span>
                        ${opt.badge ? html`<small>${opt.badge}</small>` : ""}
                      </div>
                    `,
                  )}
                </div>
              `
            : ""
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yt-dropdown": YtDropdown;
  }
}
