import { TestBed } from "@angular/core/testing";

import { GridsService } from "./grids.service";

describe("GridsService", () => {
  let service: GridsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
