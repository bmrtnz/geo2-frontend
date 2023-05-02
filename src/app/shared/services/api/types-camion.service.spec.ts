import { TestBed } from "@angular/core/testing";

import { TypesCamionService } from "./types-camion.service";

describe("TypesCamionService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: TypesCamionService = TestBed.inject(TypesCamionService);
    expect(service).toBeTruthy();
  });
});
