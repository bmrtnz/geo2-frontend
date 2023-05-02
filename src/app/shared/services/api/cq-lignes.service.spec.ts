import { TestBed } from "@angular/core/testing";

import { CQLignesService } from "./cq-lignes.service";

describe("CqLigneService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CQLignesService = TestBed.inject(CQLignesService);
    expect(service).toBeTruthy();
  });
});
