import { html, fixture, expect } from '@open-wc/testing';
import { YtBadge } from '../../src/widgets/yt-badge.js';
import '../../src/widgets/yt-badge.js';

describe('YtBadge', () => {
  it('renders default neutral variant', async () => {
    const el = await fixture<YtBadge>(html`<yt-badge>Tag</yt-badge>`);
    expect(el.variant).to.equal('neutral');
    const span = el.shadowRoot!.querySelector('.badge')!;
    expect(span.classList.contains('variant-neutral')).to.be.true;
    expect(span.textContent).to.contain('Tag');
  });

  it('renders success variant', async () => {
    const el = await fixture<YtBadge>(html`<yt-badge variant="success">Online</yt-badge>`);
    expect(el.variant).to.equal('success');
    const span = el.shadowRoot!.querySelector('.badge')!;
    expect(span.classList.contains('variant-success')).to.be.true;
  });
});
