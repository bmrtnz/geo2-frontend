import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Ordres', () => {

  it('should navigate to accueil', async () => {
    await browser.get(`/ordres`);
    await browser.waitForAngularEnabled(false);
    await browser.wait(protractor.ExpectedConditions.presenceOf($('.content dx-tile-view')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`ordres\/accueil$`));
  });

  it('should navigate to details', async () => {
    const tiles = element.all(by.css('.content dx-tile-view dxi-item'));
    await tiles.first().click();
    await browser.wait(protractor.ExpectedConditions.presenceOf($('.content dx-tab-panel')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`ordres\/details$`));
  });

  it('should create tab with details form', async () => {
    await $('dx-button[aria-label="Nouvel ordre"]').click();
    await browser.wait(protractor.ExpectedConditions.presenceOf($('.content dx-tab-panel form')), 10000);
  });

  it('should navigate to indicateurs', async () => {
    await browser.get(`/ordres`);
    const tiles = element.all(by.css('.content dx-tile-view dxi-item'));
    await tiles.get(1).click();
    await browser.wait(protractor.ExpectedConditions.presenceOf($('.content dx-data-grid')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`ordres\/indicateurs`));
  });

});
