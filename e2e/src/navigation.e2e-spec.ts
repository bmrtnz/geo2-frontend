import { $, browser, by, element } from "protractor";
import { protractor } from "protractor/built/ptor";
import { AppPage } from "./app.po";
import { HomePage } from "./home.po";

describe("Navigation", () => {
  let homePage: HomePage;
  let appPage: AppPage;

  beforeEach(() => {
    homePage = new HomePage();
    appPage = new AppPage();
  });

  it("should display home page", async () => {
    await homePage.navigateTo();
    const title = element(by.cssContainingText("h2.content-block", "Accueil"));
    await browser.wait(protractor.ExpectedConditions.presenceOf(title), 5000);
    expect(await title.isPresent()).toBeTruthy();
  });

  describe("should navigate with home buttons", async () => {

    const testButton = async (text: string, match: string, toggleTiers = false) => {
      await browser.waitForAngularEnabled(false);
      await homePage.navigateTo();
      if (toggleTiers) {
        homePage.getTileByText("Tiers").click();
        expect(await $(".dx-drawer-opened").isDisplayed()).toBeTruthy();
        await browser.sleep(2000);
        await element(by.cssContainingText(".content .dx-item-content", text)).click();
      } else {
        homePage.getTileByText(text).click();
      }
      await browser.wait(protractor.ExpectedConditions.presenceOf($("dx-data-grid,dx-tile-view")), 5000);
      expect(await browser.getCurrentUrl()).toMatch(new RegExp(match));
    };

    it("to \"clients\"", async () => await testButton("Clients", "clients", true));
    it("to \"fournisseurs\"", async () => await testButton("Fournisseurs", "fournisseurs", true));
    it("to \"transporteurs\"", async () => await testButton("Transporteurs", "transporteurs", true));
    it("to \"passages à quai\"", async () => await testButton("Passage à quai", "lieux-passage-a-quai", true));
    it("to \"articles\"", async () => await testButton("Articles", "articles", false));
    it("to \"ordres\"", async () => await testButton("Ordres de commande", "ordres", false));
    it("to \"stock\"", async () => await testButton("Stock", "stock", false));

  });

  describe("should navigate with nav bar", async () => {

    const testNav = async (text: string, match: string, toggleSection = "") => {
      await browser.waitForAngularEnabled(false);

      if (toggleSection) {
        await browser.wait(protractor.ExpectedConditions.elementToBeClickable(appPage.getNavByText(toggleSection)), 5000);
        await appPage.getNavByText(toggleSection).click();
      }

      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(appPage.getNavByText(text)), 5000);
      await appPage.getNavByText(text).click();
      await browser.sleep(1000);
      await browser.wait(protractor.ExpectedConditions.presenceOf($("dx-data-grid,dx-tile-view")), 5000);
      expect(await browser.getCurrentUrl()).toMatch(new RegExp(match));
    };

    it("to \"clients\"", async () => await testNav("Clients", "clients", "Tiers"));
    it("to \"fournisseurs\"", async () => await testNav("Fournisseurs", "fournisseurs", "Tiers"));
    it("to \"transporteurs\"", async () => await testNav("Transporteurs", "transporteurs", "Tiers"));
    it("to \"passages à quai\"", async () => await testNav("Passages à quai", "lieux-passage-a-quai", "Tiers"));
    it("to \"articles\"", async () => await testNav("Articles", "articles"));
    it("to \"ordres\"", async () => await testNav("Ordres de commande", "ordres"));
    it("to \"stock\"", async () => await testNav("Stock", "stock"));

  });
});
