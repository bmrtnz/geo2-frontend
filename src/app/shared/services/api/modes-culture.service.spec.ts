import { TestBed } from "@angular/core/testing";

import { ModesCultureService } from "./modes-culture.service";

describe("ModesCultureService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ModesCultureService = TestBed.inject(ModesCultureService);
    expect(service).toBeTruthy();
  });
});
