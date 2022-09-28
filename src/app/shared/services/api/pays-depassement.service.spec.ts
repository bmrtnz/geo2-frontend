import { TestBed } from "@angular/core/testing";

import { PaysDepassementService } from "./pays-depassement.service";

describe("PaysDepassementService", () => {
  let service: PaysDepassementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaysDepassementService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
