import { $ } from 'protractor';

describe('Stocks', () => {

  it('should render tabs-panel', async () => {
    const tabsPanel = $('dx-tab-panel');
    expect(tabsPanel.isPresent()).toBeTruthy();
  });

});
