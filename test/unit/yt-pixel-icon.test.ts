import { html, fixture, expect } from '@open-wc/testing';
import { YtPixelIcon } from '../../src/widgets/yt-pixel-icon.js';
import '../../src/widgets/yt-pixel-icon.js';

describe('YtPixelIcon', () => {
  it('renders fallback when src is empty', async () => {
    const el = await fixture<YtPixelIcon>(html`<yt-pixel-icon></yt-pixel-icon>`);
    const fallback = el.shadowRoot!.querySelector('.fallback');
    expect(fallback).to.exist;
    expect(fallback!.textContent).to.contain('16×16');
  });

  it('renders image when src is provided', async () => {
    const el = await fixture<YtPixelIcon>(
      html`<yt-pixel-icon src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Test Icon" size="lg"></yt-pixel-icon>`
    );
    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.exist;
    expect(img!.getAttribute('alt')).to.equal('Test Icon');
    const container = el.shadowRoot!.querySelector('.icon-container');
    expect(container!.classList.contains('size-lg')).to.be.true;
  });

  it('is accessible', async () => {
    const el = await fixture<YtPixelIcon>(
      html`<yt-pixel-icon src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Icon description"></yt-pixel-icon>`
    );
    await expect(el).to.be.accessible();
  });
});
