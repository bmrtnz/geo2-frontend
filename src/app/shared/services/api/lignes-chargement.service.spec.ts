import { TestBed } from "@angular/core/testing";

import { LignesChargementService } from "./lignes-chargement.service";

describe("LignesChargementService", () => {
  let service: LignesChargementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LignesChargementService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
