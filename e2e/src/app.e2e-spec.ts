import { AppPage } from './app.po';
import { $, browser } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect to login page', async () => {
    await page.navigateTo();
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(/login$/);
  });
});
