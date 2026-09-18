import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { YtDropdown } from './yt-dropdown.js';
import './yt-dropdown.js';

describe('YtDropdown', () => {
  const options = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ];

  it('renders trigger with placeholder when unselected', async () => {
    const el = await fixture<YtDropdown>(
      html`<yt-dropdown placeholder="Choose a playlist" .options=${options}></yt-dropdown>`
    );
    const trigger = el.shadowRoot!.querySelector('.trigger')!;
    expect(trigger.textContent).to.contain('Choose a playlist');
  });

  it('opens options menu on click and emits change on selection', async () => {
    const el = await fixture<YtDropdown>(
      html`<yt-dropdown .options=${options}></yt-dropdown>`
    );
    const trigger = el.shadowRoot!.querySelector('.trigger') as HTMLElement;
    trigger.click();
    await el.updateComplete;

    const menu = el.shadowRoot!.querySelector('.menu')!;
    expect(menu).to.exist;

    const optElements = el.shadowRoot!.querySelectorAll('.option');
    expect(optElements.length).to.equal(2);

    setTimeout(() => (optElements[1] as HTMLElement).click());
    const ev = await oneEvent(el, 'change');
    expect(ev.detail.value).to.equal('opt2');
    expect(el.value).to.equal('opt2');
  });

  it('is accessible', async () => {
    const el = await fixture<YtDropdown>(
      html`<yt-dropdown label="Select Card" .options=${options}></yt-dropdown>`
    );
    await expect(el).to.be.accessible();
  });
});
