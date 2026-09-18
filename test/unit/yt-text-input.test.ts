import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { YtTextInput } from '../../src/widgets/yt-text-input.js';
import '../../src/widgets/yt-text-input.js';

describe('YtTextInput', () => {
  it('renders input with label and placeholder', async () => {
    const el = await fixture<YtTextInput>(
      html`<yt-text-input label="Search Feed" placeholder="https://..."></yt-text-input>`
    );
    const label = el.shadowRoot!.querySelector('label');
    expect(label).to.exist;
    expect(label!.textContent).to.contain('Search Feed');
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('placeholder')).to.equal('https://...');
  });

  it('dispatches input event on typing', async () => {
    const el = await fixture<YtTextInput>(html`<yt-text-input></yt-text-input>`);
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'Hello Yoto';

    setTimeout(() => input.dispatchEvent(new Event('input')));
    const ev = await oneEvent(el, 'input');
    expect(ev.detail.value).to.equal('Hello Yoto');
    expect(el.value).to.equal('Hello Yoto');
  });

  it('clears value when clear button is clicked', async () => {
    const el = await fixture<YtTextInput>(
      html`<yt-text-input clearable value="Initial"></yt-text-input>`
    );
    const clearBtn = el.shadowRoot!.querySelector('.clear-btn') as HTMLButtonElement;
    expect(clearBtn).to.exist;

    setTimeout(() => clearBtn.click());
    await oneEvent(el, 'input');
    expect(el.value).to.equal('');
  });

  it('is accessible', async () => {
    const el = await fixture<YtTextInput>(
      html`<yt-text-input label="Card Name" value="Bedtime Stories"></yt-text-input>`
    );
    await expect(el).to.be.accessible();
  });
});
