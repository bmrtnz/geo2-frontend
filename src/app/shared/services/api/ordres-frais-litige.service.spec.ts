import { TestBed } from "@angular/core/testing";

import { OrdresFraisLitigeService } from "./ordres-frais-litige.service";

describe("OrdresFraisLitigeService", () => {
  let service: OrdresFraisLitigeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdresFraisLitigeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
