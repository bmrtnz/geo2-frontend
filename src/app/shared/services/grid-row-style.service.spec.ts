import { TestBed } from "@angular/core/testing";

import { GridRowStyleService } from "./grid-row-style.service";

describe("GridRowStyleService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: GridRowStyleService = TestBed.inject(GridRowStyleService);
    expect(service).toBeTruthy();
  });
});
