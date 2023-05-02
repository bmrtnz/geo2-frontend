import { TestBed } from "@angular/core/testing";

import { OrdresService } from "./ordres.service";

describe("OrdresService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: OrdresService = TestBed.inject(OrdresService);
    expect(service).toBeTruthy();
  });
});
