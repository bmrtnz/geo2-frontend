import { TestBed } from "@angular/core/testing";

import { OrdresEdiService } from "./ordres-edi.service";

describe("OrdresEdiService", () => {
  let service: OrdresEdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdresEdiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
