import { TestBed } from "@angular/core/testing";

import { HistoriqueService } from "./historique.service";

describe("HistoriqueService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: HistoriqueService = TestBed.inject(HistoriqueService);
    expect(service).toBeTruthy();
  });
});
