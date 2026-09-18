import { html, fixture, expect } from '@open-wc/testing';
import { YtPleaseSignIn } from './yt-please-sign-in.js';
import { authService } from '../api/auth.js';
import './yt-please-sign-in.js';

describe('YtPleaseSignIn', () => {
  it('renders default heading and description', async () => {
    const el = await fixture<YtPleaseSignIn>(html`<yt-please-sign-in></yt-please-sign-in>`);
    const h3 = el.shadowRoot!.querySelector('h3')!;
    expect(h3.textContent).to.equal('Please Sign In');
    const p = el.shadowRoot!.querySelector('p')!;
    expect(p.textContent).to.contain('Sign in with your Yoto account to access this section.');
    const btn = el.shadowRoot!.querySelector('yt-button')!;
    expect(btn).to.exist;
    expect(btn.textContent).to.contain('Sign In with Yoto');
  });

  it('renders custom heading and description', async () => {
    const el = await fixture<YtPleaseSignIn>(
      html`<yt-please-sign-in
        heading="Sign in to view cards"
        description="Your library will appear here."
      ></yt-please-sign-in>`
    );
    const h3 = el.shadowRoot!.querySelector('h3')!;
    expect(h3.textContent).to.equal('Sign in to view cards');
    const p = el.shadowRoot!.querySelector('p')!;
    expect(p.textContent).to.equal('Your library will appear here.');
  });

  it('triggers login when button is clicked', async () => {
    let loginCalled = false;
    const originalLogin = authService.login;
    authService.login = async () => {
      loginCalled = true;
    };

    try {
      const el = await fixture<YtPleaseSignIn>(html`<yt-please-sign-in></yt-please-sign-in>`);
      const btn = el.shadowRoot!.querySelector('yt-button')!;
      btn.click();
      expect(loginCalled).to.be.true;
    } finally {
      authService.login = originalLogin;
    }
  });

  it('is accessible', async () => {
    const el = await fixture<YtPleaseSignIn>(html`<yt-please-sign-in></yt-please-sign-in>`);
    await expect(el).to.be.accessible({
      ignoredRules: ['color-contrast'],
    });
  });
});
