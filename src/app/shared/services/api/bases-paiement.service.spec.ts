import { TestBed } from "@angular/core/testing";

import { BasesPaiementService } from "./bases-paiement.service";

describe("BasesPaiementService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: BasesPaiementService = TestBed.inject(BasesPaiementService);
    expect(service).toBeTruthy();
  });
});
