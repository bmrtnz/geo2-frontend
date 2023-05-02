import { TestBed } from "@angular/core/testing";

import { BasesTarifService } from "./bases-tarif.service";

describe("BasesTarifService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: BasesTarifService = TestBed.inject(BasesTarifService);
    expect(service).toBeTruthy();
  });
});
