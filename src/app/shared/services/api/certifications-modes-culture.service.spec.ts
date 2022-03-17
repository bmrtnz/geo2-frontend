import { TestBed } from "@angular/core/testing";

import { CertificationsModesCultureService } from "./certifications-modes-culture.service";

describe("CertificationsModesCultureService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CertificationsModesCultureService = TestBed.get(CertificationsModesCultureService);
    expect(service).toBeTruthy();
  });
});
