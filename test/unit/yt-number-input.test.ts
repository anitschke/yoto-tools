import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { YtNumberInput } from '../../src/widgets/yt-number-input.js';
import '../../src/widgets/yt-number-input.js';

describe('YtNumberInput', () => {
  it('renders initial value and stepper buttons', async () => {
    const el = await fixture<YtNumberInput>(
      html`<yt-number-input label="Episode Count" .value=${5} .min=${1} .max=${20}></yt-number-input>`
    );
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.value).to.equal('5');
  });

  it('increments and decrements on button click', async () => {
    const el = await fixture<YtNumberInput>(
      html`<yt-number-input .value=${5} .min=${1} .max=${10}></yt-number-input>`
    );
    const buttons = el.shadowRoot!.querySelectorAll('button');
    const decBtn = buttons[0]!;
    const incBtn = buttons[1]!;

    setTimeout(() => incBtn.click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal(6);

    setTimeout(() => decBtn.click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal(5);
  });

  it('enforces min and max bounds', async () => {
    const el = await fixture<YtNumberInput>(
      html`<yt-number-input .value=${10} .min=${0} .max=${10}></yt-number-input>`
    );
    const incBtn = el.shadowRoot!.querySelectorAll('button')[1]!;
    expect(incBtn.hasAttribute('disabled')).to.be.true;
  });

  it('is accessible', async () => {
    const el = await fixture<YtNumberInput>(
      html`<yt-number-input label="Episodes" .value=${5}></yt-number-input>`
    );
    await expect(el).to.be.accessible();
  });
});
