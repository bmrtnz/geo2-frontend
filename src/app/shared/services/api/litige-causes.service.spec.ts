import { TestBed } from "@angular/core/testing";

import { LitigeCausesService } from "./litige-causes.service";

describe("LitigeCausesService", () => {
  let service: LitigeCausesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LitigeCausesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
