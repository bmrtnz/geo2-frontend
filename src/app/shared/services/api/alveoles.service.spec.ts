import { TestBed } from "@angular/core/testing";

import { AlveolesService } from "./alveoles.service";

describe("AlveolesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: AlveolesService = TestBed.inject(AlveolesService);
    expect(service).toBeTruthy();
  });
});
