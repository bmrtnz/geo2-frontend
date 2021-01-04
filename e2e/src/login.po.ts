import { $, browser } from 'protractor';
import { protractor } from 'protractor/built/ptor';

const USER = 'LEROY';
const PASS = 'Merlin';

export class LoginPage {
  async navigateTo() {
    await browser.get('/');
    return browser.get('/login');
  }

  getForm() {
    return $('app-login-form form');
  }

  async connect() {
    const form = this.getForm();
    await browser.wait(form.isPresent());
    await $('input[type="text"]').sendKeys(USER);
    await $('input[type="password"]')
    .sendKeys(PASS, protractor.Key.TAB);
    await browser.sleep(1000);
    return $('input[type="password"]').sendKeys(protractor.Key.ENTER);
  }
}
