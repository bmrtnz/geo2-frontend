import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Tiers', () => {

  describe('Clients', () => {

    it('should navigate to list', async () => {
      await browser.get('/tiers/clients/list');
      await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
      const url = await browser.getCurrentUrl();
      expect(url).toMatch(/clients\/list$/);
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
      expect(url).toMatch(/clients\/(?!list)/);
    });

    it('should handle save with form', async () => {
      await $('dx-button[aria-label="Éditer"]').click();
      const siretTextBox = $('dx-text-box[formcontrolname="siret"]');
      await siretTextBox.element(by.css('input')).click();
      await siretTextBox.element(by.css('input')).sendKeys(protractor.Key.BACK_SPACE, 'y', protractor.Key.ENTER);
      const submitBtn = $('dx-button[aria-label="Valider"]');
      // await submitBtn.click();
      await browser.wait(protractor.ExpectedConditions.invisibilityOf(submitBtn), 10000);
    });

  });

});
