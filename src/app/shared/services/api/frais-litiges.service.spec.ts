import { TestBed } from "@angular/core/testing";

import { FraisLitigesService } from "./frais-litiges.service";

describe("FraisLitigesService", () => {
  let service: FraisLitigesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FraisLitigesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
