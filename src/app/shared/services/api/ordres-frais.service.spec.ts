import { TestBed } from "@angular/core/testing";

import { OrdresFraisService } from "./ordres-frais.service";

describe("OrdresFraisService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: OrdresFraisService = TestBed.inject(OrdresFraisService);
    expect(service).toBeTruthy();
  });
});
