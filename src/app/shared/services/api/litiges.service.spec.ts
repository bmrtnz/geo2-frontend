import { TestBed } from "@angular/core/testing";

import { LitigesService } from "./litiges.service";

describe("LitigesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: LitigesService = TestBed.inject(LitigesService);
    expect(service).toBeTruthy();
  });
});
