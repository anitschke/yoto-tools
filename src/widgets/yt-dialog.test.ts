import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { YtDialog } from './yt-dialog.js';
import './yt-dialog.js';

describe('YtDialog', () => {
  it('opens native dialog via showModal()', async () => {
    const el = await fixture<YtDialog>(
      html`
        <yt-dialog heading="Confirm Action">
          <p>Dialog body text</p>
        </yt-dialog>
      `
    );
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).to.be.false;

    el.showModal();
    expect(dialog.open).to.be.true;

    el.close();
    expect(dialog.open).to.be.false;
  });

  it('emits close event when close button is clicked', async () => {
    const el = await fixture<YtDialog>(
      html`<yt-dialog heading="Test Dialog"></yt-dialog>`
    );
    el.showModal();
    const closeBtn = el.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;

    setTimeout(() => closeBtn.click());
    await oneEvent(el, 'close');
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).to.be.false;
  });

  it('is accessible when displayed', async () => {
    const el = await fixture<YtDialog>(
      html`
        <yt-dialog heading="Accessible Modal">
          <p>Testing accessibility.</p>
        </yt-dialog>
      `
    );
    await expect(el).to.be.accessible();
  });
});
