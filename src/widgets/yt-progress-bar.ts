import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * <yt-progress-bar>
 * Progress indicator for audio uploads and indeterminate pending states.
 * See: docs/rfcs/005-widgets-and-component-library.md
 */
@customElement('yt-progress-bar')
export class YtProgressBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .progress-container {
      width: 100%;
      height: 8px;
      background-color: var(--yt-color-border, #e2e8f0);
      border-radius: var(--yt-radius-full, 9999px);
      overflow: hidden;
      position: relative;
    }

    .bar {
      height: 100%;
      background-color: var(--yt-color-primary, #ff5c35);
      border-radius: var(--yt-radius-full, 9999px);
      transition: width var(--yt-transition-fast, 150ms) ease-out;
    }

    .indeterminate {
      width: 40% !important;
      animation: indeterminate 1.5s infinite linear;
    }

    @keyframes indeterminate {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(300%);
      }
    }
  `;

  @property({ type: Number }) value = 0; // 0 to 100
  @property({ type: Boolean }) indeterminate = false;
  @property({ type: String, attribute: 'aria-label' }) accessibleLabel = 'Progress';

  override render() {
    const clamped = Math.max(0, Math.min(100, this.value));
    return html`
      <div
        class="progress-container"
        role="progressbar"
        aria-label=${this.accessibleLabel || 'Progress'}
        aria-valuenow=${this.indeterminate ? '' : clamped}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="bar ${this.indeterminate ? 'indeterminate' : ''}"
          style=${this.indeterminate ? '' : `width: ${clamped}%`}
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yt-progress-bar': YtProgressBar;
  }
}
