import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { YtToast } from '../../src/widgets/yt-toast.js';
import '../../src/widgets/yt-toast.js';

describe('YtToast', () => {
  it('renders message and variant class', async () => {
    const el = await fixture<YtToast>(
      html`<yt-toast message="Saved successfully!" type="success"></yt-toast>`
    );
    const toast = el.shadowRoot!.querySelector('.toast')!;
    expect(toast.classList.contains('type-success')).to.be.true;
    expect(toast.textContent).to.contain('Saved successfully!');
  });

  it('emits dismiss event on close click', async () => {
    const el = await fixture<YtToast>(
      html`<yt-toast message="Notice"></yt-toast>`
    );
    const closeBtn = el.shadowRoot!.querySelector('.close-btn') as HTMLButtonElement;

    setTimeout(() => closeBtn.click());
    await oneEvent(el, 'dismiss');
  });

  it('emits action event when action button is clicked', async () => {
    const el = await fixture<YtToast>(
      html`<yt-toast message="Connection lost" actionLabel="Retry"></yt-toast>`
    );
    const actionBtn = el.shadowRoot!.querySelector('.action-btn') as HTMLButtonElement;
    expect(actionBtn).to.exist;

    setTimeout(() => actionBtn.click());
    await oneEvent(el, 'action');
  });
});
