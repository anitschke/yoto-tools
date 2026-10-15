import { html, fixture, expect } from '@open-wc/testing';
import { YtProgressBar } from './yt-progress-bar.js';
import './yt-progress-bar.js';

describe('YtProgressBar', () => {
  it('renders determinate bar with correct width and aria attributes', async () => {
    const el = await fixture<YtProgressBar>(html`<yt-progress-bar .value=${65}></yt-progress-bar>`);
    const container = el.shadowRoot!.querySelector('.progress-container')!;
    expect(container.getAttribute('role')).to.equal('progressbar');
    expect(container.getAttribute('aria-valuenow')).to.equal('65');
    const bar = el.shadowRoot!.querySelector('.bar') as HTMLElement;
    expect(bar.style.width).to.equal('65%');
  });

  it('renders indeterminate animation when set', async () => {
    const el = await fixture<YtProgressBar>(html`<yt-progress-bar indeterminate></yt-progress-bar>`);
    const bar = el.shadowRoot!.querySelector('.bar')!;
    expect(bar.classList.contains('indeterminate')).to.be.true;
  });

  it('clamps values below 0 and above 100', async () => {
    const el = await fixture<YtProgressBar>(html`<yt-progress-bar .value=${150}></yt-progress-bar>`);
    const bar = el.shadowRoot!.querySelector('.bar') as HTMLElement;
    expect(bar.style.width).to.equal('100%');
  });

  it('is accessible', async () => {
    const el = await fixture<YtProgressBar>(html`<yt-progress-bar .value=${40} aria-label="Upload progress"></yt-progress-bar>`);
    await expect(el).to.be.accessible();
  });
});
