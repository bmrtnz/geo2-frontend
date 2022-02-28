import { $, browser, by } from "protractor";
import { protractor } from "protractor/built/ptor";

const USER = "7";
const PASS = "7";

export class LoginPage {
  async navigateTo() {
    await browser.get("/");
    return browser.get("/login");
  }

  getForm() {
    return $("app-login-form form");
  }

  async connect() {
    await browser.waitForAngularEnabled(false);
    const form = this.getForm();
    await browser.wait(form.isPresent());
    await $("input[type=\"text\"]").sendKeys(USER);
    await $("input[type=\"password\"]").clear();
    await $("input[type=\"password\"]").sendKeys(PASS);
    const submitBtn = form.element(by.css("dx-button"));
    await submitBtn.click();
    await browser.waitForAngularEnabled(true);
    await browser.wait(protractor.ExpectedConditions.stalenessOf(form), 10000);
  }
}
