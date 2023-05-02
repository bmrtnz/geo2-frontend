import { TestBed } from "@angular/core/testing";

import { SocietesService } from "./societes.service";

describe("SocietesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: SocietesService = TestBed.inject(SocietesService);
    expect(service).toBeTruthy();
  });
});
