import { TestBed } from "@angular/core/testing";

import { ZonesGeographiquesService } from "./zones-geographiques.service";

describe("ZonesGeographiquesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ZonesGeographiquesService = TestBed.get(
      ZonesGeographiquesService
    );
    expect(service).toBeTruthy();
  });
});
