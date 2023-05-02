import { TestBed } from "@angular/core/testing";

import { CurrentCompanyService } from "./current-company.service";

describe("CurrentCompanyService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CurrentCompanyService = TestBed.inject(
      CurrentCompanyService
    );
    expect(service).toBeTruthy();
  });
});
