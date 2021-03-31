import { browser } from 'protractor';
import { LoginPage } from './login.po';

describe('Login', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('should display login form', async () => {
    await page.navigateTo();
    expect(page.getForm()).toBeDefined();
  });

  it('should connect', async () => {
    await page.connect();
    const url = await browser.getCurrentUrl();
    expect(url).not.toMatch(/\/login/);
  });
});
