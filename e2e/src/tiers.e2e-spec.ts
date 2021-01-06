import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

const withUpperCaseFirst = ([first, ...rest]: string) =>
  [first.toUpperCase(), ...rest].join('');

describe('Tiers', () => {

  for (const { name, hasEntrepots } of [
    { name: 'clients', hasEntrepots: true },
    { name: 'fournisseurs' },
    { name: 'transporteurs' },
    { name: 'lieux-passage-a-quai' },
    { name: 'entrepots' },
  ])
    describe(withUpperCaseFirst(name), () => {

      it('should navigate to list', async () => {
        await browser.get(`/tiers/${ name }/list`);
        await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
        const url = await browser.getCurrentUrl();
        expect(url).toMatch(new RegExp(`${ name }\/list$`));
      });

      it('should navigate to create page', async () => {
        await $('dx-button[aria-label="Nouveau"]').click();
        const textBox = $(`dx-text-box[formcontrolname="raisonSocial"]`);
        expect(await textBox.element(by.css('input')).getAttribute('value')).toBeFalsy();
        await browser.navigate().back();
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
        expect(url).toMatch(new RegExp(`${ name }\/(?!list)`));
      });

      it('should handle save with form', async () => {
        await $('dx-button[aria-label="Éditer"]').click();
        const textBox = $(`dx-text-box[formcontrolname="raisonSocial"]`);
        await textBox.element(by.css('input')).click();

        await textBox.element(by.css('input')).clear();
        await textBox.element(by.css('input')).sendKeys('xxx');

        const submitBtn = $('dx-button[aria-label="Valider"]');
        await submitBtn.click();
        await browser.wait(protractor.ExpectedConditions.invisibilityOf(submitBtn), 10000);
      });

      it('should navigate to contacts', async () => {
        const btn = $('dx-button[aria-label="Contacts"]');
        await btn.click();
        await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
        const url = await browser.getCurrentUrl();
        expect(url).toMatch(new RegExp(`contacts\/.*`));
      });

      if (hasEntrepots)
        it('should navigate to entrepots', async () => {
          await browser.navigate().back();
          const btn = $('dx-button[aria-label="Entrepôts"]');
          await btn.click();
          await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
          const url = await browser.getCurrentUrl();
          expect(url).toMatch(new RegExp(`${ name }\/.*\/entrepots`));
        });

    });

});
