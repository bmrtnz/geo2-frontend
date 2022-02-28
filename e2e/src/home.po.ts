import { $, browser } from "protractor";

export class HomePage {
  navigateTo() {
    return browser.get("/home");
  }

  getTileByText(text: string) {
    return $(`dx-button[text="${ text }"]`);
  }
}
