// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/* tslint:disable-next-line max-line-length */
// exemple command test clients certifications: npm run e2e:no-serve -- --specs src/login** --specs src/tiers** --grep "(Login|Clients.*certifications)"

// import { SpecReporter } from "jasmine-spec-reporter";
const specReporter = require("jasmine-spec-reporter");

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
  allScriptsTimeout: 21000,
  baseUrl: "http://localhost:4200/",
  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      args: [
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1920x1080",
      ],
    },
  },
  directConnect: true,
  framework: "jasmine",
  getPageTimeout: 20000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    showColors: true,
  },
  specs: [
    "./src/**/app.e2e-spec.ts",
    "./src/**/login.e2e-spec.ts",
    "./src/**/*.e2e-spec.ts",
  ],
  onPrepare() {
    require("ts-node").register({
      project: require("path").join(__dirname, "./tsconfig.json"),
    });
    jasmine.getEnv().addReporter(new specReporter.SpecReporter({ spec: { displayStacktrace: true } }));
  },
};
