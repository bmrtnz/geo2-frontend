// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

// exemple command test clients certifications: npm run e2e:no-serve -- --specs src/login** --specs src/tiers** --grep "(Login|Clients.*certifications)"

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
  allScriptsTimeout: 21000,
  getPageTimeout: 20000,
  specs: [
    './src/**/app.e2e-spec.ts',
    './src/**/login.e2e-spec.ts',
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1920x1080",
      ]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};