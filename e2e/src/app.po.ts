import { $, browser } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getNavByText(text: string) {
    return $(`dx-tree-view [role="treeitem"][aria-label="${ text }"]`);
  }
}
