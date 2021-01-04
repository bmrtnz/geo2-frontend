import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect to login page', async () => {
    page.navigateTo();
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(/login$/);
  });
});
