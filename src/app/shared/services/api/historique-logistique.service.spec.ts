import { TestBed } from "@angular/core/testing";

import { HistoriqueLogistiqueService } from "./historique-logistique.service";

describe("HistoriqueLogistiqueService", () => {
  let service: HistoriqueLogistiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueLogistiqueService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
