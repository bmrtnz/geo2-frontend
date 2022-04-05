import { TestBed } from "@angular/core/testing";

import { TypesFraisService } from "./types-frais.service";

describe("TypesFraisService", () => {
  let service: TypesFraisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypesFraisService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
