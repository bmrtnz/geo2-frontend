import { TestBed } from "@angular/core/testing";

import { CodifsDevalexpService } from "./codifs-devalexp.service";

describe("CodifsDevalexpService", () => {
  let service: CodifsDevalexpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodifsDevalexpService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
