import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Nested', () => {

  it('should render components (main and part)', async () => {

    // Nav
    await browser.get('/nested/n/(tiers/transporteurs/list)');
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content dx-data-grid')), 10000);
    await browser.waitForAngularEnabled(true);

    // Select first row
    const firstRow = element.all(by.css('.content .dx-datagrid-rowsview tbody tr')).first();
    await browser.wait(protractor.ExpectedConditions.visibilityOf(firstRow), 10000);
    firstRow.click();
    firstRow.click();
    await browser.wait(protractor.ExpectedConditions.visibilityOf($('.content form')), 10000);

    expect($('app-nested > router-outlet + app-transporteurs-list').isPresent()).toBeTruthy();
    expect($('app-nested > app-transporteurs-list + app-grid-navigator').isPresent()).toBeTruthy();
    expect($('app-nested > router-outlet[name="details"] + app-transporteur-details').isPresent()).toBeTruthy();

  });

  it('should handle grid navigator', async () => {

    // Next
    const firstSelectionUrl = await browser.getCurrentUrl();
    await $('dx-button[aria-label="Suivant"]').click();
    expect(await browser.getCurrentUrl()).not.toEqual(firstSelectionUrl);

    // Previous
    const secondSelectionUrl = await browser.getCurrentUrl();
    await $('dx-button[aria-label="Précédent"]').click();
    expect(await browser.getCurrentUrl()).toEqual(firstSelectionUrl);

    // Back
    await $('dx-button[aria-label="retour"]').click();
    expect(await browser.getCurrentUrl()).toEqual(secondSelectionUrl);
    await $('dx-button[aria-label="retour"]').click();
    expect(await browser.getCurrentUrl()).toEqual(firstSelectionUrl);
    await $('dx-button[aria-label="retour"]').click();
    expect(await browser.getCurrentUrl()).toMatch(/transporteurs\/list\)$/);

  });

});
