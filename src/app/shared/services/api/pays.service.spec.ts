import { TestBed } from "@angular/core/testing";

import { PaysService } from "./pays.service";

describe("PaysService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PaysService = TestBed.inject(PaysService);
    expect(service).toBeTruthy();
  });
});
