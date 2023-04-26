import { TestBed } from "@angular/core/testing";

import { IdentifiantsFournisseurService } from "./identifiants-fournisseur.service";

describe("IdentifiantsFournisseurService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: IdentifiantsFournisseurService = TestBed.inject(
      IdentifiantsFournisseurService
    );
    expect(service).toBeTruthy();
  });
});
