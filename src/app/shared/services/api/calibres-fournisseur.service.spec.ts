import { TestBed } from "@angular/core/testing";

import { CalibresFournisseurService } from "./calibres-fournisseur.service";

describe("CalibresFournisseurService", () => {
  let service: CalibresFournisseurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalibresFournisseurService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
