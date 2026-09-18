import { html, fixture, expect } from '@open-wc/testing';
import { YtButton } from '../../src/widgets/yt-button.js';
import '../../src/widgets/yt-button.js';

describe('YtButton', () => {
  it('renders with default secondary variant', async () => {
    const el = await fixture<YtButton>(html`<yt-button>Click Me</yt-button>`);
    expect(el.variant).to.equal('secondary');
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.classList.contains('variant-secondary')).to.be.true;
    expect(el.textContent).to.contain('Click Me');
  });

  it('renders primary variant', async () => {
    const el = await fixture<YtButton>(html`<yt-button variant="primary">Submit</yt-button>`);
    expect(el.variant).to.equal('primary');
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.classList.contains('variant-primary')).to.be.true;
  });

  it('handles loading state', async () => {
    const el = await fixture<YtButton>(html`<yt-button loading>Loading</yt-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-busy')).to.equal('true');
    expect(button.hasAttribute('disabled')).to.be.true;
  });
});
