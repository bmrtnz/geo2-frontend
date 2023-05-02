import { TestBed } from "@angular/core/testing";

import { MruEntrepotsService } from "./mru-entrepots.service";

describe("MruEntrepotsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: MruEntrepotsService = TestBed.inject(MruEntrepotsService);
    expect(service).toBeTruthy();
  });
});
