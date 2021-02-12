import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

const CLIENT_TEST_ID = '007528';
const FOURNISSEUR_TEST_ID = '000344';

const withUpperCaseFirst = ([first, ...rest]: string) =>
  [first.toUpperCase(), ...rest].join('');

describe('Tiers', () => {

  for (const { name, id, hasEntrepots, hasCertifications } of [
    {
      name: 'clients',
      id: CLIENT_TEST_ID,
      hasEntrepots: true,
      hasCertifications: true,
    },
    {
      name: 'fournisseurs',
      id: FOURNISSEUR_TEST_ID,
      hasCertifications: true,
    },
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

      if (hasCertifications)
        it('should handle certifications', async () => {

          const tagBox = $(`dx-tag-box[formcontrolname="certifications"]`);
          const submitBtn = $('form dx-button[aria-label="Valider"]');
          const tags = tagBox.all(by.css('.dx-tag'));

          const handlePopup = async () => {
            const validationPopup = $('.dx-popup-wrapper .dx-popup-content');
            await browser.wait(protractor.ExpectedConditions.visibilityOf(validationPopup), 10000);
            const dateInputs = validationPopup.all(by.css('.dx-datebox'));
            await dateInputs.each( async dxInput => {
              const input = dxInput.element(by.css('input.dx-texteditor-input'));
              await input.click();
              await input.sendKeys('20/02/2030');
              await input.sendKeys(protractor.Key.ENTER);
            });
            await validationPopup.element(by.css('dx-button[aria-label="Valider"]')).click();
            await browser.wait(protractor.ExpectedConditions.invisibilityOf(validationPopup), 10000);
          };

          // navigate
          await browser.get(`/tiers/${name}/${id}`);
          await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content form')), 10000);

          // add and save
          await $('dx-button[aria-label="Éditer"]').click();
          await tagBox.click();
          const listOverlay = $(`#${await tagBox.getAttribute('aria-owns')}`);
          await browser.wait(protractor.ExpectedConditions.visibilityOf(listOverlay), 10000);
          await listOverlay.element(by.css('.dx-list-item:first-of-type')).click();
          await submitBtn.click();
          if (name === 'fournisseurs') handlePopup();
          await browser.wait(protractor.ExpectedConditions.invisibilityOf(submitBtn), 10000);
          expect(tags.count()).toBeGreaterThanOrEqual(1);


          // clear and save
          await $('dx-button[aria-label="Éditer"]').click();
          await tags.each( tag => tag.element(by.css('.dx-tag-remove-button')).click());
          await submitBtn.click();
          if (name === 'fournisseurs') handlePopup();
          await browser.wait(protractor.ExpectedConditions.invisibilityOf(submitBtn), 10000);
          expect(tags.count()).toEqual(0);

        });

    });

});
