import { TestBed } from "@angular/core/testing";

import { CodesPromoService } from "./codes-promo.service";

describe("CodesPromoService", () => {
  let service: CodesPromoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodesPromoService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
