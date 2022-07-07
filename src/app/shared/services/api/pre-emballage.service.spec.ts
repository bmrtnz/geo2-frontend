import { TestBed } from "@angular/core/testing";

import { PreEmballageService } from "./pre-emballage.service";

describe("PreEmballageService", () => {
  let service: PreEmballageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreEmballageService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
