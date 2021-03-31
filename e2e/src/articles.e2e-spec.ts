import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

const ARTICLE_TEST_ID = '091912';

describe('Articles', () => {

  it('should navigate to list', async () => {
    await browser.get(`articles/list`);
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`articles\/list$`));
  });

  it('should display grid with rows', async () => {
    expect($('.content dx-data-grid').isPresent()).toBeTruthy();
    const firstRow = element.all(by.css('.content .dx-datagrid-rowsview tbody tr')).first();
    await browser.wait(protractor.ExpectedConditions.visibilityOf(firstRow), 10000);
  });

  it('should navigate to form', async () => {
    const firstRow = element.all(by.css('.content .dx-datagrid-rowsview tbody tr')).first();
    firstRow.click();
    firstRow.click();
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content form')), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`articles\/(?!list)`));
  });

  it('should handle save with form', async () => {
    await browser.get(`articles/${ARTICLE_TEST_ID}`);
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content form')), 10000);
    await $('dx-button[aria-label="Éditer"]').click();
    const textBox = $(`dx-text-box[formcontrolname="description"]`);
    await textBox.element(by.css('input')).click();

    await textBox.element(by.css('input')).clear();
    await textBox.element(by.css('input')).sendKeys('[description]');

    const submitBtn = $('dx-button[aria-label="Valider"]');
    await submitBtn.click();
    await browser.wait(protractor.ExpectedConditions.invisibilityOf(submitBtn), 10000);
  });

});
