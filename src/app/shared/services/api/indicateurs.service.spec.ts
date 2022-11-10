import { TestBed } from "@angular/core/testing";

import { IndicateursService } from "./indicateurs.service";

describe("IndicateursService", () => {
  let service: IndicateursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicateursService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
