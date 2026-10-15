import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type PixelIconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * <yt-pixel-icon>
 * Standardizes 16x16 pixel icon rendering with crisp edges and contrast background canvas.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-pixel-icon')
export class YtPixelIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    .icon-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: var(--yt-color-surface-dark, #12161a);
      border-radius: var(--yt-radius-sm, 6px);
      overflow: hidden;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    .size-sm {
      width: 24px;
      height: 24px;
    }

    .size-md {
      width: 32px;
      height: 32px;
    }

    .size-lg {
      width: 48px;
      height: 48px;
    }

    .size-xl {
      width: 64px;
      height: 64px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
    }

    .fallback {
      color: var(--yt-color-text-muted, #718096);
      font-size: 10px;
      user-select: none;
    }
  `;

  @property({ type: String }) src = '';
  @property({ type: String }) alt = '';
  @property({ type: String }) size: PixelIconSize = 'md';
  @property({ type: Boolean, state: true }) private hasError = false;

  private onError() {
    this.hasError = true;
  }

  override render() {
    return html`
      <div class="icon-container size-${this.size}">
        ${this.src && !this.hasError
          ? html`
              <img
                src=${this.src}
                alt=${this.alt}
                loading="lazy"
                @error=${this.onError}
              />
            `
          : html`<span class="fallback">16×16</span>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-pixel-icon': YtPixelIcon;
  }
}
