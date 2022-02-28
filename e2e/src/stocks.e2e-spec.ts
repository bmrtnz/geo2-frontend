import { $, browser } from "protractor";
import { protractor } from "protractor/built/ptor";

describe("Stocks", () => {

  it("should navigate", async () => {
    await browser.get(`/stock`);
    await browser.waitForAngularEnabled(false);
    await browser.wait(protractor.ExpectedConditions.visibilityOf($("dx-tab-panel")), 10000);
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(new RegExp(`stock$`));
  });

  it("should render tabs-panel", async () => {
    const tabsPanel = $("dx-tab-panel");
    expect(tabsPanel.isPresent()).toBeTruthy();
  });

});
