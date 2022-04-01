import { TestBed } from "@angular/core/testing";

import { TypesTiersService } from "./types-tiers.service";

describe("TypesTiersService", () => {
  let service: TypesTiersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypesTiersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
